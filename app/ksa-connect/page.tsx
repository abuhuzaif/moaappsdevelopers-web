"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";

const CITY_OPTIONS = [
  { value: "Madinah", label: "Madina", image: "madina" },
  { value: "Riyadh", label: "Riyadh", image: "riyadh" },
  { value: "Jeddah", label: "Jeddah", image: "jeddah" },
  { value: "Dammam", label: "Dammam", image: "dammam" },
  { value: "Khobar", label: "Khobar", image: "khobar" },
  { value: "Jubail", label: "Jubail", image: "jubail" },
  { value: "Yanbu", label: "Yanbu", image: "yanbu" },
];

const CATEGORIES = ["Housing", "Car", "Household", "Buy & Sell", "Services", "Electronics", "Jobs", "Community", "Classifieds"];
const TRENDING_KEYWORDS = ["Villa", "Apartment", "Toyota", "iPhone", "Sofa Set", "Driver", "Room Rent", "Labour", "Furniture"];

const CATEGORY_CARDS = [
  ["⌂", "Housing", "Rent, Sale", "Housing"],
  ["🚗", "Cars", "Buy & Sell", "Car"],
  ["▣", "Electronics", "Mobiles, Laptops", "Electronics"],
  ["⚒", "Services", "Home, Repair", "Services"],
  ["▤", "Jobs", "Drivers, Labour", "Jobs"],
  ["♙", "Community", "Groups, Events", "Community"],
  ["•••", "Others", "More Ads", "Classifieds"],
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  Housing: "🏠",
  Car: "🚗",
  Household: "🛋️",
  "Buy & Sell": "🛍️",
  Services: "🛠️",
  Electronics: "💻",
  Jobs: "💼",
  Community: "👥",
  Classifieds: "🏷️",
};

type SortMode = "newest" | "price_low" | "price_high";

