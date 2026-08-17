"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { Listing, formattedPrice } from "@/lib/types";
import { timeAgo } from "@/lib/timeago";

const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Jubail", "Yanbu", "Madinah"];
const CITY_CARDS = [
  { name: "Madina", value: "Madinah", image: "madina" },
  { name: "Riyadh", value: "Riyadh", image: "riyadh" },
  { name: "Jeddah", value: "Jeddah", image: "jeddah" },
  { name: "Dammam", value: "Dammam", image: "dammam" },
  { name: "Khobar", value: "Khobar", image: "khobar" },
  { name: "Jubail", value: "Jubail", image: "jubail" },
  { name: "Yanbu", value: "Yanbu", image: "yanbu" },
];

const CATEGORIES = ["Housing", "Car", "Household", "Buy & Sell", "Services", "Classifieds"];
const CATEGORY_ICONS: Record<string, string> = {
  Housing: "⌂",
  Car: "🚗",
  Household: "▣",
  "Buy & Sell": "⚒",
  Services: "🛠",
  Classifieds: "👥",
};
const HOME_CATEGORIES = [
  { title: "Housing", subtitle: "Rent, Sale", icon: "⌂", filter: "Housing" },
  { title: "Cars", subtitle: "Buy & Sell", icon: "🚗", filter: "Car" },
  { title: "Electronics", subtitle: "Mobiles, Laptops", icon: "▣", filter: "Household" },
  { title: "Services", subtitle: "Home, Repair", icon: "🛠", filter: "Services" },
  { title: "Jobs", subtitle: "Drivers, Labour", icon: "💼", filter: "Classifieds" },
  { title: "Community", subtitle: "Groups, Events", icon: "👥", filter: "Classifieds" },
  { title: "Others", subtitle: "More Ads", icon: "•••", filter: "Buy & Sell" },
];
const TRENDING_KEYWORDS = ["Villa", "Apartment", "Toyota", "iPhone", "Sofa Set", "Driver", "Room Rent", "Labour", "Furniture"];

