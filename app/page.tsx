"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PopularPdfTools from "@/app/components/PopularPdfTools";
import RestaurantSpotlight from "@/app/components/RestaurantSpotlight";
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { Listing, formattedPrice } from "@/lib/types";
import { REGIONS } from "@/lib/categories";
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
  ["📅", "Iqama Expiry Calculator", "Check your Iqama expiry date", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "Convert dates instantly", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "Monthly & yearly salary", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "SAR to INR, PKR & more", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "Split rent with roommates", "/tools/rent-split-calculator/"],
  ["📅", "Days Between Dates", "Calculate the days between two dates", "/tools/days-between-dates/"],
] as const;

// Keep only the nine actual top-level categories from the Post a Listing form.
// Subcategories such as Mobiles, Furniture, Driver/Labour and Umrah Packages remain
// available through their parent category and are not duplicated as homepage cards.
const CATEGORY_CARDS = [
  { icon: "⌂", title: "Housing", subtitle: "Rent & sale", category: "Housing" },
  { icon: "🚗", title: "Cars", subtitle: "Buy & sell", category: "Car" },
  { icon: "🛋️", title: "Household", subtitle: "Furniture & kitchen", category: "Household" },
  { icon: "🛍️", title: "Buy & Sell", subtitle: "Everyday items", category: "Buy & Sell" },
  { icon: "💻", title: "Electronics", subtitle: "Mobiles & devices", category: "Electronics" },
  { icon: "🛠️", title: "Services", subtitle: "Repairs & support", category: "Services" },
  { icon: "💼", title: "Jobs", subtitle: "Drivers & labour", category: "Jobs" },
  { icon: "👥", title: "Community", subtitle: "Groups & events", category: "Community" },
  { icon: "🏷️", title: "Classifieds", subtitle: "More opportunities", category: "Classifieds" },
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

// Matching color palette for all nine category cards, including Community and Classifieds.
const CATEGORY_CARD_STYLES: Record<string, { bg: string; border: string; iconBg: string; accent: string }> = {
  Housing: { bg: "#DDF8EC", border: "#22C55E", iconBg: "#A7EBCB", accent: "#087A4B" },
  Car: { bg: "#FFE8D5", border: "#F97316", iconBg: "#FFD0AA", accent: "#C2410C" },
  Household: { bg: "#DFEBFF", border: "#3B82F6", iconBg: "#B7D1FF", accent: "#1D4ED8" },
  "Buy & Sell": { bg: "#FFE2ED", border: "#EC4899", iconBg: "#FFC1D9", accent: "#BE185D" },
  Electronics: { bg: "#EBDDFF", border: "#8B5CF6", iconBg: "#D2B8FF", accent: "#6D28D9" },
  Services: { bg: "#D8F7E8", border: "#10B981", iconBg: "#A7E8C9", accent: "#047857" },
  Jobs: { bg: "#FFF1C4", border: "#EAB308", iconBg: "#FFDF78", accent: "#A16207" },
  Community: { bg: "#D9F7EF", border: "#14B8A6", iconBg: "#A6EBDD", accent: "#0F766E" },
  Classifieds: { bg: "#FFF0C9", border: "#F59E0B", iconBg: "#FFDB83", accent: "#92400E" },
};

type SortMode = "newest" | "price_low" | "price_high";

// MYKSA Connect social pages — shown in the footer and sent to Google (Organization sameAs)
const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61594787978208",
    color: "#1877F2",
    path: "M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/myksaconnect",
    color: "#E4405F",
    path: "M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 4.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.6-1.3-3.7-3.7-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6c.1-2.4 1.3-3.6 3.7-3.7.9-.1 1.2-.1 3.6-.1zM12 3c-2.4 0-2.7 0-3.7.1-3.3.1-5 1.9-5.2 5.2C3 9.3 3 9.6 3 12s0 2.7.1 3.7c.1 3.3 1.9 5 5.2 5.2 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c3.3-.1 5-1.9 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c-.1-3.3-1.9-5-5.2-5.2C14.7 3 14.4 3 12 3z",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@MYKSACONNECT",
    color: "#FF0000",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@moa70391",
    color: "#000000",
    path: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z",
  },
] as const;

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MYKSA Connect",
  url: "https://www.myksaconnect.com",
  logo: "https://www.myksaconnect.com/ksa-logo.png",
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

