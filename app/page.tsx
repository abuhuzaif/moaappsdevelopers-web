"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PopularPdfTools from "@/app/components/PopularPdfTools";
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

const EXPAT_TOOLS = [
  ["ðŸ“…", "Iqama Expiry Calculator", "Check your Iqama expiry date", "/tools/iqama-expiry-calculator/"],
  ["ðŸ”„", "Hijri / Gregorian Converter", "Convert dates instantly", "/tools/hijri-gregorian-converter/"],
  ["ðŸ’°", "Salary Calculator", "Monthly & yearly salary", "/tools/salary-calculator/"],
  ["ðŸ’±", "SAR Currency Converter", "SAR to INR, PKR & more", "/tools/sar-currency-converter/"],
  ["ðŸ ", "Rent Split Calculator", "Split rent with roommates", "/tools/rent-split-calculator/"],
  ["ðŸ“…", "Days Between Dates", "Calculate the days between two dates", "/tools/days-between-dates/"],
] as const;

const RESTAURANT_MENU_FEATURES = [
  ["ðŸ“±", "QR Digital Menu", "Customers scan and view your menu instantly."],
  ["ðŸ½ï¸", "Arabic + English", "Show dishes, prices and offers in both languages."],
  ["ðŸ“", "Location & Contact", "Add map, WhatsApp, call and opening hours."],
] as const;

