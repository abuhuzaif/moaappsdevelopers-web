"use client";

const TOOLS = [
  ["📄", "PDF to Word", "Convert PDF files to editable Word documents.", "/tools/pdf-to-word/"],
  ["🔗", "Merge PDF", "Combine multiple PDF files into one document.", "/tools/merge-pdf/"],
  ["🗜️", "Compress PDF", "Reduce PDF size for easy sharing and upload.", "/tools/compress-pdf/"],
  ["🖼️", "JPG to PDF", "Convert images into a professional PDF online.", "/tools/jpg-to-pdf/"],
  ["📑", "PDF to JPG", "Convert PDF pages into high-quality JPG images.", "/tools/pdf-to-jpg/"],
  ["✂️", "Split PDF", "Split a PDF and extract only the pages you need.", "/tools/split-pdf/"],
  ["✍️", "Sign PDF", "Add, move and resize your signature on a PDF.", "/tools/sign-pdf/", "NEW"],
  ["🔎", "PDF OCR", "Extract searchable text from scanned PDFs.", "/tools/pdf-ocr/"],
] as const;

const COLORS = [
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
  "cyan",
  "pink",
  "violet",
];

export default function PopularPdfTools() {
  return (
    <section className="mk-pdf-popular" aria-labelledby="popular-pdf-tools-title">
      <style>{`
        .mk-pdf-popular {
          position: relative;
          overflow: hidden;
          margin: 0 0 34px;
          padding: 28px;
          border-radius: 22px;
          background:
            radial-gradient(circle at 100% 0%, rgba(246,185,31,.10), transparent 28%),
            linear-gradient(145deg, #ffffff 0%, #f7fbf9 100%);
          border: 1px solid #dce8e3;
          box-shadow: 0 12px 32px rgba(0,55,43,.07);
        }
        .mk-pdf-popular::before {
          content: "";
          position: absolute;
          left: -100px;
          bottom: -120px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(0,87,68,.035);
          pointer-events: none;
        }
        .mk-pdf-head {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }
        .mk-pdf-heading-wrap { min-width: 0; }
        .mk-pdf-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #fff6dc;
          border: 1px solid #f1d98a;
          color: #7a5a00;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .65px;
          text-transform: uppercase;
        }
        .mk-pdf-head h2 {
          margin: 0;
          color: #102f29;
          font-size: clamp(23px, 2.5vw, 29px);
          line-height: 1.12;
          letter-spacing: -.45px;
        }
        .mk-pdf-head p:not(.mk-pdf-kicker) {
          margin: 7px 0 0;
          max-width: 650px;
          color: #64736e;
          font-size: 13px;
          line-height: 1.55;
        }
        .mk-pdf-all {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex: 0 0 auto;
          white-space: nowrap;
          padding: 10px 13px;
          border-radius: 11px;
          background: #005744;
          border: 1px solid #006b55;
          color: #fff;
          text-decoration: none;
          font-weight: 900;
          font-size: 12px;
          box-shadow: 0 7px 16px rgba(0,87,68,.13);
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .mk-pdf-all:hover {
          transform: translateY(-2px);
          box-shadow: 0 11px 22px rgba(0,87,68,.18);
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
          min-height: 92px;
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
          filter: saturate(1.04);
          box-shadow: 0 13px 26px rgba(0,55,43,.12);
        }
        .mk-pdf-card strong {
          display: block;
          color: #173b33;
          font-size: 13.5px;
          line-height: 1.2;
        }
        .mk-pdf-card small {
          display: block;
          margin-top: 5px;
          color: #5f6f6a;
          font-size: 10.5px;
          line-height: 1.38;
        }
        .mk-pdf-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          flex: 0 0 44px;
          border-radius: 12px;
          font-size: 22px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.35);
        }
        .mk-pdf-arrow {
          margin-left: auto;
          padding-left: 4px;
          font-size: 18px;
          font-weight: 900;
        }
        .mk-pdf-card.blue { background:#eef6ff; border-color:#bfdbfe; border-top-color:#3b82f6; }.mk-pdf-card.blue .mk-pdf-icon{background:#dbeafe}.mk-pdf-card.blue .mk-pdf-arrow{color:#2563eb}
        .mk-pdf-card.green { background:#ecfdf5; border-color:#a7f3d0; border-top-color:#22c55e; }.mk-pdf-card.green .mk-pdf-icon{background:#d1fae5}.mk-pdf-card.green .mk-pdf-arrow{color:#16a34a}
        .mk-pdf-card.yellow { background:#fff9df; border-color:#fde68a; border-top-color:#eab308; }.mk-pdf-card.yellow .mk-pdf-icon{background:#fef3c7}.mk-pdf-card.yellow .mk-pdf-arrow{color:#ca8a04}
        .mk-pdf-card.purple { background:#f7f0ff; border-color:#ddd6fe; border-top-color:#8b5cf6; }.mk-pdf-card.purple .mk-pdf-icon{background:#ede9fe}.mk-pdf-card.purple .mk-pdf-arrow{color:#7c3aed}
        .mk-pdf-card.orange { background:#fff1e8; border-color:#fed7aa; border-top-color:#f97316; }.mk-pdf-card.orange .mk-pdf-icon{background:#ffedd5}.mk-pdf-card.orange .mk-pdf-arrow{color:#ea580c}
        .mk-pdf-card.cyan { background:#eafbff; border-color:#a5f3fc; border-top-color:#06b6d4; }.mk-pdf-card.cyan .mk-pdf-icon{background:#cffafe}.mk-pdf-card.cyan .mk-pdf-arrow{color:#0891b2}
        .mk-pdf-card.pink { background:#fff0f7; border-color:#fbcfe8; border-top-color:#ec4899; }.mk-pdf-card.pink .mk-pdf-icon{background:#fce7f3}.mk-pdf-card.pink .mk-pdf-arrow{color:#db2777}
        .mk-pdf-card.violet { background:#f2f0ff; border-color:#c4b5fd; border-top-color:#7c3aed; }.mk-pdf-card.violet .mk-pdf-icon{background:#ede9fe}.mk-pdf-card.violet .mk-pdf-arrow{color:#6d28d9}
        .mk-pdf-new {
          position: absolute;
          right: 9px;
          top: 8px;
          padding: 3px 7px;
          border-radius: 999px;
          background: #f6b91f;
          color: #4e3900;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: .55px;
        }
        @media (max-width: 1000px) {
          .mk-pdf-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (max-width: 650px) {
          .mk-pdf-popular { padding: 19px; border-radius: 18px; }
          .mk-pdf-head { align-items: flex-start; flex-direction: column; gap: 13px; }
          .mk-pdf-all { align-self: flex-start; }
        }
        @media (max-width: 520px) {
          .mk-pdf-grid { grid-template-columns: 1fr; }
          .mk-pdf-card { min-height: 78px; }
        }
      `}</style>

      <div className="mk-pdf-head">
        <div className="mk-pdf-heading-wrap">
          <p className="mk-pdf-kicker">🔥 Most Popular PDF Tools</p>
          <h2 id="popular-pdf-tools-title">Free Online PDF Tools</h2>
          <p>Fast, simple browser-based tools for converting, merging, compressing, splitting, signing and working with PDF files.</p>
        </div>
        <a className="mk-pdf-all" href="/tools/">View All PDF Tools <span aria-hidden="true">→</span></a>
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
