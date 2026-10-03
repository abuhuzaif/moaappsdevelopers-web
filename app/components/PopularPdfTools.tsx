"use client";

const TOOLS = [
  ["📄", "PDF to Word", "Convert PDF files to editable Word documents.", "/tools/pdf-to-word/"],
  ["🔗", "Merge PDF", "Combine multiple PDF files into one document.", "/tools/merge-pdf/"],
  ["🗜️", "Compress PDF", "Reduce PDF size for easy sharing and upload.", "/tools/compress-pdf/"],
  ["📐", "PDF to DXF", "Convert vector PDF drawings to DXF format online.", "/tools/pdf-to-dxf/"],
  ["📑", "PDF to JPG", "Convert PDF pages into high-quality JPG images.", "/tools/pdf-to-jpg/"],
  ["✂️", "Split PDF", "Split a PDF and extract only the pages you need.", "/tools/split-pdf/"],
  ["✍️", "Sign PDF", "Add, move and resize your signature on a PDF.", "/tools/sign-pdf/", "NEW"],
  ["🔎", "PDF OCR", "Extract searchable text from scanned PDFs.", "/tools/pdf-ocr/"],
  ["🪪", "Iqama Expiry Calculator", "Check your Iqama expiry date quickly.", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "Convert Hijri and Gregorian dates instantly.", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "Calculate monthly and yearly salary.", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "Convert SAR to INR, PKR and more.", "/tools/sar-currency-converter/"],
] as const;

const COLORS = [
  "blue", "green", "yellow", "purple", "orange", "cyan",
  "pink", "violet", "sky", "emerald", "gold", "indigo",
];