export default function KsaConnectPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [citiesExpanded, setCitiesExpanded] = useState(false);
  const [blogPosts, setBlogPosts] = useState<{ slug: string; title: string; description: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "blogPosts"), orderBy("publishedDate", "desc"), limit(3));
        const snap = await getDocs(q);
        setBlogPosts(
          snap.docs.map((d) => {
            const data = d.data() as any;
            return { slug: d.id, title: data.title, description: data.description };
          })
        );
      } catch {
        // Non-critical — homepage still works without the guides section.
      }
    })();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "listings"),
      where("status", "==", "active"),
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
  }, []);

  const hasActiveFilters = cities.size > 0 || categories.size > 0 || search.trim().length > 0;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const data = listings.filter((l) => {
      const cityMatch = cities.size === 0 || cities.has(l.city);
      const categoryMatch = categories.size === 0 || categories.has(l.category);
      const text = `${l.title ?? ""} ${l.description ?? ""} ${l.city ?? ""} ${l.location ?? ""}`.toLowerCase();
      return cityMatch && categoryMatch && (!term || text.includes(term));
    });

    return [...data].sort((a, b) => {
      if (sort === "newest") return 0;
      const ap = Number(a.price ?? 0);
      const bp = Number(b.price ?? 0);
      return sort === "price_low" ? ap - bp : bp - ap;
    });
  }, [listings, cities, categories, search, sort]);

  const featured = listings.filter((l) => Boolean((l as Listing & { featured?: boolean }).featured)).slice(0, 6);

  // ItemList JSON-LD — represents the unfiltered "live listings" feed so
  // Google always sees a consistent list here regardless of what a visitor
  // has filtered/searched for in their own session.
  const listingsSchema = useMemo(() => {
    if (listings.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "KSA-Connect Live Listings",
      itemListElement: listings.slice(0, 30).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.myksaconnect.com/ksa-connect/${l.id}`,
        name: l.title,
      })),
    };
  }, [listings]);

  const clearAll = () => {
    setCities(new Set());
    setCategories(new Set());
    setSearch("");
  };

  const toggle = (set: Set<string>, setter: (v: Set<string>) => void, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  const handleTrendingClick = (keyword: string) => {
    setSearch(keyword);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mk-page">
      {listingsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingsSchema) }}
        />
      )}

      <section className="mk-hero" aria-label="MYKSA CONNECT homepage hero">
        <div className="mk-hero-bg" aria-hidden="true" />
        <div className="mk-hero-search-mask" aria-hidden="true" />
        <div className="mk-hero-pin" aria-hidden="true">✦</div>
        <div className="mk-hero-inner">
          <nav className="mk-nav">
            <a href="/ksa-connect" className="mk-logo" aria-label="MYKSA CONNECT home">
              <span className="mk-logo-mark">✦</span>
              <span className="mk-logo-text"><strong>MYKSA</strong> <b>CONNECT</b><small>BUY. SELL. CONNECT.</small></span>
            </a>
            <div className="mk-nav-links">
              <a href="#listings">Browse Ads⌄</a>
              <a href="#categories">Categories⌄</a>
              <a href="#cities">Cities⌄</a>
              <a href="/ksa-connect/faq">Help &amp; Support</a>
              <a href="#about">About Us</a>
              {user ? (
                <button className="mk-login" onClick={() => signOutUser()}>♙ {user.displayName?.split(" ")[0] ?? "Account"}</button>
              ) : (
                <button className="mk-login" onClick={() => signInWithGoogle()}>♙ Login / Sign Up</button>
              )}
              <a href="/ksa-connect/post" className="mk-post">＋ &nbsp;Post an Ad</a>
            </div>
          </nav>

          <div className="mk-hero-copy">
            <h1>Your Connection<br />Across <span>Saudi Arabia</span></h1>
            <p>The most trusted platform for expatriates<br className="mk-desktop" /> to buy, sell, find and connect.</p>
            <div className="mk-hero-actions">
              <a href="#listings" className="mk-btn mk-btn-green">⌕ &nbsp;Browse Ads</a>
              <a href="/ksa-connect/post" className="mk-btn mk-btn-gold">＋ &nbsp;Post an Ad</a>
            </div>
            <div className="mk-trust-mini">
              <div><i>♢</i><span>Trusted<br />Community</span></div>
              <div><i>•••</i><span>Chat<br />Securely</span></div>
              <div><i>●</i><span>Local<br />Reach</span></div>
              <div><i>ϟ</i><span>Fast &amp;<br />Easy</span></div>
            </div>
          </div>
        </div>

        <div className="mk-search-wrap">
          <div className="mk-search-row">
            <label className="mk-search-field"><span>📍</span><select aria-label="Select a city" value={cities.size === 1 ? Array.from(cities)[0] : ""} onChange={(e) => setCities(e.target.value ? new Set([e.target.value]) : new Set())}><option value="">Select a City</option>{CITY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
            <label className="mk-search-field"><span>▦</span><select aria-label="Select a category" value={categories.size === 1 ? Array.from(categories)[0] : ""} onChange={(e) => setCategories(e.target.value ? new Set([e.target.value]) : new Set())}><option value="">Select a Category</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="mk-search-field mk-keyword"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What are you looking for?" aria-label="Search listings" /></label>
            <button className="mk-search-btn" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>Search Ads</button>
          </div>
          <div className="mk-trending"><strong>Trending Searches:</strong>{TRENDING_KEYWORDS.map((k) => <button key={k} onClick={() => handleTrendingClick(k)}>{k}</button>)}</div>
        </div>
      </section>

      <main className="mk-main">
        <section className="mk-matrimonial" aria-label="Matrimonial promo">
          <div className="mk-matrimonial-text">
            <p><span>💍</span> Looking for a life partner?</p>
            <small>KSA-Connect&apos;s Wali-approved Matrimonial matching is available exclusively in the app — private, respectful, and secure.</small>
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect"
            target="_blank"
            rel="noreferrer"
            className="mk-matrimonial-btn"
          >
            Explore in the app
          </a>
        </section>

        <section id="cities" className="mk-section">
          <div className="mk-section-head"><h2>Browse Ads by City</h2><button onClick={() => { setCities(new Set()); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>View all cities →</button></div>
          <div className="mk-city-grid">
            {CITY_OPTIONS.map((city, i) => (
              <a
                key={city.value}
                href={`/ksa-connect/city/${city.value.toLowerCase()}`}
                className="mk-city-card"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(2,24,34,.02) 35%, rgba(2,12,20,.9) 100%), url('/images/cities/${city.image}.jpg')` }}
              >
                <span className="mk-city-number">{i + 1}</span><span className="mk-city-name">● &nbsp;{city.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="categories" className="mk-section">
          <div className="mk-section-head"><h2>Browse by Category</h2><button onClick={clearAll}>View all categories →</button></div>
          <div className="mk-category-grid">
            {CATEGORY_CARDS.map(([icon, title, sub, filter]) => (
              <button key={title} className={`mk-category-card${filter && categories.has(filter) ? " mk-category-card-active" : ""}`} onClick={() => filter && setCategories(new Set([filter]))}>
                <span className="mk-category-icon">{icon}</span><strong>{title}</strong><small>{sub}</small>
              </button>
            ))}
          </div>
        </section>

        <section id="about" className="mk-benefits">
          <div className="mk-why"><p>Why Choose</p><h2>MYKSA <span>CONNECT?</span></h2><ul><li>100% Free to Use</li><li>Post Unlimited Ads</li><li>Chat Directly &amp; Securely</li><li>Reach Local Buyers Faster</li><li>Available Across 7 Major Cities</li></ul></div>
          <div className="mk-map-card"><div className="mk-map-art">✦<br />☀</div><div><strong>One Platform.<br />7 Major Cities.</strong><b>Millions of Opportunities.</b></div></div>
          <div className="mk-app-card"><div><p className="mk-app-kicker">TAKE MYKSA CONNECT</p><h2>With You Anywhere</h2><p>Post, chat and manage your ads on the go.</p><div className="mk-store-row"><a href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect" target="_blank" rel="noreferrer">▶ Google Play</a><a href="/ksa-connect/faq"> App Store</a></div></div><div className="mk-mini-phone">MYKSA<br /><b>CONNECT</b></div></div>
        </section>

        {featured.length > 0 && (
          <section className="mk-featured">
            <div className="mk-section-head"><h2>Featured Listings</h2><a href="#listings">View all →</a></div>
            <div className="featured-scroll">
              {featured.map((l) => (
                <a href={`/ksa-connect/${l.id}`} key={l.id} className="featured-card">
                  {l.imageUrls?.[0] ? (
                    <div style={{ position: "relative", width: "100%", height: "100%" }} className="featured-image">
                      <Image src={l.imageUrls[0]} alt={l.title} fill sizes="280px" style={{ objectFit: "cover" }} />
                    </div>
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
          </section>
        )}

        {blogPosts.length > 0 && (
          <section className="mk-section" id="guides">
            <div className="mk-section-head">
              <h2>Expat Guides</h2>
              <a href="/ksa-connect/blog">View all →</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {blogPosts.map((post) => (
                <a
                  key={post.slug}
                  href={`/ksa-connect/blog/${post.slug}`}
                  style={{
                    display: "block",
                    padding: 20,
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <h3 style={{ fontSize: 16, marginBottom: 8 }}>{post.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {post.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="mk-listings-area" id="listings">
          <div className="listings-layout">
            <aside className="filters-sidebar">
              <p className="filters-sidebar-title">Filters {hasActiveFilters && <button className="clear-filters" onClick={clearAll}>Clear All</button>}</p>
              <div className="filter-group"><p className="filter-group-title">City</p>{(citiesExpanded ? CITY_OPTIONS : CITY_OPTIONS.slice(0, 5)).map((c) => <label className={`checkbox-row${cities.has(c.value) ? " checkbox-row-active" : ""}`} key={c.value}><input type="checkbox" checked={cities.has(c.value)} onChange={() => toggle(cities, setCities, c.value)} />{c.label}</label>)}<button className="view-more-toggle" onClick={() => setCitiesExpanded((v) => !v)}>{citiesExpanded ? "View less ˄" : "View more ˅"}</button></div>
              <div className="filter-group"><p className="filter-group-title">Category</p>{CATEGORIES.map((c) => <label className={`checkbox-row${categories.has(c) ? " checkbox-row-active" : ""}`} key={c}><input type="checkbox" checked={categories.has(c)} onChange={() => toggle(categories, setCategories, c)} /><span className="checkbox-icon">{CATEGORY_ICONS[c]}</span>{c}</label>)}</div>
            </aside>
            <div className="listings-main">
              <div className="listings-topbar"><input className="search-input" type="text" placeholder="Search listings by title…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} /><select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}><option value="newest">Newest first</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option></select><a href="/ksa-connect/post" className="mk-btn mk-btn-gold listings-post-btn">＋ Post an Ad</a></div>
              {!loading && !error && (
                <p className="results-count">
                  Showing {filtered.length} of {listings.length} listing{listings.length === 1 ? "" : "s"}
                  {cities.size === 1 && (
                    <> in <strong>{CITY_OPTIONS.find((c) => c.value === Array.from(cities)[0])?.label}</strong></>
                  )}
                  {categories.size === 1 && <> · {Array.from(categories)[0]}</>}
                </p>
              )}
              {loading && <div className="listing-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton skeleton-image" /><div className="skeleton-body"><div className="skeleton skeleton-line" style={{ width: "80%" }} /><div className="skeleton skeleton-line" style={{ width: "50%" }} /><div className="skeleton skeleton-line" style={{ width: "65%", marginBottom: 0 }} /></div></div>)}</div>}
              {error && <div className="empty-state" style={{ color: "#b91c1c" }}>Couldn&apos;t load listings: {error}<br /><span style={{ fontSize: 12 }}>(Check Firestore security rules and your .env.local Firebase config.)</span></div>}
              {!loading && !error && filtered.length === 0 && <div className="empty-state"><span className="empty-icon">🔍</span>No listings found. Try a different city, category, or search term.</div>}
              {!loading && !error && filtered.length > 0 && (
                <div className="listing-grid">
                  {filtered.map((l) => (
                    <div className="listing-card" key={l.id}>
                      <div style={{ position: "relative" }} className="listing-image">
                        {l.imageUrls?.[0] ? (
                          <Image src={l.imageUrls[0]} alt={l.title} fill sizes="(max-width: 640px) 50vw, 280px" style={{ objectFit: "cover" }} />
                        ) : (
                          <div className="listing-image-empty" style={{ width: "100%", height: "100%" }} />
                        )}
                        {l.createdAt && <span className="date-badge">{timeAgo(l.createdAt)}</span>}
                        <button className="heart-btn" aria-label="Save listing" title="Save listing">🤍</button>
                      </div>
                      <div className="listing-body">
                        <p className="listing-category-tag">{l.category}</p>
                        <p className="listing-title">{l.title}</p>
                        <p className="listing-price">{formattedPrice(l)}</p>
                        <p className="listing-location">{l.city} · {l.location}</p>
                        <a href={`/ksa-connect/${l.id}`} className="view-details-btn">View Details</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <section className="mk-final-cta"><div><h2>Ready to Buy, Sell and Connect?</h2><p>Join thousands of expatriates using MYKSA CONNECT every day.</p><a href="/ksa-connect/post" className="mk-btn mk-btn-gold">Post Your Ad Now →</a></div></section>
      <footer className="footer">
        <div className="container">
          <section className="mk-trust-strip" aria-label="Trust and support info">
            <div><span>♙</span><strong>Safe &amp; Secure</strong><small>Your privacy and safety are our priority.</small></div>
            <div><span>♢</span><strong>Verified Users</strong><small>Build trust with verified buyers and sellers.</small></div>
            <div><span>◎</span><strong>All Across Saudi Arabia</strong><small>7 Major cities. One trusted platform.</small></div>
            <div><span>♧</span><strong>24/7 Support</strong><small>We are here to help you anytime.</small></div>
          </section>
        </div>
        <p>
          <a href="/ksa-connect/blog">Guides</a> ·{" "}
          <a href="/ksa-connect/faq">FAQ</a> ·{" "}
          <a href="/ksa-connect/privacy">Privacy Policy</a> ·{" "}
          <a href="/ksa-connect/safety">Safety &amp; Fraud Prevention</a> ·{" "}
          <a href="mailto:abuman.moa@gmail.com">Contact</a>
        </p>
      </footer>
    </div>
  );
}