export default function KsaConnectPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high">("newest");
  const [citiesExpanded, setCitiesExpanded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "listings"), where("status", "==", "active"), orderBy("createdAt", "desc"), limit(60));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Listing[]);
        setLoading(false);
      },
      (err) => {
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

  function handleCityClick(city: string) {
    setCities(new Set([city]));
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleCategoryClick(category: string) {
    setCategories(new Set([category]));
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
      return 0;
    });

  return (
    <>
      <section className="mk-hero">
        <div className="mk-hero-bg" />
        <div className="mk-hero-inner">
          <nav className="mk-nav">
            <a href="/ksa-connect" className="mk-logo" aria-label="MYKSA CONNECT home">
              <span className="mk-logo-mark">🌴</span>
              <span>
                <strong>MYKSA</strong> <b>CONNECT</b>
                <small>BUY. SELL. CONNECT.</small>
              </span>
            </a>
            <div className="mk-nav-links">
              <a href="#listings">Browse Ads⌄</a>
              <a href="#categories">Categories⌄</a>
              <a href="#cities">Cities⌄</a>
              <a href="#support">Help &amp; Support</a>
              <a href="#about">About Us</a>
              {user ? (
                <button className="mk-login" onClick={() => signOutUser()}>♙ {user.displayName?.split(" ")[0] ?? "Account"}</button>
              ) : (
                <button className="mk-login" onClick={() => signInWithGoogle()}>♙ Login / Sign Up</button>
              )}
              <a href="/ksa-connect/post" className="mk-post-top">⊕ &nbsp;Post an Ad</a>
            </div>
          </nav>

          <div className="mk-hero-content">
            <div className="mk-hero-copy">
              <h1>Your Connection<br />Across <span>Saudi Arabia</span></h1>
              <p>The most trusted platform for expatriates<br />to buy, sell, find and connect.</p>
              <div className="mk-hero-actions">
                <a href="#listings" className="mk-btn mk-btn-green">⌕ &nbsp; Browse Ads</a>
                <a href="/ksa-connect/post" className="mk-btn mk-btn-gold">＋ &nbsp; Post an Ad</a>
              </div>
              <div className="mk-trust-mini">
                <span>🛡 <b>Trusted</b><small>Community</small></span>
                <span>💬 <b>Chat</b><small>Securely</small></span>
                <span>📍 <b>Local</b><small>Reach</small></span>
                <span>⚡ <b>Fast &amp;</b><small>Easy</small></span>
              </div>
            </div>
          </div>
        </div>

        <div className="mk-search-wrap">
          <div className="mk-search-row">
            <label className="mk-search-field"><span>📍</span>
              <select value={cities.size === 1 ? Array.from(cities)[0] : ""} onChange={(e) => setCities(e.target.value ? new Set([e.target.value]) : new Set())}>
                <option value="">Select a City</option>
                {CITY_CARDS.map((c) => <option key={c.value} value={c.value}>{c.name}</option>)}
              </select>
            </label>
            <label className="mk-search-field"><span>▦</span>
              <select value={categories.size === 1 ? Array.from(categories)[0] : ""} onChange={(e) => setCategories(e.target.value ? new Set([e.target.value]) : new Set())}>
                <option value="">Select a Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c === "Car" ? "Cars" : c}</option>)}
              </select>
            </label>
            <label className="mk-search-field mk-keyword"><span>⌕</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What are you looking for?" />
            </label>
            <a href="#listings" className="mk-search-btn">Search Ads</a>
          </div>
          <div className="mk-trending"><strong>Trending Searches:</strong>
            {TRENDING_KEYWORDS.map((k) => <button key={k} onClick={() => handleTrendingClick(k)}>{k}</button>)}
          </div>
        </div>
      </section>

      <main className="mk-main container">
        <section id="cities" className="mk-section">
          <div className="mk-section-head"><h2>Browse Ads by City</h2><a href="#listings">View all cities&nbsp; →</a></div>
          <div className="mk-city-grid">
            {CITY_CARDS.map((city, i) => (
              <button key={city.name} className="mk-city-card" onClick={() => handleCityClick(city.value)} style={{ backgroundImage: `url('/images/cities/${city.image}.jpg')` }}>
                <span className="mk-city-number">{i + 1}</span>
                <span className="mk-city-name">⌖ &nbsp;{city.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="categories" className="mk-section">
          <div className="mk-section-head"><h2>Browse by Category</h2><a href="#listings">View all categories&nbsp; →</a></div>
          <div className="mk-category-grid">
            {HOME_CATEGORIES.map((cat) => (
              <button key={cat.title} className="mk-category-card" onClick={() => handleCategoryClick(cat.filter)}>
                <span className="mk-category-icon">{cat.icon}</span><strong>{cat.title}</strong><small>{cat.subtitle}</small>
              </button>
            ))}
          </div>
        </section>

        <section id="about" className="mk-feature-grid">
          <div className="mk-why-card">
            <p className="mk-eyebrow">WHY CHOOSE</p>
            <h2>MYKSA <span>CONNECT?</span></h2>
            <ul>
              <li>✓ 100% Free to Use</li>
              <li>✓ Post Unlimited Ads</li>
              <li>✓ Chat Directly &amp; Securely</li>
              <li>✓ Reach Local Buyers Faster</li>
              <li>✓ Available Across 7 Major Cities</li>
            </ul>
          </div>
          <div className="mk-cities-message">
            <div className="mk-saudi-outline">✦<br />🌴</div>
            <div><h3>One Platform.<br />7 Major Cities.</h3><p>Millions of <span>Opportunities.</span></p></div>
          </div>
          <div className="mk-app-card">
            <div><p className="mk-eyebrow">TAKE MYKSA CONNECT</p><h2>With You Anywhere</h2><p>Post, chat and manage your ads<br />on the go.</p>
              <div className="mk-store-row"><a href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect" target="_blank" rel="noreferrer">▶ Google Play</a><span> App Store</span></div>
            </div>
            <div className="mk-app-phone">MYKSA<br /><b>CONNECT</b></div>
          </div>
        </section>

        <section id="support" className="mk-support-strip">
          <div><span>♙</span><b>Safe &amp; Secure</b><small>Your privacy and safety are our priority.</small></div>
          <div><span>♢</span><b>Verified Users</b><small>Build trust with verified buyers and sellers.</small></div>
          <div><span>◎</span><b>All Across Saudi Arabia</b><small>7 Major cities. One trusted platform.</small></div>
          <div><span>♧</span><b>24/7 Support</b><small>We are here to help you anytime.</small></div>
        </section>

        {featured.length > 0 && (
          <section className="mk-featured-section">
            <div className="mk-section-head"><h2>Featured Listings</h2><a href="#listings">View all →</a></div>
            <div className="featured-scroll">
              {featured.map((l) => <a href={`/ksa-connect/${l.id}`} key={l.id} className="featured-card">
                {l.imageUrls?.[0] ? <img src={l.imageUrls[0]} alt={l.title} className="featured-image" /> : <div className="featured-image featured-image-empty" />}
                <span className="featured-tag">⭐ Featured</span><div className="listing-body"><p className="listing-title">{l.title}</p><p className="listing-price">{formattedPrice(l)}</p></div>
              </a>)}
            </div>
          </section>
        )}

        <section id="listings" className="mk-listings-section">
          <div className="mk-listings-heading"><div><p className="mk-eyebrow">LIVE MARKETPLACE</p><h2>Latest Listings</h2></div><span>{filtered.length} of {listings.length} ads</span></div>
          <div className="listings-layout">
            <aside className="filters-sidebar">
              <a href="/ksa-connect/post" className="sidebar-post-ad-btn">⊕ &nbsp;Post an Ad</a>
              <p className="filters-sidebar-title">Filters {hasActiveFilters && <button className="clear-filters" onClick={clearAll}>Clear All</button>}</p>
              <div className="filter-group"><p className="filter-group-title">City</p>
                {(citiesExpanded ? CITIES : CITIES.slice(0, 5)).map((c) => <label className={`checkbox-row${cities.has(c) ? " checkbox-row-active" : ""}`} key={c}><input type="checkbox" checked={cities.has(c)} onChange={() => toggle(cities, setCities, c)} />{c === "Madinah" ? "Madina" : c}</label>)}
                {CITIES.length > 5 && <button type="button" className="view-more-toggle" onClick={() => setCitiesExpanded((v) => !v)}>{citiesExpanded ? "View less ˄" : "View more ˅"}</button>}
              </div>
              <div className="filter-group"><p className="filter-group-title">Category</p>
                {CATEGORIES.map((c) => <label className={`checkbox-row${categories.has(c) ? " checkbox-row-active" : ""}`} key={c}><input type="checkbox" checked={categories.has(c)} onChange={() => toggle(categories, setCategories, c)} /><span className="checkbox-icon">{CATEGORY_ICONS[c]}</span>{c === "Car" ? "Cars" : c}</label>)}
              </div>
            </aside>
            <div className="listings-main">
              <div className="listings-topbar"><input className="search-input" type="text" placeholder="Search listings by title…" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}><option value="newest">Newest first</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option></select></div>
              {loading && <div className="listing-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton skeleton-image" /><div className="skeleton-body"><div className="skeleton skeleton-line" style={{ width: "80%" }} /><div className="skeleton skeleton-line" style={{ width: "50%" }} /><div className="skeleton skeleton-line" style={{ width: "65%", marginBottom: 0 }} /></div></div>)}</div>}
              {error && <div className="empty-state error-state">Couldn&apos;t load listings: {error}<br /><span>Check Firestore public-read rules and your Firebase environment settings.</span></div>}
              {!loading && !error && filtered.length === 0 && <div className="empty-state"><span className="empty-icon">⌕</span>No listings found. Try a different city, category, or search term.</div>}
              {!loading && !error && filtered.length > 0 && <div className="listing-grid">{filtered.map((l) => <div className="listing-card" key={l.id}>
                <div className="listing-image-wrap">{l.imageUrls?.[0] ? <img src={l.imageUrls[0]} alt={l.title} className="listing-image" /> : <div className="listing-image listing-image-empty" />}{l.createdAt && <span className="date-badge">{timeAgo(l.createdAt)}</span>}<button className="heart-btn" aria-label="Save listing">♡</button></div>
                <div className="listing-body"><p className="listing-category-tag">{l.category}</p><p className="listing-title">{l.title}</p><p className="listing-price">{formattedPrice(l)}</p><p className="listing-location">{l.city} · {l.location}</p><a href={`/ksa-connect/${l.id}`} className="view-details-btn">View Details</a></div>
              </div>)}</div>}
            </div>
          </div>
        </section>
      </main>

      <section className="mk-final-cta"><div><h2>Ready to Buy, Sell and Connect?</h2><p>Join thousands of expatriates using MYKSA CONNECT every day.</p><a href="/ksa-connect/post" className="mk-btn mk-btn-gold">Post Your Ad Now &nbsp;→</a></div></section>
      <footer className="footer"><p><a href="/ksa-connect/privacy">Privacy Policy</a> · <a href="mailto:abuman.moa@gmail.com">Contact</a></p></footer>
    </>
  );
}
