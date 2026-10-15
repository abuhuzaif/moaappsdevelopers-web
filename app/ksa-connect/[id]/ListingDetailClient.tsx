"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { doc, deleteDoc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";
import { useAuth } from "@/lib/useAuth";
import { ADMIN_EMAILS, isAdmin } from "@/lib/admin";
import { trackAnalyticsEvent } from "@/lib/analytics";

const IS_KSA_CONNECT_SITE = process.env.NEXT_PUBLIC_SITE_MODE === "ksaconnect";

// Brand logos for the "live in N places" box
function BrandIcon({ name }: { name: "web" | "app" | "facebook" | "instagram" | "youtube" | "tiktok" }) {
  const size = 28;
  if (name === "web") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/ksa-logo.png" alt="" width={size} height={size} style={{ borderRadius: "50%", flex: "none" }} />;
  }
  if (name === "app") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
        <rect width="24" height="24" rx="6" fill="#3DDC84" />
        <path
          fill="#fff"
          d="M7.2 10.2h9.6v5.6c0 .5-.4.9-.9.9h-.7v2c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2h-1.6v2c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-2h-.7c-.5 0-.9-.4-.9-.9v-5.6zm-1.4 0c.5 0 .9.4.9.9v3.6c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-3.6c0-.5.4-.9.9-.9zm12.4 0c.5 0 .9.4.9.9v3.6c0 .5-.4.9-.9.9s-.9-.4-.9-.9v-3.6c0-.5.4-.9.9-.9zM14.6 5.5l.8-1.4c.1-.1 0-.3-.1-.4-.1-.1-.3 0-.4.1l-.8 1.4c-.6-.3-1.3-.4-2.1-.4s-1.5.1-2.1.4l-.8-1.4c-.1-.1-.3-.2-.4-.1-.1.1-.2.3-.1.4l.8 1.4c-1.4.7-2.3 2-2.3 3.6h9.8c0-1.6-.9-2.9-2.3-3.6zM10 7.8a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm4 0a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z"
        />
      </svg>
    );
  }
  if (name === "youtube") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
        <rect width="24" height="24" rx="6" fill="#FF0000" />
        <path fill="#fff" d="M10 8.3v7.4l6.2-3.7z" />
      </svg>
    );
  }
  if (name === "tiktok") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
        <rect width="24" height="24" rx="6" fill="#000" />
        <path fill="#25F4EE" transform="translate(-0.6 -0.4)" d="M15.6 6.6a3 3 0 0 1-.8-2h-2.2v9a1.9 1.9 0 1 1-1.9-1.9l.6.1V9.5l-.6-.1a4.2 4.2 0 1 0 4.2 4.2V9.1a5.2 5.2 0 0 0 3 1V7.9a3 3 0 0 1-2.3-1.3z" />
        <path fill="#FE2C55" transform="translate(0.6 0.4)" d="M15.6 6.6a3 3 0 0 1-.8-2h-2.2v9a1.9 1.9 0 1 1-1.9-1.9l.6.1V9.5l-.6-.1a4.2 4.2 0 1 0 4.2 4.2V9.1a5.2 5.2 0 0 0 3 1V7.9a3 3 0 0 1-2.3-1.3z" />
        <path fill="#fff" d="M15.6 6.6a3 3 0 0 1-.8-2h-2.2v9a1.9 1.9 0 1 1-1.9-1.9l.6.1V9.5l-.6-.1a4.2 4.2 0 1 0 4.2 4.2V9.1a5.2 5.2 0 0 0 3 1V7.9a3 3 0 0 1-2.3-1.3z" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
        <circle cx="12" cy="12" r="12" fill="#1877F2" />
        <path fill="#fff" d="M13.4 19v-6h2l.3-2.4h-2.3V9.1c0-.7.2-1.2 1.2-1.2h1.2V5.8c-.2 0-1-.1-1.8-.1-1.8 0-3 1.1-3 3.1v1.8h-2V13h2v6h2.4z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
      <defs>
        <radialGradient id="igGrad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igGrad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16" cy="8" r="1" fill="#fff" />
    </svg>
  );
}

