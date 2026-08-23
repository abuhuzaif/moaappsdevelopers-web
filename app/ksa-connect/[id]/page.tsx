"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";
import { useAuth } from "@/lib/useAuth";
import { ADMIN_EMAILS, isAdmin } from "@/lib/admin";

const IS_KSA_CONNECT_SITE = process.env.NEXT_PUBLIC_SITE_MODE === "ksaconnect";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "listings", id));
        if (!snap.exists()) {
          setError("This listing doesn't exist or has been removed.");
        } else {
          setListing({ id: snap.id, ...snap.data() } as Listing);

          // Count a view once per browser session per listing, so refreshing
          // the page repeatedly doesn't inflate the number artificially.
          const key = `viewed_${id}`;
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            updateDoc(doc(db, "listings", id), { views: increment(1) }).catch(() => {
              // Non-critical — don't block the page if this write fails.
            });
          }
        }
      } catch (err: any) {
        setError(err.message ?? "Couldn't load this listing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const canManage = !!user && !!listing && (user.uid === listing.userId || isAdmin(user));

  async function handleDelete() {
    if (!listing) return;
    if (!confirm("Delete this listing permanently? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "listings", listing.id));
      router.push("/ksa-connect");
    } catch (err: any) {
      alert(err.message ?? "Couldn't delete this listing.");
      setDeleting(false);
    }
  }

  // Product JSON-LD — lets Google show price/availability/image as a rich
  // result in search, and helps AI answer engines understand each listing.
  // "negotiable"/price-on-request listings get no numeric price (Google
  // disallows fake prices), everything else gets a SAR offer.
  const listingSchema = listing
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: listing.title,
        description: listing.description || `${listing.subCategory} in ${listing.city} — ${listing.category} listing on KSA-Connect.`,
        image: listing.imageUrls?.length ? listing.imageUrls : undefined,
        category: `${listing.category} > ${listing.subCategory}`,
        url: `https://www.myksaconnect.com/ksa-connect/${listing.id}`,
        ...(!listing.negotiable && listing.price
          ? {
              offers: {
                "@type": "Offer",
                price: listing.price,
                priceCurrency: "SAR",
                availability: "https://schema.org/InStock",
                areaServed: listing.city,
                url: `https://www.myksaconnect.com/ksa-connect/${listing.id}`,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {listingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        />
      )}

      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">{IS_KSA_CONNECT_SITE ? "K" : "M"}</div>
          {IS_KSA_CONNECT_SITE ? "KSA-Connect" : "MOA Apps Developer's"}
        </a>
      </nav>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <a href="/ksa-connect" style={{ display: "inline-block", margin: "20px 0", color: "var(--navy)", fontWeight: 600, fontSize: 14 }}>
          ← Back to listings
        </a>

        {canManage && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <a
              href={`/ksa-connect/post?edit=${listing!.id}`}
              className="btn btn-outline"
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              ✏️ Edit Listing
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn"
              style={{
                fontSize: 13,
                padding: "8px 16px",
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              {deleting ? "Deleting…" : "🗑️ Delete"}
            </button>
            {isAdmin(user) && listing!.userId !== user?.uid && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  alignSelf: "center",
                }}
              >
                (admin mode)
              </span>
            )}
          </div>
        )}

        {loading && <p>Loading…</p>}
        {error && <div className="empty-state">{error}</div>}

        {listing && (
          <div>
            {listing.imageUrls?.length > 0 ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.imageUrls[activeImage]}
                  alt={listing.title}
                  style={{ width: "100%", maxHeight: 420, objectFit: "contain", background: "#e5e7eb", borderRadius: 14 }}
                />
                {listing.imageUrls.length > 1 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {listing.imageUrls.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={url}
                        alt=""
                        onClick={() => setActiveImage(i)}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 8,
                          cursor: "pointer",
                          border: activeImage === i ? "2px solid var(--gold)" : "1px solid var(--border)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: "100%", height: 300, background: "#e5e7eb", borderRadius: 14 }} />
            )}

            <div style={{ marginTop: 20 }}>
              <span className="pill">
                {listing.category} · {listing.subCategory}
              </span>
              {listing.createdAt && (
                <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  Posted {timeAgo(listing.createdAt)}
                </span>
              )}
              {!!listing.views && (
                <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  👁️ {listing.views} {listing.views === 1 ? "view" : "views"}
                </span>
              )}
              <h1 style={{ fontSize: 24, margin: "12px 0 4px" }}>{listing.title}</h1>
              <p style={{ color: "var(--navy)", fontWeight: 800, fontSize: 22, margin: "0 0 8px" }}>
                {formattedPrice(listing)}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                📍 {listing.city} · {listing.location}
              </p>

              {listing.description && (
                <>
                  <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border)" }} />
                  <h3 style={{ fontSize: 16 }}>Description</h3>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {listing.description}
                  </p>
                </>
              )}

              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border)" }} />
              <h3 style={{ fontSize: 16 }}>Seller Information</h3>
              {(() => {
                const isAdminListing =
                  !!listing.userEmail && ADMIN_EMAILS.includes(listing.userEmail.toLowerCase());
                const displayName = isAdminListing ? "KSA-Connect Team" : listing.userName;

                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                    {isAdminListing ? (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "var(--navy)",
                          color: "var(--gold)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                        }}
                      >
                        🛡️
                      </div>
                    ) : listing.userPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.userPhoto}
                        alt=""
                        style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "var(--navy)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {listing.userName?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{displayName}</p>
                      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>+966{listing.phone}</p>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <a href={`tel:+966${listing.phone}`} className="btn btn-outline">
                  Call
                </a>
                <a
                  href={`https://wa.me/966${listing.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  className="btn btn-gold"
                >
                  WhatsApp
                </a>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
                For in-app chat and more features,{" "}
                <a
                  href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect"
                  target="_blank"
                  style={{ textDecoration: "underline" }}
                >
                  get the KSA-Connect app
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
