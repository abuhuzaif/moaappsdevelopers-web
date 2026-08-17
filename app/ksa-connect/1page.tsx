"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";

const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Jubail", "Yanbu", "Madinah"];
const CATEGORIES = ["Housing", "Car", "Household", "Buy & Sell", "Services", "Classifieds"];
const CATEGORY_ICONS: Record<string, string> = {
  Housing: "🏠",
  Car: "🚗",
  Household: "🛋️",
  "Buy & Sell": "🛍️",
  Services: "🛠️",
  Classifieds: "🏷️",
};
const TRENDING_KEYWORDS = [
  "Villa",
  "Apartment",
  "Toyota",
  "Furniture",
  "Cleaning",
  "Studio Room",
  "Sofa Set",
  "Driver",
];

export default function KsaConnectPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Checkbox filters — empty set means "no filter applied" (show all).
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high">("newest");
  const [citiesExpanded, setCitiesExpanded] = useState(false);

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

  function toggle(set: Set<string>, setFn: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setFn(next);
  }

  function clearAll() {
    setCities(new Set());
    setCategories(new Set());
    setSearch("");
  }

  const hasActiveFilters = cities.size > 0 || categories.size > 0 || search.trim().length > 0;

  function handleTrendingClick(keyword: string) {
    setSearch(keyword);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  const filtered = listings
    .filter((l) => {
      if (cities.size > 0 && !cities.has(l.city)) return false;
      if (categories.size > 0 && !categories.has(l.category)) return false;
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
      <div className="hero-outer">
        <div className="hero-photo-box">
          <div
            className="hero-photo-inner"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(6,11,22,0.95) 0%, rgba(6,11,22,0.88) 32%, rgba(6,11,22,0.5) 50%, rgba(6,11,22,0.15) 62%, rgba(6,11,22,0.05) 100%), url('/images/ksa-connect-hero.png')",
              position: "relative",
            }}
          >
            <a href="/" className="hero-brand-overlay">
              <div className="brand-badge">M</div>
              MOA Apps Developer&apos;s
            </a>
            <div className="container" style={{ paddingBottom: 8, paddingTop: 56, margin: "0 auto 0 0" }}>
              <h1 style={{ textAlign: "left", maxWidth: 320 }}>
                KSA<span className="gold">-Connect</span>
              </h1>
              <p style={{ textAlign: "left", maxWidth: 300, margin: "0 0 20px" }}>
                Browse live listings across Saudi Arabia. Post or chat from the app.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                <a href="#listings" className="btn btn-pink">
                  Browse Ads
                </a>
                <a href="/ksa-connect/post" className="btn btn-pink-outline">
                  Post an Ad
                </a>
              </div>
              <div className="stats-row" style={{ justifyContent: "flex-start", gap: 32, marginTop: 0 }}>
                <div className="stat">
                  <p className="stat-value">{CITIES.length}</p>
                  <p className="stat-label">Cities Covered</p>
                </div>
                <div className="stat">
                  <p className="stat-value">{listings.length}+</p>
                  <p className="stat-label">Active Listings</p>
                </div>
                <div className="stat">
                  <p className="stat-value">{CATEGORIES.length}</p>
                  <p className="stat-label">Categories</p>
                </div>
              </div>
            </div>

            {/* ── Search bar + trending keywords, merged into the photo (functional) ── */}
            <div className="hero-search-overlay">
              <div className="hero-search-row">
                <div className="hero-search-field">
                  <span className="hero-search-icon">📍</span>
                  <select
                    value={cities.size === 1 ? Array.from(cities)[0] : ""}
                    onChange={(e) =>
                      setCities(e.target.value ? new Set([e.target.value]) : new Set())
                    }
                  >
                    <option value="">Select a city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hero-search-field">
                  <span className="hero-search-icon">🏷️</span>
                  <select
                    value={categories.size === 1 ? Array.from(categories)[0] : ""}
                    onChange={(e) =>
                      setCategories(e.target.value ? new Set([e.target.value]) : new Set())
                    }
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hero-search-field" style={{ flex: 1.4 }}>
                  <span className="hero-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Type your keyword"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <a href="#listings" className="hero-search-submit">
                  Search
                </a>
              </div>

              <div className="hero-trending-row">
                <span className="hero-trending-label">Trending Keywords:</span>
                {TRENDING_KEYWORDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className="hero-trending-chip"
                    onClick={() => handleTrendingClick(k)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container" style={{ marginTop: 32 }}>
        {/* Matrimonial promo — feature lives only in the app, this is just
            an advertisement/CTA, no profiles are shown here. */}
        <div
          style={{
            marginTop: 24,
            padding: "20px 24px",
            borderRadius: 14,
            background: "linear-gradient(120deg, var(--matrimonial-deep), var(--matrimonial))",
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
                    <div className="featured-image featured-image-empty" />
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

        {/* ── Sidebar filters + main listing grid ── */}
        <div className="listings-layout" id="listings">
          <aside className="filters-sidebar">
            <a href="/ksa-connect/post" className="sidebar-post-ad-btn">
              <span>➕</span> Post an Ad
            </a>
            <p className="filters-sidebar-title">
              Filters
              {hasActiveFilters && (
                <button className="clear-filters" onClick={clearAll}>
                  Clear All
                </button>
              )}
            </p>

            <div className="filter-group">
              <p className="filter-group-title">City</p>
              {(citiesExpanded ? CITIES : CITIES.slice(0, 5)).map((c) => (
                <label
                  className={`checkbox-row${cities.has(c) ? " checkbox-row-active" : ""}`}
                  key={c}
                >
                  <input
                    type="checkbox"
                    checked={cities.has(c)}
                    onChange={() => toggle(cities, setCities, c)}
                  />
                  {c}
                </label>
              ))}
              {CITIES.length > 5 && (
                <button
                  type="button"
                  className="view-more-toggle"
                  onClick={() => setCitiesExpanded((v) => !v)}
                >
                  {citiesExpanded ? "View less ˄" : "View more ˅"}
                </button>
              )}
            </div>

            <div className="filter-group">
              <p className="filter-group-title">Category</p>
              {CATEGORIES.map((c) => (
                <label
                  className={`checkbox-row${categories.has(c) ? " checkbox-row-active" : ""}`}
                  key={c}
                >
                  <input
                    type="checkbox"
                    checked={categories.has(c)}
                    onChange={() => toggle(categories, setCategories, c)}
                  />
                  <span className="checkbox-icon">{CATEGORY_ICONS[c]}</span>
                  {c}
                </label>
              ))}
            </div>
          </aside>

          <div className="listings-main">
            <div className="listings-topbar">
              <input
                className="search-input"
                type="text"
                placeholder="Search listings by title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 180 }}
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
                Showing {filtered.length} of {listings.length} listing{listings.length === 1 ? "" : "s"}
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
                  <div className="listing-card" key={l.id}>
                    <div style={{ position: "relative" }}>
                      {l.imageUrls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.imageUrls[0]} alt={l.title} className="listing-image" />
                      ) : (
                        <div className="listing-image listing-image-empty" />
                      )}
                      {l.createdAt && <span className="date-badge">{timeAgo(l.createdAt)}</span>}
                      <button className="heart-btn" aria-label="Save listing" title="Save (visual only for now)">
                        🤍
                      </button>
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
          </div>
        </div>
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
