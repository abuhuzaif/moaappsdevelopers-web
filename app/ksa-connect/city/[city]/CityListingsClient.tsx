"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";

type Props = {
  citySlug: string;
  cityValue: string | null;
};

export default function CityListingsClient({ citySlug, cityValue }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityValue) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "listings"),
      where("status", "==", "active"),
      where("city", "==", cityValue),
      orderBy("createdAt", "desc"),
      limit(60)
    );

    return onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Listing[];
        setListings(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [cityValue]);

  // ItemList JSON-LD scoped to this city's listings — helps this page be
  // eligible for rich results and gives AI answer engines a clear signal
  // that this URL is specifically about classifieds in this city.
  const citySchema = useMemo(() => {
    if (!cityValue || listings.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `KSA-Connect Listings in ${cityValue}`,
      itemListElement: listings.slice(0, 30).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.myksaconnect.com/ksa-connect/${l.id}`,
        name: l.title,
      })),
    };
  }, [listings, cityValue]);

  if (!cityValue) {
    return (
      <div className="mk-page">
        <nav className="nav container">
          <a href="/" className="brand">
            <div className="brand-badge">K</div>
            KSA-Connect
          </a>
        </nav>
        <main className="container" style={{ padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>City not found</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            We couldn&apos;t find listings for &quot;{citySlug}&quot;.
          </p>
          <a href="/ksa-connect" className="btn btn-gold">
            Browse all listings
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="mk-page">
      {citySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }}
        />
      )}

      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          KSA-Connect
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>
            Classifieds in <span className="gold">{cityValue}</span>
          </h1>
          <p>Housing, cars, jobs, and more — posted by the {cityValue} community.</p>
        </div>
      </section>

      <main className="container" style={{ paddingBottom: 60 }}>
        <p style={{ margin: "20px 0", fontSize: 14 }}>
          <a href="/ksa-connect" style={{ color: "var(--navy)", fontWeight: 600 }}>
            ← Browse all cities
          </a>
          {" · "}
          <a href="/ksa-connect/post" style={{ color: "var(--navy)", fontWeight: 600 }}>
            + Post an Ad in {cityValue}
          </a>
        </p>

        {!loading && !error && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
            {listings.length} listing{listings.length === 1 ? "" : "s"} in {cityValue}
          </p>
        )}

        {loading && (
          <div className="listing-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="skeleton-card" key={i}>
                <div className="skeleton skeleton-image" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                  <div className="skeleton skeleton-line" style={{ width: "50%" }} />
                  <div className="skeleton skeleton-line" style={{ width: "65%", marginBottom: 0 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="empty-state" style={{ color: "#b91c1c" }}>
            Couldn&apos;t load listings: {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            No listings in {cityValue} yet.{" "}
            <a href="/ksa-connect/post" style={{ textDecoration: "underline" }}>
              Be the first to post one
            </a>
            .
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="listing-grid">
            {listings.map((l) => (
              <div className="listing-card" key={l.id}>
                <div style={{ position: "relative" }}>
                  {l.imageUrls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrls[0]} alt={l.title} className="listing-image" />
                  ) : (
                    <div className="listing-image listing-image-empty" />
                  )}
                  {l.createdAt && <span className="date-badge">{timeAgo(l.createdAt)}</span>}
                </div>
                <div className="listing-body">
                  <p className="listing-category-tag">{l.category}</p>
                  <p className="listing-title">{l.title}</p>
                  <p className="listing-price">{formattedPrice(l)}</p>
                  <p className="listing-location">
                    {l.city} · {l.location}
                  </p>
                  <a href={`/ksa-connect/${l.id}`} className="view-details-btn">
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          <a href="/ksa-connect/privacy">Privacy Policy</a> ·{" "}
          <a href="/ksa-connect/safety">Safety &amp; Fraud Prevention</a>
        </p>
      </footer>
    </div>
  );
}