export default function ListingDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Live listener: the page updates by itself when Make.com writes back the
  // Facebook / Instagram post links (the "live in N places" box).
  useEffect(() => {
    if (!id) return;
    let counted = false;
    const unsub = onSnapshot(
      doc(db, "listings", id),
      (snap) => {
        if (!snap.exists()) {
          setListing(null);
          setError("This listing doesn't exist or has been removed.");
        } else {
          setError(null);
          setListing({ id: snap.id, ...snap.data() } as Listing);
          if (!counted) {
            counted = true;
            const key = `viewed_${id}`;
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "1");
              updateDoc(doc(db, "listings", id), { views: increment(1) }).catch(() => {});
            }
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Couldn't load this listing.");
        setLoading(false);
      }
    );
    return unsub;
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
          {IS_KSA_CONNECT_SITE ? "MYKSA-Connect" : "MOA Apps Developer's"}
        </a>
      </nav>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <a href="/ksa-connect" style={{ display: "inline-block", margin: "20px 0", color: "var(--navy)", fontWeight: 600, fontSize: 14 }}>
          ← Back to listings
        </a>

        {canManage && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <a href={`/ksa-connect/post?edit=${listing!.id}`} className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
              ✏️ Edit Listing
            </a>
            <button onClick={handleDelete} disabled={deleting} className="btn" style={{ fontSize: 13, padding: "8px 16px", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" }}>
              {deleting ? "Deleting…" : "🗑️ Delete"}
            </button>
            {isAdmin(user) && listing!.userId !== user?.uid && <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>(admin mode)</span>}
          </div>
        )}

        {loading && <p>Loading…</p>}
        {error && <div className="empty-state">{error}</div>}

        {listing && (
          <div
            style={{
              // Black frame with a gold line outside and a thin gold line inside (MYKSA Connect colours)
              border: "2px solid #0b0b0b",
              boxShadow: "0 0 0 1.5px #d4a017, inset 0 0 0 1px #d4a017, 0 12px 30px rgba(0,0,0,0.10)",
              borderRadius: 16,
              padding: "clamp(12px, 3vw, 22px)",
              background: "#fff",
              margin: "6px 3px 0",
            }}
          >
            {listing.imageUrls?.length > 0 ? (
              <div>
                <div style={{ position: "relative", width: "100%", height: 420, background: "#e5e7eb", borderRadius: 14, overflow: "hidden" }}>
                  <Image src={listing.imageUrls[activeImage]} alt={listing.title} fill sizes="(max-width: 760px) 100vw, 760px" style={{ objectFit: "contain" }} priority />
                </div>
                {listing.imageUrls.length > 1 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {listing.imageUrls.map((url, i) => (
                      <div key={i} onClick={() => setActiveImage(i)} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: activeImage === i ? "2px solid var(--gold)" : "1px solid var(--border)" }}>
                        <Image src={url} alt="" fill sizes="64px" style={{ objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: "100%", height: 300, background: "#e5e7eb", borderRadius: 14 }} />
            )}

            <div
              style={{
                marginTop: 20,
                // Faint MYKSA Connect logo behind the ad details (text stays fully readable)
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.93), rgba(255,255,255,0.93)), url(/ksa-logo.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center 120px",
                backgroundSize: "100% 100%, min(70%, 360px)",
              }}
            >
              <span className="pill">{listing.category} · {listing.subCategory}</span>
              {listing.createdAt && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>Posted {timeAgo(listing.createdAt)}</span>}
              {/* View count: admins only for now */}
              {isAdmin(user) && !!listing.views && <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>👁️ {listing.views} {listing.views === 1 ? "view" : "views"}</span>}
              <h1 style={{ fontSize: 24, margin: "12px 0 4px" }}>{listing.title}</h1>
              <p style={{ color: "var(--navy)", fontWeight: 800, fontSize: 22, margin: "0 0 8px" }}>{formattedPrice(listing)}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>📍 {listing.city} · {listing.location}</p>

              {listing.description && (
                <>
                  <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border)" }} />
                  <h3 style={{ fontSize: 16 }}>Description</h3>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{listing.description}</p>
                </>
              )}

              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--border)" }} />
              <h3 style={{ fontSize: 16 }}>Seller Information</h3>
              {(() => {
                const isAdminListing = !!listing.userEmail && ADMIN_EMAILS.includes(listing.userEmail.toLowerCase());
                // Owner opted in (via the "Show my email to buyers" checkbox on the
                // post form) and this isn't an admin listing, which never shows
                // contact details beyond the phone number.
                const showEmail = !isAdminListing && !!(listing as any).showEmail && !!listing.userEmail;

                if (isAdminListing) {
                  // Admin-posted listings show only the phone number — no name,
                  // no "KSA-Connect Team" label, no avatar.
                  return (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>+966{listing.phone}</p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                    {listing.userPhoto ? (
                      <div style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", overflow: "hidden" }}>
                        <Image src={listing.userPhoto} alt="" fill sizes="44px" style={{ objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--navy)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {listing.userName?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{listing.userName}</p>
                      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>+966{listing.phone}</p>
                      {showEmail && (
                        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>{listing.userEmail}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                <a
                  href={`tel:+966${listing.phone}`}
                  onClick={() => trackAnalyticsEvent("phone_click", { listing_id: listing.id, listing_category: listing.category, listing_city: listing.city })}
                  style={{
                    flex: "1 1 140px", textAlign: "center", padding: "12px 18px", borderRadius: 12,
                    border: "2px solid #005744", color: "#005744", background: "#fff",
                    fontWeight: 800, fontSize: 15, textDecoration: "none",
                  }}
                >
                  📞 Call
                </a>
                <a
                  href={`https://wa.me/966${listing.phone.replace(/[^0-9]/g, "")}`}
                  onClick={() => trackAnalyticsEvent("whatsapp_click", { listing_id: listing.id, listing_category: listing.category, listing_city: listing.city })}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: "1 1 140px", textAlign: "center", padding: "12px 18px", borderRadius: 12,
                    background: "#25D366", color: "#fff", border: "2px solid #25D366",
                    fontWeight: 800, fontSize: 15, textDecoration: "none",
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
              {/* Where this ad is live (website, app, Facebook, Instagram) */}
              {(() => {
                const fbPostId: string | undefined = (listing as any).fbPostId;
                const igUrl: string | undefined = (listing as any).igPermalink;
                const fbUrl = fbPostId
                  ? fbPostId.includes("_")
                    ? `https://www.facebook.com/${fbPostId.split("_")[0]}/posts/${fbPostId.split("_")[1]}`
                    : `https://www.facebook.com/${fbPostId}`
                  : undefined;
                const isOwner = !!user && user.uid === listing.userId;
                const places = [
                  { icon: "web" as const, name: "MYKSA Connect website", href: undefined as string | undefined, done: true },
                  { icon: "app" as const, name: "MYKSA-Connect app", href: "https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect", done: true },
                  { icon: "facebook" as const, name: "Facebook", href: fbUrl, done: !!fbUrl },
                  { icon: "instagram" as const, name: "Instagram", href: igUrl ?? (fbUrl ? "https://www.instagram.com/myksaconnect" : undefined), done: !!igUrl || !!fbUrl },
                  // Our channels — follow cards (ads are not auto-posted here, so they don't count as "live")
                  { icon: "youtube" as const, name: "YouTube", href: "https://www.youtube.com/@MYKSACONNECT" as string | undefined, done: false, follow: true },
                  { icon: "tiktok" as const, name: "TikTok", href: "https://www.tiktok.com/@moa70391" as string | undefined, done: false, follow: true },
                ];
                const liveCount = places.filter((p) => p.done).length;
                const shareText = encodeURIComponent(`${listing.title}\nhttps://www.myksaconnect.com/ksa-connect/${listing.id}`);

                return (
                  <div
                    style={{
                      marginTop: 24, padding: "16px", borderRadius: 14,
                      background: "linear-gradient(135deg, #f1f7f4, #fffaf0)",
                      border: "1.5px solid #cfe3da",
                    }}
                  >
                    <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 16, color: "#0b3d2e" }}>
                      {isOwner ? `🎉 Your ad is live in ${liveCount} places!` : `📢 This ad is live in ${liveCount} places`}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                      {places
                        .map((p) => {
                          const inner = (
                            <>
                              <BrandIcon name={p.icon} />
                              <span style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ display: "block", fontSize: 13.5, color: "#0c1730" }}>{p.name}</strong>
                                <small style={{ fontSize: 12, color: "follow" in p ? "#1d4ed8" : p.done ? "#15803d" : "#b45309" }}>
                                  {"follow" in p ? "Follow us →" : p.done ? (p.href ? "✓ Live · View →" : "✓ Live") : "⏳ Posting…"}
                                </small>
                              </span>
                            </>
                          );
                          const box = {
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                            borderRadius: 10, background: "#fff", border: "1px solid #e2ece7", textDecoration: "none",
                          } as const;
                          return p.href ? (
                            <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" style={box}>{inner}</a>
                          ) : (
                            <div key={p.name} style={box}>{inner}</div>
                          );
                        })}
                    </div>
                    {(
                      <a
                        href={`https://wa.me/?text=${shareText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block", marginTop: 12, textAlign: "center", padding: "10px 14px", borderRadius: 10,
                          background: "#0c1730", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none",
                        }}
                      >
                        📤 {isOwner ? "Share your ad on WhatsApp" : "Share this ad on WhatsApp"}
                      </a>
                    )}
                  </div>
                );
              })()}

              {/* Safety notice — shown at the end of every listing (same as the app) */}
              <div
                role="note"
                style={{
                  marginTop: 24,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "#FEF2F2",
                  border: "1.5px solid #DC2626",
                  color: "#DC2626",
                }}
              >
                <p style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 16 }}>⚠️ Be Aware</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
                  MYKSA CONNECT provides free listings and is not responsible for fraud or disputes.
                  Please verify all details before paying or finalizing any deal.
                </p>
              </div>

              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
                For in-app chat and more features,{" "}
                <a href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect" target="_blank" style={{ textDecoration: "underline" }}>get the MYKSA-Connect app</a>.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
