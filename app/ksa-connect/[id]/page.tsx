"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";

// Same admin emails used in the Flutter app and Firestore rules — listings
// posted from these accounts show "KSA-Connect Team" instead of the real
// name/photo, everywhere the seller is displayed.
const ADMIN_EMAILS = ["abuman.moa@gmail.com", "abuhuzaif@gmail.com"];

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "listings", id));
        if (!snap.exists()) {
          setError("This listing doesn't exist or has been removed.");
        } else {
          setListing({ id: snap.id, ...snap.data() } as Listing);
        }
      } catch (err: any) {
        setError(err.message ?? "Couldn't load this listing.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <>
      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">M</div>
          MOA Apps Developer&apos;s
        </a>
      </nav>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <a href="/ksa-connect" style={{ display: "inline-block", margin: "20px 0", color: "var(--navy)", fontWeight: 600, fontSize: 14 }}>
          ← Back to listings
        </a>

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