function SocialIcons({ size = 40 }: { size?: number }) {
  return (
    <div className="mk-social" aria-label="MYKSA Connect on social media">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`MYKSA Connect on ${s.name}`}
          title={s.name}
          className="mk-social-btn"
          style={{ width: size, height: size, "--brand": s.color } as import("react").CSSProperties}
        >
          <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} aria-hidden="true">
            <path fill="currentColor" d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

export default function KsaConnectPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [citiesExpanded, setCitiesExpanded] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
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

  const hasActiveFilters = cities.size > 0 || categories.size > 0 || selectedSubcategories.size > 0 || search.trim().length > 0;

  // Live ad count per city (for the city cards)
  const cityCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of listings) if (l.city) m[l.city] = (m[l.city] ?? 0) + 1;
    return m;
  }, [listings]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const data = listings.filter((l) => {
      const cityMatch = cities.size === 0 || cities.has(l.city);
      const categoryMatch = categories.size === 0 || categories.has(l.category);
      const rawListing = l as Listing & { subcategory?: string; subCategory?: string; sub_category?: string };
      const listingSubcategory = String(rawListing.subcategory ?? rawListing.subCategory ?? rawListing.sub_category ?? "").trim().toLowerCase();
      const subcategoryMatch = selectedSubcategories.size === 0 || Array.from(selectedSubcategories).some((value) => value.toLowerCase() === listingSubcategory);
      const text = `${l.title ?? ""} ${l.description ?? ""} ${l.city ?? ""} ${l.location ?? ""}`.toLowerCase();
      return cityMatch && categoryMatch && subcategoryMatch && (!term || text.includes(term));
    });

    return [...data].sort((a, b) => {
      if (sort === "newest") return 0;
      const ap = Number(a.price ?? 0);
      const bp = Number(b.price ?? 0);
      return sort === "price_low" ? ap - bp : bp - ap;
    });
  }, [listings, cities, categories, selectedSubcategories, search, sort]);

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
    setSelectedSubcategories(new Set());
    setSearch("");
  };

  const toggle = (set: Set<string>, setter: (v: Set<string>) => void, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  };

  // City / region filter helpers (search dropdown + sidebar)
  const regionSelected = REGIONS.find(
    (r) => cities.size === r.cities.length && r.cities.every((c) => cities.has(c))
  );
  const cityFilterValue = regionSelected
    ? `region:${regionSelected.key}`
    : cities.size === 1
    ? Array.from(cities)[0]
    : "";
  const onCitySelect = (v: string) => {
    if (!v) return setCities(new Set());
    if (v.startsWith("region:")) {
      const r = REGIONS.find((x) => x.key === v.slice(7));
      return setCities(new Set(r?.cities ?? []));
    }
    setCities(new Set([v]));
  };
  const toggleRegion = (regionCities: string[]) => {
    const allOn = regionCities.every((c) => cities.has(c));
    const next = new Set(cities);
    regionCities.forEach((c) => (allOn ? next.delete(c) : next.add(c)));
    setCities(next);
  };

  const handleTrendingClick = (keyword: string) => {
    setSearch(keyword);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mk-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ksa-logo.png" alt="" width={46} height={46} className="mk-logo-img" />
              <span className="mk-logo-text"><strong>MYKSA</strong> <b>CONNECT</b><small>BUY. SELL. CONNECT.</small></span>
            </a>
            <div className="mk-nav-links">
              <a href="#listings">Browse Ads⌄</a>
              <a href="#categories">Categories⌄</a>
              <a href="#cities">Cities⌄</a>
              <a href="/restaurants">🍽️ Digital Menu</a>
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
            <label className="mk-search-field"><span>📍</span><select aria-label="Select a city or region" value={cityFilterValue} onChange={(e) => onCitySelect(e.target.value)}><option value="">All Cities</option>{REGIONS.map((r) => <optgroup key={r.key} label={`${r.emoji} ${r.label} Region`}><option value={`region:${r.key}`}>All {r.label} Region</option>{r.cities.map((c) => <option key={c} value={c}>{c}</option>)}</optgroup>)}</select></label>
            <label className="mk-search-field"><span>▦</span><select aria-label="Select a category" value={categories.size === 1 ? Array.from(categories)[0] : ""} onChange={(e) => { setCategories(e.target.value ? new Set([e.target.value]) : new Set()); setSelectedSubcategories(new Set()); }}><option value="">Select a Category</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="mk-search-field mk-keyword"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="What are you looking for?" aria-label="Search listings" /></label>
            <button className="mk-search-btn" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>Search Ads</button>
          </div>
          <div className="mk-trending"><strong>Trending Searches:</strong>{TRENDING_KEYWORDS.map((k) => <button key={k} onClick={() => handleTrendingClick(k)}>{k}</button>)}</div>
        </div>
      </section>

      <main className="mk-main">
        <style>{`
          /* Social icons (final CTA + footer) */
          .mk-social { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
          .mk-social-btn {
            display: grid; place-items: center; border-radius: 50%;
            color: #fff; background: rgba(255,255,255,.08);
            border: 1px solid rgba(246,185,31,.55);
            transition: background .18s ease, transform .18s ease, border-color .18s ease;
          }
          .mk-social-btn:hover { background: var(--brand); border-color: var(--brand); transform: translateY(-2px); }
          .mk-follow { margin-top: 22px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
          /* Clean, compact selector for the 12 additional cities. The main 7 photo cards stay unchanged. */
          .mk-extra-cities-panel {
            margin-top: 12px;
            padding: 12px 14px;
            border: 1px solid #dce8e3;
            border-radius: 12px;
            background: linear-gradient(180deg, #ffffff 0%, #f7faf8 100%);
          }
          .mk-extra-cities-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
            color: #53635e;
            font-size: 12px;
          }
          .mk-extra-city-pills {
            display: grid;
            grid-template-columns: repeat(13, minmax(0, 1fr));
            align-items: stretch;
            gap: 8px;
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 3px 1px 7px;
            scrollbar-width: thin;
            -webkit-overflow-scrolling: touch;
          }
          /* Colorful, high-contrast chips for the 12 additional cities only. */
          .mk-extra-city-pills .mk-all-regions-pill,
          .mk-extra-city-pills .mk-all-regions-pill[aria-pressed="true"] {
            border: 1px solid #004b3c;
            background: linear-gradient(135deg, #006b53, #004638);
            color: #fff;
            box-shadow: 0 2px 5px rgba(0,75,60,.16);
          }
          .mk-extra-city-pills button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 100%;
            min-width: 0;
            min-height: 44px;
            box-sizing: border-box;
            border: 1px solid #c9d8d3;
            border-radius: 10px;
            padding: 7px 5px;
            background: #eef8ff;
            color: #153b58;
            font-size: 11.5px;
            font-weight: 800;
            line-height: 1.2;
            text-align: center;
            white-space: normal;
            cursor: pointer;
            text-shadow: none;
            transition: border-color .15s ease, background .15s ease, transform .15s ease, box-shadow .15s ease;
          }
          .mk-extra-city-pills button:nth-child(2) { background: #e5f4ff; border-color: #7dbce8; color: #124b76; }
          .mk-extra-city-pills button:nth-child(3) { background: #e5f8ed; border-color: #79c99b; color: #145b38; }
          .mk-extra-city-pills button:nth-child(4) { background: #fff1d9; border-color: #e8bb63; color: #754600; }
          .mk-extra-city-pills button:nth-child(5) { background: #f0eaff; border-color: #b4a0f0; color: #49328b; }
          .mk-extra-city-pills button:nth-child(6) { background: #ffe9ef; border-color: #e99bb3; color: #8c2448; }
          .mk-extra-city-pills button:nth-child(7) { background: #e2f8f7; border-color: #72c9c4; color: #075b58; }
          .mk-extra-city-pills button:nth-child(8) { background: #fff0e5; border-color: #e8ad83; color: #7b3a16; }
          .mk-extra-city-pills button:nth-child(9) { background: #eaf0ff; border-color: #9bb2f3; color: #243f8b; }
          .mk-extra-city-pills button:nth-child(10) { background: #f1f7df; border-color: #bfd278; color: #455b12; }
          .mk-extra-city-pills button:nth-child(11) { background: #ffe9df; border-color: #e9a28a; color: #812f19; }
          .mk-extra-city-pills button:nth-child(12) { background: #e7f3ff; border-color: #8ab9e8; color: #164d7b; }
          .mk-extra-city-pills button:nth-child(13) { background: #fce9f7; border-color: #e1a1d2; color: #7b2868; }
          .mk-extra-city-pills button:hover {
            filter: saturate(1.15) brightness(.98);
            border-color: #005744;
            transform: translateY(-1px);
            box-shadow: 0 3px 8px rgba(12,35,29,.12);
          }
          .mk-extra-city-pills button[aria-pressed="true"] {
            border: 2px solid #b78300;
            background: #fff0b8;
            color: #4b3500;
            box-shadow: 0 0 0 2px rgba(246,185,31,.22), 0 3px 8px rgba(12,35,29,.10);
          }
          .mk-extra-city-pills button span:first-child { font-size: 12px; }
          .mk-extra-city-pills small {
            color: inherit;
            opacity: .82;
            font-size: 10px;
            font-weight: 800;
          }
          @media (max-width: 900px) {
            .mk-extra-city-pills {
              grid-template-columns: repeat(13, minmax(78px, 1fr));
            }
          }
          @media (max-width: 640px) {
            .mk-extra-cities-panel { padding: 10px; }
            .mk-extra-cities-heading { align-items: flex-start; flex-direction: column; gap: 3px; }
            .mk-extra-city-pills { gap: 6px; }
            .mk-extra-city-pills button { min-height: 42px; padding: 7px 5px; }
          }
          .mk-follow p { margin: 0; font-size: 14px; color: rgba(255,255,255,.85); }
          .mk-footer-social { display: flex; flex-direction: column; align-items: center; gap: 10px; margin: 18px 0 6px; }
          .mk-footer-social strong { font-size: 13px; letter-spacing: .6px; text-transform: uppercase; color: #005744; }
          .mk-footer-social .mk-social-btn { color: #0c1730; background: #fff; border-color: #d9e7e1; }
          .mk-footer-social .mk-social-btn:hover { color: #fff; }
          /* New KC logo in the header (replaces the old ✦ mark) */
          .mk-logo-img {
            width: 46px;
            height: 46px;
            flex: none;
            border-radius: 50%;
            filter: drop-shadow(0 4px 12px rgba(246,185,31,.35));
          }
          @media (max-width: 760px) {
            .mk-logo-img { width: 38px; height: 38px; }
          }
          /* Keep every homepage block exactly as wide as the content column.
             These sections declare width: min(1500px, 92vw) in their own CSS, which is wider
             than the padded .mk-main column and made them stick out on the right. */
          .mk-main .mk-pdf-popular,
          .mk-main .mk-restaurant-strip,
          .mk-main .mk-tools-strip {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          /* Compact the PDF & Expat Tools cards without changing their destinations. */
          .mk-main .mk-pdf-popular {
            padding: 18px 20px !important;
          }
          .mk-main .mk-pdf-popular h2 {
            font-size: clamp(20px, 2vw, 25px) !important;
            line-height: 1.2 !important;
            margin-bottom: 4px !important;
          }
          .mk-main .mk-pdf-popular [class*="grid"] {
            gap: 9px 10px !important;
          }
          .mk-main .mk-pdf-popular a {
            min-height: 54px !important;
            padding: 8px 10px !important;
            gap: 9px !important;
            border-radius: 12px !important;
          }
          .mk-main .mk-pdf-popular a > span:first-child {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            border-radius: 9px !important;
            font-size: 15px !important;
          }
          .mk-main .mk-pdf-popular a strong {
            font-size: 11.5px !important;
            line-height: 1.2 !important;
          }
          .mk-main .mk-pdf-popular a small {
            font-size: 9.5px !important;
            line-height: 1.25 !important;
            margin-top: 2px !important;
          }
          .mk-main .mk-pdf-popular a > b,
          .mk-main .mk-pdf-popular a > svg:last-child {
            font-size: 16px !important;
            width: 15px !important;
            min-width: 15px !important;
          }
          @media (max-width: 760px) {
            .mk-main .mk-pdf-popular { padding: 14px !important; }
            .mk-main .mk-pdf-popular a { min-height: 52px !important; padding: 7px 8px !important; }
          }
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
        <a
          href="/ksa-connect/rental-scam-warning"
          style={{
            display: "flex", alignItems: "center", gap: 12, margin: "18px 0 6px", padding: "12px 16px",
            borderRadius: 14, background: "linear-gradient(90deg, #b91c1c, #dc2626)", border: "1.5px solid #991b1b", color: "#ffffff",
            boxShadow: "0 8px 20px rgba(185,28,28,.25)",
            textDecoration: "none", width: "100%", boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: 22 }} aria-hidden="true">⚠️</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 14.5 }}>Warning: Fake apartment rental scams in Saudi Arabia</strong>
            <small style={{ fontSize: 12.5, color: "rgba(255,255,255,.9)" }}>Never pay rent or a deposit before verifying the owner, FAL licence and Ejar contract.</small>
          </span>
          <b style={{ whiteSpace: "nowrap", fontSize: 13, color: "#b91c1c", background: "#fff", padding: "6px 12px", borderRadius: 999 }}>Read more →</b>
        </a>

        <PopularPdfTools />

        <section className="mk-tools-strip mk-tools-showcase" aria-labelledby="expat-tools-title">
          <div className="mk-tools-showcase-head">
            <div className="mk-tools-showcase-copy">
              <div className="mk-tools-badge">🧰 &nbsp; 25+ FREE ESSENTIAL TOOLS</div>
              <p className="mk-strip-kicker">💼 Professional Tools</p>
              <h2 id="expat-tools-title">Work, Salary &amp; Business Tools</h2>
              <p className="mk-tools-showcase-desc">
                One place for everyday Saudi expat needs — Iqama, salary, currency, HR, travel, rent and professional tools.
              </p>
              <div className="mk-tools-quick-tags" aria-label="Tool categories">
                <span>🪪 Iqama</span>
                <span>💰 Salary</span>
                <span>💱 Currency</span>
                <span>⏱️ Work &amp; HR</span>
                <span>🗺️ GIS</span>
              </div>
            </div>

            <a href="/tools/" className="mk-tools-explore-cta">
              <span className="mk-tools-cta-icon">🧰</span>
              <span>
                <strong>Explore All Tools</strong>
                <small>25+ useful calculators &amp; tools</small>
              </span>
              <b aria-hidden="true">→</b>
            </a>
          </div>

          <div className="mk-tools-grid">
            {EXPAT_TOOLS.map(([icon, title, description, href]) => (
              <a key={href} href={href} className="mk-tool-card">
                <span className="mk-tool-icon" aria-hidden="true">{icon}</span>
                <span><strong>{title}</strong><small>{description}</small></span>
                <b aria-hidden="true">→</b>
              </a>
            ))}
          </div>
        </section>

        <RestaurantSpotlight />

        <section id="cities" className="mk-section">
          <div className="mk-section-head">
            <h2>Browse Ads by City</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button type="button" onClick={() => setShowAllCities((v) => !v)} aria-expanded={showAllCities}>
                {showAllCities ? "Show main cities ↑" : "View all cities →"}
              </button>
              <button type="button" onClick={() => { setCities(new Set()); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>
                View all ads →
              </button>
            </div>
          </div>

          {/* Keep the seven main city photo cards visible, matching the live homepage. */}
          <div className="mk-city-grid">
            {CITY_OPTIONS.map((city, index) => {
              const count = cityCounts[city.value] ?? cityCounts[city.label] ?? 0;
              const countText = count > 0 ? `${count} ad${count === 1 ? "" : "s"}` : "Be the first to post →";
              const selected = cities.has(city.value) || (city.value === "Madinah" && cities.has("Madina"));
              return (
                <button
                  key={city.value}
                  type="button"
                  className="mk-city-card"
                  aria-pressed={selected}
                  onClick={() => {
                    setCities(new Set([city.value]));
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(2,24,34,.02) 35%, rgba(2,12,20,.9) 100%), url('/images/cities/${city.image}.jpg')`,
                    border: selected ? "2px solid #f6b91f" : undefined,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span aria-hidden="true" style={{ position: "absolute", top: 8, left: 8, width: 23, height: 23, display: "grid", placeItems: "center", borderRadius: "50%", background: "#005744", color: "#fff", fontSize: 12, fontWeight: 800 }}>{index + 1}</span>
                  <span className="mk-city-name">
                    ● &nbsp;{city.label}
                    <small style={{ display: "block", fontSize: 12, fontWeight: 600, opacity: 0.9, marginTop: 2 }}>{countText}</small>
                  </span>
                </button>
              );
            })}
          </div>

          {showAllCities && (
            <div className="mk-extra-cities-panel" aria-label="Additional Saudi cities">
              <div className="mk-extra-cities-heading">
                <strong style={{ color: "#0c1730", fontSize: 13 }}>Explore 12 more cities</strong>
                <span>Select a city to view its ads. Choose All Regions to show listings from every city.</span>
              </div>
              <div className="mk-extra-city-pills" aria-label="All regions and additional cities">
                <button
                  type="button"
                  className="mk-all-regions-pill"
                  aria-pressed={cities.size === 0}
                  title="Show listings from all cities"
                  onClick={() => {
                    setCities(new Set());
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  🇸🇦 <span>All Regions</span>
                </button>
                {(() => {
                  const mainCityValues = new Set(CITY_OPTIONS.map((city) => city.value));
                  const extraCities = REGIONS.flatMap((region) => region.cities
                    .filter((city) => !mainCityValues.has(city) && !CITY_OPTIONS.some((main) => main.label === city))
                    .map((city) => ({ city, region })));

                  return extraCities.map(({ city, region }) => {
                    const count = cityCounts[city] ?? 0;
                    const selected = cities.has(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        aria-pressed={selected}
                        title={`View ${city} listings`}
                        onClick={() => {
                          setCities(new Set([city]));
                          document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        <span aria-hidden="true">{region.emoji}</span>
                        <span>{city}</span>
                        {count > 0 && <small>{count}</small>}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </section>

        <section id="categories" className="mk-section">
          <div className="mk-section-head"><h2>Browse by Category</h2><button onClick={clearAll}>View all categories →</button></div>
          <div
            className="mk-category-grid mk-category-grid-scroll"
            aria-label="Browse listing categories"
            style={{ display: "flex", gap: "8px", overflowX: "auto", overflowY: "hidden", paddingBottom: "8px", scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}
          >
            {CATEGORY_CARDS.map((card) => {
              const selected = categories.has(card.category) && (
                "subcategories" in card
                  ? card.subcategories.some((sub) => selectedSubcategories.has(sub))
                  : selectedSubcategories.size === 0
              );
              return (
                <button
                  key={card.title}
                  type="button"
                  aria-pressed={selected}
                  title={`Browse ${card.title} listings`}
                  className={`mk-category-card${selected ? " mk-category-card-active" : ""}`}
                  style={{
                    flex: "1 0 0",
                    minWidth: "100px",
                    width: "auto",
                    height: "92px",
                    boxSizing: "border-box",
                    scrollSnapAlign: "start",
                    background: CATEGORY_CARD_STYLES[card.category].bg,
                    borderColor: CATEGORY_CARD_STYLES[card.category].border,
                    borderTop: `4px solid ${CATEGORY_CARD_STYLES[card.category].border}`,
                    color: CATEGORY_CARD_STYLES[card.category].accent,
                  }}
                  onClick={() => {
                    setCategories(new Set([card.category]));
                    setSelectedSubcategories(new Set("subcategories" in card ? card.subcategories : []));
                    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span
                    className="mk-category-icon"
                    aria-hidden="true"
                    style={{ background: CATEGORY_CARD_STYLES[card.category].iconBg, color: CATEGORY_CARD_STYLES[card.category].accent }}
                  >{card.icon}</span>
                  <strong>{card.title}</strong>
                  <small>{card.subtitle}</small>
                </button>
              );
            })}
          </div>
        </section>

        <section id="about" className="mk-benefits">
          <div className="mk-why"><p>Why Choose</p><h2>MYKSA <span>CONNECT?</span></h2><ul><li>100% Free to Use</li><li>Post Unlimited Ads</li><li>Chat Directly &amp; Securely</li><li>Reach Local Buyers Faster</li><li>Available Across Every Region of Saudi Arabia</li></ul></div>
          <div className="mk-map-card"><div className="mk-map-art">✦<br />☀</div><div><strong>One Platform.<br />19 Cities, 5 Regions.</strong><b>Millions of Opportunities.</b></div></div>
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



        <section
          className="mk-listings-area"
          id="listings"
          style={{
            background: "#f1f6f3",
            border: "1px solid #d9e7e1",
            borderTop: "3px solid #005744",
            borderRadius: 24,
            padding: "clamp(14px, 2.2vw, 26px)",
            boxShadow: "0 16px 38px rgba(0,55,43,.075)",
            margin: "24px 0 40px",
          }}
        >
          <div className="listings-layout">
            <aside className="filters-sidebar">
              <p className="filters-sidebar-title">Filters {hasActiveFilters && <button className="clear-filters" onClick={clearAll}>Clear All</button>}</p>
              <div className="filter-group">
                <p className="filter-group-title">City</p>
                {(citiesExpanded ? REGIONS : REGIONS.slice(0, 2)).map((r) => {
                  const allOn = r.cities.every((c) => cities.has(c));
                  return (
                    <div key={r.key} style={{ marginBottom: 6 }}>
                      <label className={`checkbox-row${allOn ? " checkbox-row-active" : ""}`} style={{ fontWeight: 800 }}>
                        <input type="checkbox" checked={allOn} onChange={() => toggleRegion(r.cities)} />
                        {r.emoji} {r.label}
                      </label>
                      <div style={{ paddingLeft: 18 }}>
                        {r.cities.map((c) => (
                          <label className={`checkbox-row${cities.has(c) ? " checkbox-row-active" : ""}`} key={c}>
                            <input type="checkbox" checked={cities.has(c)} onChange={() => toggle(cities, setCities, c)} />
                            {c}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button className="view-more-toggle" onClick={() => setCitiesExpanded((v) => !v)}>{citiesExpanded ? "View less ˄" : "All regions ˅"}</button>
              </div>
              <div className="filter-group"><p className="filter-group-title">Category</p>{CATEGORIES.map((c) => <label className={`checkbox-row${categories.has(c) ? " checkbox-row-active" : ""}`} key={c}><input type="checkbox" checked={categories.has(c)} onChange={() => { toggle(categories, setCategories, c); setSelectedSubcategories(new Set()); }} /><span className="checkbox-icon">{CATEGORY_ICONS[c]}</span>{c}</label>)}</div>
            </aside>
            <div className="listings-main">
              <div className="listings-topbar"><input className="search-input" type="text" placeholder="Search listings by title…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} /><select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}><option value="newest">Newest first</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option></select><a href="/ksa-connect/post" className="mk-btn mk-btn-gold listings-post-btn">＋ Post an Ad</a></div>
              {!loading && !error && (
                <p className="results-count">
                  Showing {filtered.length} of {listings.length} listing{listings.length === 1 ? "" : "s"}
                  {regionSelected && <> in <strong>{regionSelected.label} Region</strong></>}
                  {!regionSelected && cities.size === 1 && (
                    <> in <strong>{Array.from(cities)[0]}</strong></>
                  )}
                  {categories.size === 1 && <> · {Array.from(categories)[0]}</>}{selectedSubcategories.size > 0 && <> · {Array.from(selectedSubcategories).join(" / ")}</>}
                </p>
              )}
              {loading && <div className="listing-grid" style={{ margin: "20px 0 0" }}>{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton skeleton-image" /><div className="skeleton-body"><div className="skeleton skeleton-line" style={{ width: "80%" }} /><div className="skeleton skeleton-line" style={{ width: "50%" }} /><div className="skeleton skeleton-line" style={{ width: "65%", marginBottom: 0 }} /></div></div>)}</div>}
              {error && <div className="empty-state" style={{ color: "#b91c1c" }}>Couldn&apos;t load listings: {error}<br /><span style={{ fontSize: 12 }}>(Check Firestore security rules and your .env.local Firebase config.)</span></div>}
              {!loading && !error && filtered.length === 0 && <div className="empty-state"><span className="empty-icon">🔍</span>No listings found. Try a different city, category, or search term.</div>}
              {!loading && !error && filtered.length > 0 && (
                <div className="listing-grid" style={{ margin: "20px 0 0" }}>
                  {filtered.map((l) => (
                    <div className="listing-card" key={l.id} style={{ display: "flex", flexDirection: "column", background: "#ffffff", border: "1.5px solid #9db9ac", boxShadow: "0 4px 14px rgba(0,55,43,.08)" }}>
                      <div style={{ position: "relative" }} className="listing-image">
                        {l.imageUrls?.[0] ? (
                          <Image src={l.imageUrls[0]} alt={l.title} fill sizes="(max-width: 640px) 50vw, 280px" style={{ objectFit: "cover" }} />
                        ) : (
                          <div className="listing-image-empty" style={{ width: "100%", height: "100%" }} />
                        )}
                        {l.createdAt && <span className="date-badge">{timeAgo(l.createdAt)}</span>}
                        <button className="heart-btn" aria-label="Save listing" title="Save listing">🤍</button>
                      </div>
                      <div className="listing-body" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <p className="listing-category-tag">{l.category}</p>
                        <p className="listing-title">{l.title}</p>
                        <p className="listing-price">{formattedPrice(l)}</p>
                        <p className="listing-location">{l.city} · {l.location}</p>
                        <div style={{ marginTop: "auto", paddingTop: 12 }}>
                          <a
                            href={`/ksa-connect/${l.id}`}
                            aria-label={`View details: ${l.title}`}
                            style={{ display: "block", textAlign: "center", padding: "9px 0", borderRadius: 8, background: "#005744", color: "#ffffff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                          >
                            View Details
                          </a>
                        </div>
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
                  📖 Resources
                </p>
                <h2 style={{ margin: "4px 0 0" }}>Expat Guides</h2>
              </div>
              <a href="/ksa-connect/blog">View all →</a>
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
                    Read more →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mk-final-cta"><div><h2>Ready to Buy, Sell and Connect?</h2><p>Join thousands of expatriates using MYKSA CONNECT every day.</p><a href="/ksa-connect/post" className="mk-btn mk-btn-gold">Post Your Ad Now →</a><div className="mk-follow"><p>Follow MYKSA Connect for new ads every day</p><SocialIcons size={42} /></div></div></section>
      <footer className="footer">
        <div className="container">
          <section className="mk-trust-strip" aria-label="Trust and support info">
            <div><span>♙</span><strong>Safe &amp; Secure</strong><small>Your privacy and safety are our priority.</small></div>
            <div><span>♢</span><strong>Verified Users</strong><small>Build trust with verified buyers and sellers.</small></div>
            <div><span>◎</span><strong>All Across Saudi Arabia</strong><small>19 cities across 5 regions. One trusted platform.</small></div>
            <div><span>♧</span><strong>24/7 Support</strong><small>We are here to help you anytime.</small></div>
          </section>
        </div>
        <div className="mk-footer-social">
          <strong>Follow us</strong>
          <SocialIcons size={38} />
        </div>
        <p>
          <a href="/ksa-connect/blog">Guides</a> ·{" "}
          <a href="/ksa-connect/faq">FAQ</a> ·{" "}
          <a href="/ksa-connect/privacy">Privacy Policy</a> ·{" "}
          <a href="/ksa-connect/safety">Safety &amp; Fraud Prevention</a> ·{" "}
          <a href="mailto:myksaconnect@gmail.com">Contact</a>
        </p>
      </footer>
    </div>
  );
}
