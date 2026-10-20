"use client";

import { useEffect, useState } from "react";

// ── Matching ───────────────────────────────────────────────────────────────
// Words people type that are not in a tool's name, mapped to words that are.
// Entries must already be lower-case, letters/digits/spaces only.
const ALIASES: Record<string, string[]> = {
  photo: ["jpg", "png", "webp", "image"],
  picture: ["jpg", "png", "webp", "image"],
  pic: ["jpg", "png", "webp", "image"],
  image: ["jpg", "png", "webp"],
  docx: ["word"],
  doc: ["word"],
  xls: ["excel"],
  xlsx: ["excel"],
  powerpoint: ["ppt"],
  slides: ["ppt"],
  scan: ["ocr"],
  scanned: ["ocr"],
  riyal: ["sar", "currency"],
  money: ["currency", "salary"],
  exchange: ["currency"],
  visa: ["iqama"],
  residency: ["iqama"],
  eosb: ["end of service"],
  gratuity: ["end of service"],
  insurance: ["gosi"],
  autocad: ["dwg", "dxf"],
  cad: ["dwg", "dxf"],
  drawing: ["dwg", "dxf"],
  map: ["kml", "shp", "geojson", "utm"],
  gps: ["utm", "lat lon", "kml"],
  coordinates: ["utm", "lat lon", "kml"],
  loan: ["emi"],
  mortgage: ["emi"],
  installment: ["emi"],
  tax: ["vat"],
  weight: ["bmi"],
  height: ["feet", "bmi"],
  land: ["acre", "hectare", "marla", "gaz"],
  plot: ["marla", "gaz", "acre"],
  property: ["marla", "gaz", "square"],
  islamic: ["hijri"],
  calendar: ["hijri"],
  shrink: ["compress"],
  reduce: ["compress"],
  signature: ["sign"],
  combine: ["merge"],
  join: ["merge"],
};

const STOP_WORDS = new Set(["to", "and", "the", "a", "for", "of", "in", "into"]);

export function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function parseQuery(q: string): string[] {
  return norm(q)
    .split(" ")
    .filter((t) => t && !STOP_WORDS.has(t));
}

// A token matches when it is the START of a word in the card text, so "age" finds
// "Age Calculator" but not "Image Compressor" or "Extract PDF Pages".
function startsAWord(paddedText: string, token: string): boolean {
  return paddedText.includes(" " + token);
}

export function matchesTokens(searchText: string, tokens: string[]): boolean {
  const padded = " " + norm(searchText);
  return tokens.every((t) => startsAWord(padded, t) || (ALIASES[t] ?? []).some((a) => startsAWord(padded, a)));
}

// ── DOM filtering ──────────────────────────────────────────────────────────
// The page is rendered on the server with every tool link in the HTML (good for SEO).
// This only toggles which cards are shown in the browser.
export function applyToolFilter(root: ParentNode, query: string) {
  const tokens = parseQuery(query);
  const searching = tokens.length > 0;

  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-tool-card]"));
  const total = new Set(cards.map((c) => c.getAttribute("href") || "")).size;

  const shown = new Set<string>();
  for (const card of cards) {
    const href = card.getAttribute("href") || "";
    let show = !searching || matchesTokens(card.dataset.search || "", tokens);
    if (show && searching) {
      if (shown.has(href)) show = false; // same tool listed in two sections: show once
      else shown.add(href);
    }
    card.style.display = show ? "" : "none";
  }

  for (const section of Array.from(root.querySelectorAll<HTMLElement>("[data-tool-section]"))) {
    const anyVisible = Array.from(section.querySelectorAll<HTMLElement>("[data-tool-card]")).some(
      (c) => c.style.display !== "none"
    );
    // While searching, a section with no matching card (including the "featured" panel,
    // whose cards repeat the ones below) is hidden.
    section.style.display = searching && !anyVisible ? "none" : "";
  }
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-hide-on-search]"))) {
    el.style.display = searching ? "none" : "";
  }

  return { visible: searching ? shown.size : total, total, searching };
}

// ── UI ─────────────────────────────────────────────────────────────────────
const POPULAR = ["PDF to Word", "Compress PDF", "JPG to PDF", "Iqama", "Salary", "DXF", "EMI", "VAT"];

export default function ToolsSearch() {
  const [q, setQ] = useState("");
  const [stats, setStats] = useState({ visible: 0, total: 0, searching: false });

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
  }, []);

  useEffect(() => {
    setStats(applyToolFilter(document, q));
    try {
      const url = new URL(window.location.href);
      if (q.trim()) url.searchParams.set("q", q.trim());
      else url.searchParams.delete("q");
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      /* keeping the URL in sync is optional */
    }
  }, [q]);

  const noResults = stats.searching && stats.visible === 0;

  return (
    <div className="ts-wrap" role="search">
      <style>{`
        .ts-wrap{position:sticky;top:8px;z-index:30;margin:18px 0 0;padding:10px;border-radius:18px;background:rgba(251,250,247,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid #dfe7e3;box-shadow:0 8px 24px rgba(6,23,42,.08)}
        .ts-box{display:flex;align-items:center;gap:10px;height:50px;padding:0 14px;background:#fff;border:1.5px solid #cbd9d4;border-radius:14px;transition:border-color .15s,box-shadow .15s}
        .ts-box:focus-within{border-color:#005744;box-shadow:0 0 0 3px rgba(0,87,68,.12)}
        .ts-box svg{flex:0 0 auto;color:#5d6a68}
        .ts-box input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font:inherit;font-size:15px;color:#0b1719}
        .ts-box input::-webkit-search-cancel-button{display:none}
        .ts-clear{border:0;background:#eef3f1;color:#33413f;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:12px;line-height:1}
        .ts-meta{margin:8px 4px 0;font-size:12px;color:#5d6a68;min-height:16px}
        .ts-chips{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0 2px}
        .ts-chip{border:1px solid #cfe2dc;background:#f1f8f5;color:#005744;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:800;cursor:pointer}
        .ts-chip:hover{background:#e3f1ec}
        .ts-empty{margin-top:10px;padding:16px;border-radius:12px;background:#fff9e8;border:1px solid #f0dfaa;color:#5d5231;font-size:14px;line-height:1.55}
        @media(max-width:600px){.ts-wrap{top:4px;padding:8px;border-radius:14px}.ts-box{height:46px}}
      `}</style>

      <label className="ts-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all tools — PDF to Word, Iqama, DXF, EMI…"
          aria-label="Search tools"
          autoComplete="off"
          spellCheck={false}
        />
        {q && (
          <button type="button" className="ts-clear" onClick={() => setQ("")} aria-label="Clear search">
            ✕
          </button>
        )}
      </label>

      <div className="ts-meta" aria-live="polite">
        {stats.searching
          ? noResults
            ? ""
            : `${stats.visible} tool${stats.visible === 1 ? "" : "s"} found`
          : stats.total > 0
            ? `${stats.total} free tools — type above to filter`
            : ""}
      </div>

      {!stats.searching && (
        <div className="ts-chips">
          {POPULAR.map((p) => (
            <button key={p} type="button" className="ts-chip" onClick={() => setQ(p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {noResults && (
        <div className="ts-empty">
          No tools match <strong>&ldquo;{q.trim()}&rdquo;</strong>. Try fewer or simpler words, for example &ldquo;pdf&rdquo;,
          &ldquo;salary&rdquo; or &ldquo;image&rdquo;.
          <div className="ts-chips">
            {POPULAR.slice(0, 5).map((p) => (
              <button key={p} type="button" className="ts-chip" onClick={() => setQ(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