export default function PopularPdfTools() {
  return (
    <section className="mk-pdf-popular" aria-labelledby="popular-pdf-tools-title">
      <style>{`
        /* The homepage should show the 12 featured tools only once.
           The secondary tools showcase remains available through /tools/. */
        .mk-tools-showcase { display: none !important; }

        .mk-pdf-popular {
          position: relative;
          overflow: hidden;
          margin: 4px auto 38px;
          padding: 30px;
          width: min(1500px, 92vw);
          border-radius: 24px;
          background:
            radial-gradient(circle at 100% 0%, rgba(246,185,31,.13), transparent 25%),
            radial-gradient(circle at 0% 100%, rgba(0,87,68,.055), transparent 28%),
            linear-gradient(145deg, #ffffff 0%, #f8fbfa 100%);
          border: 1px solid #d9e7e1;
          box-shadow: 0 16px 38px rgba(0,55,43,.075);
        }
        .mk-pdf-popular::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #22c55e, #eab308, #8b5cf6, #f97316, #06b6d4, #ec4899, #7c3aed, #38bdf8, #10b981, #f59e0b, #6366f1);
          opacity: .9;
        }
        .mk-pdf-head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 21px;
        }
        .mk-pdf-heading-wrap { min-width: 0; }
        .mk-pdf-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 9px;
          padding: 6px 11px;
          border-radius: 999px;
          background: #fff6dc;
          border: 1px solid #f1d98a;
          color: #7a5a00;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .7px;
          text-transform: uppercase;
        }
        .mk-pdf-head h2 {
          margin: 0;
          color: #102f29;
          font-size: clamp(24px, 2.6vw, 31px);
          line-height: 1.1;
          letter-spacing: -.6px;
        }
        .mk-pdf-head p:not(.mk-pdf-kicker) {
          margin: 8px 0 0;
          max-width: 720px;
          color: #64736e;
          font-size: 13px;
          line-height: 1.58;
        }
        .mk-pdf-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 12px;
        }
        .mk-pdf-trust span {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(0,87,68,.045);
          border: 1px solid #dce9e4;
          color: #24564b;
          font-size: 10px;
          font-weight: 800;
        }
        .mk-pdf-all {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
          white-space: nowrap;
          padding: 11px 15px;
          border-radius: 12px;
          background: linear-gradient(135deg, #006650, #004936);
          border: 1px solid rgba(246,185,31,.55);
          color: #fff;
          text-decoration: none;
          font-weight: 900;
          font-size: 12px;
          box-shadow: 0 8px 18px rgba(0,87,68,.15);
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .mk-pdf-all:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(0,87,68,.22);
        }
        .mk-pdf-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
        }
        .mk-pdf-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 94px;
          padding: 14px 13px;
          border-radius: 16px;
          text-decoration: none;
          border: 1px solid transparent;
          border-top-width: 3px;
          box-shadow: 0 5px 14px rgba(0,55,43,.055);
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }
        .mk-pdf-card:hover {
          transform: translateY(-4px);
          filter: saturate(1.06);
          box-shadow: 0 14px 28px rgba(0,55,43,.13);
        }
        .mk-pdf-card:focus-visible {
          outline: 3px solid rgba(0,87,68,.22);
          outline-offset: 2px;
        }
        .mk-pdf-card strong { display: block; color: #173b33; font-size: 13.5px; line-height: 1.2; }
        .mk-pdf-card small { display: block; margin-top: 5px; color: #5f6f6a; font-size: 10.5px; line-height: 1.38; }
        .mk-pdf-icon { width: 45px; height: 45px; display: grid; place-items: center; flex: 0 0 45px; border-radius: 12px; font-size: 22px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.45); }
        .mk-pdf-arrow { margin-left: auto; padding-left: 4px; font-size: 18px; font-weight: 900; }
        .mk-pdf-card.blue { background:#eef6ff; border-color:#bfdbfe; border-top-color:#3b82f6; }.mk-pdf-card.blue .mk-pdf-icon{background:#dbeafe}.mk-pdf-card.blue .mk-pdf-arrow{color:#2563eb}
        .mk-pdf-card.green { background:#ecfdf5; border-color:#a7f3d0; border-top-color:#22c55e; }.mk-pdf-card.green .mk-pdf-icon{background:#d1fae5}.mk-pdf-card.green .mk-pdf-arrow{color:#16a34a}
        .mk-pdf-card.yellow { background:#fff9df; border-color:#fde68a; border-top-color:#eab308; }.mk-pdf-card.yellow .mk-pdf-icon{background:#fef3c7}.mk-pdf-card.yellow .mk-pdf-arrow{color:#ca8a04}
        .mk-pdf-card.purple { background:#f7f0ff; border-color:#ddd6fe; border-top-color:#8b5cf6; }.mk-pdf-card.purple .mk-pdf-icon{background:#ede9fe}.mk-pdf-card.purple .mk-pdf-arrow{color:#7c3aed}
        .mk-pdf-card.orange { background:#fff1e8; border-color:#fed7aa; border-top-color:#f97316; }.mk-pdf-card.orange .mk-pdf-icon{background:#ffedd5}.mk-pdf-card.orange .mk-pdf-arrow{color:#ea580c}
        .mk-pdf-card.cyan { background:#eafbff; border-color:#a5f3fc; border-top-color:#06b6d4; }.mk-pdf-card.cyan .mk-pdf-icon{background:#cffafe}.mk-pdf-card.cyan .mk-pdf-arrow{color:#0891b2}
        .mk-pdf-card.pink { background:#fff0f7; border-color:#fbcfe8; border-top-color:#ec4899; }.mk-pdf-card.pink .mk-pdf-icon{background:#fce7f3}.mk-pdf-card.pink .mk-pdf-arrow{color:#db2777}
        .mk-pdf-card.violet { background:#f2f0ff; border-color:#c4b5fd; border-top-color:#7c3aed; }.mk-pdf-card.violet .mk-pdf-icon{background:#ede9fe}.mk-pdf-card.violet .mk-pdf-arrow{color:#6d28d9}
        .mk-pdf-card.sky { background:#edf8ff; border-color:#bae6fd; border-top-color:#38bdf8; }.mk-pdf-card.sky .mk-pdf-icon{background:#e0f2fe}.mk-pdf-card.sky .mk-pdf-arrow{color:#0284c7}
        .mk-pdf-card.emerald { background:#ecfdf7; border-color:#a7f3d0; border-top-color:#10b981; }.mk-pdf-card.emerald .mk-pdf-icon{background:#d1fae5}.mk-pdf-card.emerald .mk-pdf-arrow{color:#059669}
        .mk-pdf-card.gold { background:#fff8df; border-color:#fcd34d; border-top-color:#f59e0b; }.mk-pdf-card.gold .mk-pdf-icon{background:#fef3c7}.mk-pdf-card.gold .mk-pdf-arrow{color:#d97706}
        .mk-pdf-card.indigo { background:#eef2ff; border-color:#c7d2fe; border-top-color:#6366f1; }.mk-pdf-card.indigo .mk-pdf-icon{background:#e0e7ff}.mk-pdf-card.indigo .mk-pdf-arrow{color:#4f46e5}
        .mk-pdf-new { position: absolute; right: 9px; top: 8px; padding: 3px 7px; border-radius: 999px; background: #f6b91f; color: #4e3900; font-size: 7.5px; font-weight: 900; letter-spacing: .55px; }
        @media (max-width: 1000px) { .mk-pdf-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 650px) { .mk-pdf-popular { width: 92vw; padding: 20px; border-radius: 19px; } .mk-pdf-head { align-items: flex-start; flex-direction: column; gap: 13px; } .mk-pdf-all { align-self: flex-start; } }
        @media (max-width: 520px) { .mk-pdf-grid { grid-template-columns: 1fr; } .mk-pdf-card { min-height: 80px; } }
      `}</style>

      <div className="mk-pdf-head">
        <div className="mk-pdf-heading-wrap">
          <p className="mk-pdf-kicker">🔥 Most Popular Tools</p>
          <h2 id="popular-pdf-tools-title">Free Online PDF &amp; Expat Tools</h2>
          <p>Fast, simple browser-based tools for PDFs plus the essential calculators Saudi Arabia expats use every day.</p>
          <div className="mk-pdf-trust" aria-label="Tool benefits">
            <span>✓ Free to use</span>
            <span>✓ No desktop software</span>
            <span>✓ Browser based</span>
          </div>
        </div>
        <a className="mk-pdf-all" href="/tools/">Explore All Tools <span aria-hidden="true">→</span></a>
      </div>

      <div className="mk-pdf-grid">
        {TOOLS.map(([icon, title, description, href, badge], index) => (
          <a className={`mk-pdf-card ${COLORS[index]}`} href={href} key={href}>
            {badge && <span className="mk-pdf-new">{badge}</span>}
            <span className="mk-pdf-icon" aria-hidden="true">{icon}</span>
            <span><strong>{title}</strong><small>{description}</small></span>
            <b className="mk-pdf-arrow" aria-hidden="true">→</b>
          </a>
        ))}
      </div>
    </section>
  );
}