const CATEGORY_CARDS = [
  ["âŒ‚", "Housing", "Rent, Sale", "Housing"],
  ["ðŸš—", "Cars", "Buy & Sell", "Car"],
  ["â–£", "Electronics", "Mobiles, Laptops", "Electronics"],
  ["âš’", "Services", "Home, Repair", "Services"],
  ["â–¤", "Jobs", "Drivers, Labour", "Jobs"],
  ["â™™", "Community", "Groups, Events", "Community"],
  ["â€¢â€¢â€¢", "Others", "More Ads", "Classifieds"],
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  Housing: "ðŸ ",
  Car: "ðŸš—",
  Household: "ðŸ›‹ï¸",
  "Buy & Sell": "ðŸ›ï¸",
  Services: "ðŸ› ï¸",
  Electronics: "ðŸ’»",
  Jobs: "ðŸ’¼",
  Community: "ðŸ‘¥",
  Classifieds: "ðŸ·ï¸",
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
        // Non-critical â€” homepage still works without the guides section.
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

  // ItemList JSON-LD â€” represents the unfiltered "live listings" feed so
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
        <div className="mk-hero-pin" aria-hidden="true">âœ¦</div>
        <div className="mk-hero-inner">
          <nav className="mk-nav">
            <a href="/ksa-connect" className="mk-logo" aria-label="MYKSA CONNECT home">
              <span className="mk-logo-mark">âœ¦</span>
              <span className="mk-logo-text"><strong>MYKSA</strong> <b>CONNECT</b><small>BUY. SELL. CONNECT.</small></span>
            </a>
            <div className="mk-nav-links">
              <a href="#listings">Browse AdsâŒ„</a>
              <a href="#categories">CategoriesâŒ„</a>
              <a href="#cities">CitiesâŒ„</a>
              <a href="/restaurants">ðŸ½ï¸ Digital Menu</a>
              <a href="/ksa-connect/faq">Help &amp; Support</a>
              <a href="#about">About Us</a>
              {user ? (
                <button className="mk-login" onClick={() => signOutUser()}>â™™ {user.displayName?.split(" ")[0] ?? "Account"}</button>
              ) : (
                <button className="mk-login" onClick={() => signInWithGoogle()}>â™™ Login / Sign Up</button>
              )}
              <a href="/ksa-connect/post" className="mk-post">ï¼‹ &nbsp;Post an Ad</a>
            </div>
          </nav>

          <div className="mk-hero-copy">
            <h1>Your Connection<br />Across <span>Saudi Arabia</span></h1>
            <p>The most trusted platform for expatriates<br className="mk-desktop" /> to buy, sell, find and connect.</p>
            <div className="mk-hero-actions">
              <a href="#listings" className="mk-btn mk-btn-green">âŒ• &nbsp;Browse Ads</a>
              <a href="/ksa-connect/post" className="mk-btn mk-btn-gold">ï¼‹ &nbsp;Post an Ad</a>
            </div>
            <div className="mk-trust-mini">
              <div><i>â™¢</i><span>Trusted<br />Community</span></div>
              <div><i>â€¢â€¢â€¢</i><span>Chat<br />Securely</span></div>
              <div><i>â—</i><span>Local<br />Reach</span></div>
              <div><i>ÏŸ</i><span>Fast &amp;<br />Easy</span></div>
            </div>
          </div>
        </div>

        <div className="mk-search-wrap">
          <div className="mk-search-row">
            <label className="mk-search-field"><span>ðŸ“</span><select aria-label="Select a city" value={cities.size === 1 ? Array.from(cities)[0] : ""} onChange={(e) => setCities(e.target.value ? new Set([e.target.value]) : new Set())}><option value="">Select a City</option>{CITY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
            <label className="mk-search-field"><span>â–¦</span><select aria-label="Select a category" value={categories.size === 1 ? Array.from(categories)[0] : ""} onChange={(e) => setCategories(e.target.value ? new Set([e.target.value]) : new Set())}><option value="">Select a Category</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="mk-search-field mk-keyword"><span>âŒ•</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What are you looking for?" aria-label="Search listings" /></label>
            <button className="mk-search-btn" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>Search Ads</button>
          </div>
          <div className="mk-trending"><strong>Trending Searches:</strong>{TRENDING_KEYWORDS.map((k) => <button key={k} onClick={() => handleTrendingClick(k)}>{k}</button>)}</div>
        </div>
      </section>

      <main className="mk-main">
        <style>{`
          .mk-tools-showcase {
            position: relative;
            overflow: hidden;
          }
          .mk-tools-showcase::before {
            content: "";
            position: absolute;
            width: 240px;
            height: 240px;
            right: -90px;
            top: -110px;
            border-radius: 50%;
            background: rgba(246,185,31,.08);
            pointer-events: none;
          }
          .mk-tools-showcase-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 28px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
          }
          .mk-tools-showcase-copy {
            min-width: 0;
          }
          .mk-tools-badge {
            display: inline-flex;
            align-items: center;
            padding: 7px 12px;
            border-radius: 999px;
            background: #fff6dc;
            border: 1px solid #f1d98a;
            color: #7a5a00;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: .55px;
            margin-bottom: 10px;
          }
          .mk-tools-showcase .mk-strip-kicker {
            margin-bottom: 3px;
          }
          .mk-tools-showcase h2 {
            margin-bottom: 5px;
          }
          .mk-tools-showcase-desc {
            margin: 0;
            max-width: 760px;
            color: #5d6a68;
            line-height: 1.55;
          }
          .mk-tools-quick-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin-top: 12px;
          }
          .mk-tools-quick-tags span {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border-radius: 999px;
            background: #f1f7f4;
            border: 1px solid #dce9e4;
            color: #24564b;
            font-size: 11px;
            font-weight: 800;
          }
          .mk-tools-explore-cta {
            flex: 0 0 255px;
            display: flex;
            align-items: center;
            gap: 11px;
            min-height: 72px;
            padding: 13px 15px;
            border-radius: 15px;
            background: linear-gradient(135deg, #005744, #003c31);
            color: #fff;
            text-decoration: none;
            border: 1px solid rgba(246,185,31,.65);
            box-shadow: 0 10px 24px rgba(0,87,68,.16);
            transition: transform .18s ease, box-shadow .18s ease;
          }
          .mk-tools-explore-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 28px rgba(0,87,68,.22);
          }
          .mk-tools-cta-icon {
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
            flex: 0 0 38px;
            border-radius: 11px;
            background: rgba(246,185,31,.16);
            border: 1px solid rgba(246,185,31,.4);
            font-size: 20px;
          }
          .mk-tools-explore-cta span:nth-child(2) {
            flex: 1;
            min-width: 0;
          }
          .mk-tools-explore-cta strong {
            display: block;
            font-size: 14px;
            line-height: 1.2;
          }
          .mk-tools-explore-cta small {
            display: block;
            margin-top: 3px;
            color: #d7e8e3;
            font-size: 11px;
          }
          .mk-tools-explore-cta b {
            color: #f6b91f;
            font-size: 22px;
          }
          @media (max-width: 760px) {
            .mk-tools-showcase-head {
              align-items: stretch;
              flex-direction: column;
              gap: 15px;
            }
            .mk-tools-explore-cta {
              flex-basis: auto;
              width: 100%;
            }
          }
        `}</style>
        <PopularPdfTools />

        <section className="mk-tools-strip mk-tools-showcase" aria-labelledby="expat-tools-title">
          <div className="mk-tools-showcase-head">
            <div className="mk-tools-showcase-copy">
              <div className="mk-tools-badge">ðŸ§° &nbsp; 25+ FREE ESSENTIAL TOOLS</div>
              <p className="mk-strip-kicker">ðŸ’¼ Professional Tools</p>
              <h2 id="expat-tools-title">Work, Salary &amp; Business Tools</h2>
              <p className="mk-tools-showcase-desc">
                One place for everyday Saudi expat needs â€” Iqama, salary, currency, HR, travel, rent and professional tools.
              </p>
              <div className="mk-tools-quick-tags" aria-label="Tool categories">
                <span>ðŸªª Iqama</span>
                <span>ðŸ’° Salary</span>
                <span>ðŸ’± Currency</span>
                <span>â±ï¸ Work &amp; HR</span>
                <span>ðŸ—ºï¸ GIS</span>
              </div>
            </div>

            <a href="/tools/" className="mk-tools-explore-cta">
              <span className="mk-tools-cta-icon">ðŸ§°</span>
              <span>
                <strong>Explore All Tools</strong>
                <small>25+ useful calculators &amp; tools</small>
              </span>
              <b aria-hidden="true">â†’</b>
            </a>
          </div>

          <div className="mk-tools-grid">
            {EXPAT_TOOLS.map(([icon, title, description, href]) => (
              <a key={href} href={href} className="mk-tool-card">
                <span className="mk-tool-icon" aria-hidden="true">{icon}</span>
                <span><strong>{title}</strong><small>{description}</small></span>
                <b aria-hidden="true">â†’</b>
              </a>
            ))}
          </div>
        </section>

        <section className="mk-restaurant-strip" aria-labelledby="restaurant-menu-title">
          <div className="mk-restaurant-copy">
            <p className="mk-strip-kicker">ðŸ½ï¸ Restaurant Digital Menus</p>
            <h2 id="restaurant-menu-title">Turn Your Restaurant Menu Into a Digital Experience</h2>
            <p>Create a mobile-friendly menu page with QR access, photos, prices, offers, location and direct WhatsApp/call buttons.</p>
            <div className="mk-restaurant-actions">
              <a href="/restaurants" className="mk-btn mk-btn-gold">Browse Digital Menus â†’</a>
              <a href="/restaurants/create" className="mk-restaurant-secondary">Create a Menu</a>
            </div>
          </div>
          <div className="mk-restaurant-features">
            {RESTAURANT_MENU_FEATURES.map(([icon, title, description]) => (
              <div className="mk-restaurant-feature" key={title}>
                <span>{icon}</span><div><strong>{title}</strong><small>{description}</small></div>
              </div>
            ))}
          </div>
        </section>

        <section id="cities" className="mk-section">
          <div className="mk-section-head"><h2>Browse Ads by City</h2><button onClick={() => { setCities(new Set()); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>View all cities â†’</button></div>
          <div className="mk-city-grid">
            {CITY_OPTIONS.map((city, i) => (
              <a
                key={city.value}
                href={`/ksa-connect/city/${city.value.toLowerCase()}`}
                className="mk-city-card"
                style={{ backgroundImage: `linear-gradient(180deg, rgba(2,24,34,.02) 35%, rgba(2,12,20,.9) 100%), url('/images/cities/${city.image}.jpg')` }}
              >
                <span className="mk-city-number">{i + 1}</span><span className="mk-city-name">â— &nbsp;{city.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="categories" className="mk-section">
          <div className="mk-section-head"><h2>Browse by Category</h2><button onClick={clearAll}>View all categories â†’</button></div>
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
          <div className="mk-map-card"><div className="mk-map-art">âœ¦<br />â˜€</div><div><strong>One Platform.<br />7 Major Cities.</strong><b>Millions of Opportunities.</b></div></div>
          <div className="mk-app-card"><div><p className="mk-app-kicker">TAKE MYKSA CONNECT</p><h2>With You Anywhere</h2><p>Post, chat and manage your ads on the go.</p><div className="mk-store-row"><a href="https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect" target="_blank" rel="noreferrer">â–¶ Google Play</a><a href="/ksa-connect/faq"> App Store</a></div></div><div className="mk-mini-phone">MYKSA<br /><b>CONNECT</b></div></div>
        </section>

        {featured.length > 0 && (
          <section className="mk-featured">
            <div className="mk-section-head"><h2>Featured Listings</h2><a href="#listings">View all â†’</a></div>
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
                  <span className="featured-tag">â­ Featured</span>
                  <div className="listing-body">
                    <p className="listing-title">{l.title}</p>
                    <p className="listing-price">{formattedPrice(l)}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}



        <section className="mk-listings-area" id="listings">
          <div className="listings-layout">
            <aside className="filters-sidebar">
              <p className="filters-sidebar-title">Filters {hasActiveFilters && <button className="clear-filters" onClick={clearAll}>Clear All</button>}</p>
              <div className="filter-group"><p className="filter-group-title">City</p>{(citiesExpanded ? CITY_OPTIONS : CITY_OPTIONS.slice(0, 5)).map((c) => <label className={`checkbox-row${cities.has(c.value) ? " checkbox-row-active" : ""}`} key={c.value}><input type="checkbox" checked={cities.has(c.value)} onChange={() => toggle(cities, setCities, c.value)} />{c.label}</label>)}<button className="view-more-toggle" onClick={() => setCitiesExpanded((v) => !v)}>{citiesExpanded ? "View less Ë„" : "View more Ë…"}</button></div>
              <div className="filter-group"><p className="filter-group-title">Category</p>{CATEGORIES.map((c) => <label className={`checkbox-row${categories.has(c) ? " checkbox-row-active" : ""}`} key={c}><input type="checkbox" checked={categories.has(c)} onChange={() => toggle(categories, setCategories, c)} /><span className="checkbox-icon">{CATEGORY_ICONS[c]}</span>{c}</label>)}</div>
            </aside>
            <div className="listings-main">
              <div className="listings-topbar"><input className="search-input" type="text" placeholder="Search listings by titleâ€¦" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} /><select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}><option value="newest">Newest first</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option></select><a href="/ksa-connect/post" className="mk-btn mk-btn-gold listings-post-btn">ï¼‹ Post an Ad</a></div>
              {!loading && !error && (
                <p className="results-count">
                  Showing {filtered.length} of {listings.length} listing{listings.length === 1 ? "" : "s"}
                  {cities.size === 1 && (
                    <> in <strong>{CITY_OPTIONS.find((c) => c.value === Array.from(cities)[0])?.label}</strong></>
                  )}
                  {categories.size === 1 && <> Â· {Array.from(categories)[0]}</>}
                </p>
              )}
              {loading && <div className="listing-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton skeleton-image" /><div className="skeleton-body"><div className="skeleton skeleton-line" style={{ width: "80%" }} /><div className="skeleton skeleton-line" style={{ width: "50%" }} /><div className="skeleton skeleton-line" style={{ width: "65%", marginBottom: 0 }} /></div></div>)}</div>}
              {error && <div className="empty-state" style={{ color: "#b91c1c" }}>Couldn&apos;t load listings: {error}<br /><span style={{ fontSize: 12 }}>(Check Firestore security rules and your .env.local Firebase config.)</span></div>}
              {!loading && !error && filtered.length === 0 && <div className="empty-state"><span className="empty-icon">ðŸ”</span>No listings found. Try a different city, category, or search term.</div>}
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
                        <button className="heart-btn" aria-label="Save listing" title="Save listing">ðŸ¤</button>
                      </div>
                      <div className="listing-body">
                        <p className="listing-category-tag">{l.category}</p>
                        <p className="listing-title">{l.title}</p>
                        <p className="listing-price">{formattedPrice(l)}</p>
                        <p className="listing-location">{l.city} Â· {l.location}</p>
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

      {blogPosts.length > 0 && (
        <section className="mk-section" id="guides" style={{ background: "#f7f5f0", padding: "48px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="mk-section-head">
              <div>
                <p style={{ color: "#005744", fontWeight: 700, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
                  ðŸ“– Resources
                </p>
                <h2 style={{ margin: "4px 0 0" }}>Expat Guides</h2>
              </div>
              <a href="/ksa-connect/blog">View all â†’</a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
              {blogPosts.map((post) => (
                <a
                  key={post.slug}
                  href={`/ksa-connect/blog/${post.slug}`}
                  style={{
                    display: "block",
                    padding: 24,
                    background: "#fff",
                    border: "1px solid rgba(0,87,68,0.1)",
                    borderRadius: 14,
                    textDecoration: "none",
                    color: "inherit",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <h3 style={{ fontSize: 16.5, marginBottom: 8, color: "#0C1730" }}>{post.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    {post.description}
                  </p>
                  <span style={{ display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 700, color: "#005744" }}>
                    Read more â†’
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mk-final-cta"><div><h2>Ready to Buy, Sell and Connect?</h2><p>Join thousands of expatriates using MYKSA CONNECT every day.</p><a href="/ksa-connect/post" className="mk-btn mk-btn-gold">Post Your Ad Now â†’</a></div></section>
      <footer className="footer">
        <div className="container">
          <section className="mk-trust-strip" aria-label="Trust and support info">
            <div><span>â™™</span><strong>Safe &amp; Secure</strong><small>Your privacy and safety are our priority.</small></div>
            <div><span>â™¢</span><strong>Verified Users</strong><small>Build trust with verified buyers and sellers.</small></div>
            <div><span>â—Ž</span><strong>All Across Saudi Arabia</strong><small>7 Major cities. One trusted platform.</small></div>
            <div><span>â™§</span><strong>24/7 Support</strong><small>We are here to help you anytime.</small></div>
          </section>
        </div>
        <p>
          <a href="/ksa-connect/blog">Guides</a> Â·{" "}
          <a href="/ksa-connect/faq">FAQ</a> Â·{" "}
          <a href="/ksa-connect/privacy">Privacy Policy</a> Â·{" "}
          <a href="/ksa-connect/safety">Safety &amp; Fraud Prevention</a> Â·{" "}
          <a href="mailto:abuman.moa@gmail.com">Contact</a>
        </p>
      </footer>
    </div>
  );
}

