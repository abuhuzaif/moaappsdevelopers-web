"use client";

import { useEffect, useState } from "react";

// Slim navy line under the restaurant's contact bar. The message rotates every
// few seconds (like a banner) and each message opens the matching ads.
// Every link carries utm tags (utm_source=menu_<slug>) for GA4.

const NAVY = "#0C1730";
const GOLD = "#E8B84B";
const ROTATE_MS = 3500;

type Line = { icon: string; text: string; cta: string; category?: string; post?: boolean };

function lines(place: string): Line[] {
  return [
    { icon: "🏠", text: `Looking for a room or flat in ${place}?`, cta: "See free ads", category: "Housing" },
    { icon: "💼", text: `New jobs in ${place} every day`, cta: "See jobs", category: "Jobs" },
    { icon: "🚗", text: `Buy or sell a car in ${place}`, cta: "See cars", category: "Car" },
    { icon: "🛠️", text: "AC repair, cleaning, movers & more", cta: "See services", category: "Services" },
    { icon: "📢", text: "Selling something or hiring?", cta: "Post a free ad", post: true },
  ];
}

function linkFor(line: Line, slug: string, city?: string) {
  const p = new URLSearchParams();
  if (line.category) p.set("category", line.category);
  if (city && !line.post) p.set("city", city);
  p.set("utm_source", `menu_${slug}`);
  p.set("utm_medium", "restaurant_menu");
  p.set("utm_campaign", "menu_strip");
  return `${line.post ? "/ksa-connect/post" : "/ksa-connect"}?${p.toString()}`;
}

export default function ExploreAdsStrip({ slug, city }: { slug: string; city?: string }) {
  const all = lines(city || "Saudi Arabia");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // People who turn off motion on their phone see the first line only.
    if (paused || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % all.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, all.length]);

  const line = all[i];

  return (
    <a
      href={linkFor(line, slug, city)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        display: "block",
        overflow: "hidden",
        padding: "9px 16px",
        background: NAVY,
        color: "#fff",
        fontSize: 13,
        textDecoration: "none",
        textAlign: "center",
        minHeight: 38,
      }}
    >
      <style>{`
        @keyframes mkAdsTick { from { opacity: 0; transform: translateY(70%); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .mk-ads-tick { animation: none !important; } }
      `}</style>
      <span
        key={i}
        className="mk-ads-tick"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
          animation: "mkAdsTick 0.45s ease-out",
        }}
      >
        <span>
          <span aria-hidden>{line.icon}</span> {line.text}
        </span>
        <span style={{ color: GOLD, fontWeight: 700, textDecoration: "underline" }}>{line.cta}</span>
      </span>
    </a>
  );
}
