"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";

const CITIES = ["All", "Riyadh", "Jeddah", "Dammam", "Khobar", "Jubail", "Yanbu", "Madinah"];
const CATEGORIES = ["All", "Housing", "Car", "Household", "Buy & Sell", "Services", "Classifieds"];

export default function KsaConnectPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high">("newest");

  useEffect(() => {
    const q = query(
      collection(db, "listings"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(60)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Listing[];
        setListings(data);
        setLoading(false);
      },
      (err) => {
        // Common cause: Firestore security rules don't allow public read
        // access, or NEXT_PUBLIC_FIREBASE_* env vars aren't set correctly.
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "listings"),
      where("status", "==", "active"),
      where("isFeatured", "==", true),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      setFeatured(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Listing[]);
    });
    return () => unsub();
  }, []);

  const filtered = listings
    .filter((l) => {
      if (city !== "All" && l.city !== city) return false;
      if (category !== "All" && l.category !== category) return false;
      if (search.trim() && !l.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price_low") return a.price - b.price;
      if (sort === "price_high") return b.price - a.price;
      return 0; // "newest" — already ordered by Firestore query
    });

  return (
    <>
      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">M</div>
          MOA Apps Developer&apos;s
        </a>
      </nav>

      <section className="hero" style={{ padding: "40px 0 56px" }}>
        <div className="container">
          <h1 style={{ fontSize: 32 }}>
            KSA<span className="gold">-Connect</span>
          </h1>
          <p>Browse live listings across Saudi Arabia. Post or chat from the app.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/ksa-connect/post" className="btn btn-gold" style={{ marginTop: 16 }}>
              Post a Listing
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect"
              target="_blank"
              className="btn btn-outline"
              style={{ marginTop: 16 }}
            >
              Get the app to chat with sellers
            </a>
          </div>
        </div>
      </section>

      <main className="container">
        {/* Matrimonial promo — feature lives only in the app, this is just
            an advertisement/CTA, no profiles are shown here. */}
        <div
          style={{
            marginTop: 24,
            padding: "20px 24px",
            borderRadius: 14,
            background: "linear-gradient(120deg, var(--navy-deep), var(--navy))",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>
              💍 Looking for a life partner?
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
              KSA-Connect&apos;s Wali-approved Matrimonial matching is available exclusively
              in the app — private, respectful, and secure.
            </p>
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect"
            target="_blank"
            className="btn btn-gold"
            style={{ whiteSpace: "nowrap" }}
          >
            Explore in the app
          </a>
        </div>

        {featured.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 12px" }}>⭐ Featured Listings</p>
            <div className="featured-scroll">
              {featured.map((l) => (
                <a href={`/ksa-connect/${l.id}`} key={l.id} className="featured-card">
                  {l.imageUrls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrls[0]} alt={l.title} className="featured-image" />
                  ) : (
                    <div className="featured-image" />
                  )}
                  <span className="featured-tag">⭐ Featured</span>
                  <div className="listing-body">
                    <p className="listing-title">{l.title}</p>
                    <p className="listing-price">{formattedPrice(l)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="filters" style={{ marginTop: 24 }}>
          {CITIES.map((c) => (
            <button
              key={c}
              className={`filter-chip ${city === c ? "active" : ""}`}
              onClick={() => setCity(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filters">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-chip ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search listings by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="newest">Newest first</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {!loading && !error && (
          <p className="results-count">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"} found
          </p>
        )}

        {loading && (
          <div className="listing-grid">
            {Array.from({ length: 8 }).map((_, i) => (
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
            <br />
            <span style={{ fontSize: 12 }}>
              (Check Firestore security rules allow public reads, and that your .env.local
              Firebase config is correct.)
            </span>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            No listings found. Try a different city, category, or search term.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="listing-grid">
            {filtered.map((l) => (
              <a href={`/ksa-connect/${l.id}`} className="listing-card" key={l.id} style={{ display: "block" }}>
                <div style={{ position: "relative" }}>
                  {l.imageUrls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrls[0]} alt={l.title} className="listing-image" />
                  ) : (
                    <div className="listing-image" />
                  )}
                  {l.createdAt && (
                    <span className="date-badge">{timeAgo(l.createdAt)}</span>
                  )}
                </div>
                <div className="listing-body">
                  <p className="listing-title">{l.title}</p>
                  <p className="listing-price">{formattedPrice(l)}</p>
                  <p className="listing-location">
                    {l.city} · {l.location}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          <a href="/ksa-connect/privacy">Privacy Policy</a> ·{" "}
          <a href="mailto:abuman.moa@gmail.com">Contact</a>
        </p>
      </footer>
    </>
  );
}
