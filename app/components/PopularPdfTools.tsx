"use client";

const TOOLS = [
  ["📄", "PDF to Word", "Convert PDF files to editable Word documents.", "/tools/pdf-to-word/"],
  ["🔗", "Merge PDF", "Combine multiple PDF files into one document.", "/tools/merge-pdf/"],
  ["🗜️", "Compress PDF", "Reduce PDF size for easy sharing and upload.", "/tools/compress-pdf/"],
  ["🖼️", "JPG to PDF", "Convert images to a professional PDF online.", "/tools/jpg-to-pdf/"],
  ["📑", "PDF to JPG", "Convert PDF pages into high-quality JPG images.", "/tools/pdf-to-jpg/"],
  ["✂️", "Split PDF", "Split a PDF and extract the pages you need.", "/tools/split-pdf/"],
  ["✍️", "Sign PDF", "Add, move and resize your signature on a PDF.", "/tools/sign-pdf/", "NEW"],
  ["🔎", "PDF OCR", "Extract searchable text from scanned PDFs.", "/tools/pdf-ocr/"],
] as const;

export default function PopularPdfTools() {
  return (
    <section className="mk-pdf-popular" aria-labelledby="popular-pdf-tools-title">
      <style>{`
        .mk-pdf-popular{position:relative;overflow:hidden;margin:0 0 28px;padding:24px;border-radius:20px;background:linear-gradient(135deg,#f8fbfa,#ffffff);border:1px solid #dce9e4;box-shadow:0 8px 24px rgba(0,55,43,.06)}
        .mk-pdf-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}
        .mk-pdf-kicker{margin:0 0 5px;color:#8b6500;font-size:11px;font-weight:900;letter-spacing:.7px;text-transform:uppercase}
        .mk-pdf-head h2{margin:0;color:#12332c;font-size:25px}
        .mk-pdf-head p{margin:6px 0 0;color:#65736e;font-size:13px;line-height:1.5}
        .mk-pdf-all{white-space:nowrap;text-decoration:none;color:#005744;font-weight:900;font-size:13px}
        .mk-pdf-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .mk-pdf-card{position:relative;display:flex;align-items:center;gap:11px;min-height:88px;padding:14px;border-radius:15px;text-decoration:none;background:#fff;border:1px solid #dce7e3;box-shadow:0 5px 14px rgba(0,55,43,.06);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
        .mk-pdf-card:hover{transform:translateY(-3px);box-shadow:0 12px 24px rgba(0,55,43,.12);border-color:#a9c9bd}
        .mk-pdf-icon{width:46px;height:46px;display:grid;place-items:center;flex:0 0 46px;border-radius:13px;background:linear-gradient(135deg,#e8f7f1,#fff1c8);font-size:23px}
        .mk-pdf-card:nth-child(2) .mk-pdf-icon{background:#e8f0ff}.mk-pdf-card:nth-child(3) .mk-pdf-icon{background:#fff0e8}.mk-pdf-card:nth-child(4) .mk-pdf-icon{background:#f4eaff}.mk-pdf-card:nth-child(5) .mk-pdf-icon{background:#e8f8ff}.mk-pdf-card:nth-child(6) .mk-pdf-icon{background:#fff4e0}.mk-pdf-card:nth-child(7) .mk-pdf-icon{background:#e8f7f1}.mk-pdf-card:nth-child(8) .mk-pdf-icon{background:#f1ebff}
        .mk-pdf-card strong{display:block;color:#173b33;font-size:14px;line-height:1.2}.mk-pdf-card small{display:block;margin-top:5px;color:#6b7975;font-size:11px;line-height:1.35}.mk-pdf-arrow{margin-left:auto;color:#005744;font-weight:900;font-size:18px}
        .mk-pdf-new{position:absolute;right:9px;top:8px;padding:3px 7px;border-radius:999px;background:#f6b91f;color:#4e3900;font-size:8px;font-weight:900;letter-spacing:.5px}
        @media(max-width:900px){.mk-pdf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:560px){.mk-pdf-popular{padding:17px}.mk-pdf-head{align-items:flex-start;flex-direction:column}.mk-pdf-grid{grid-template-columns:1fr}.mk-pdf-card{min-height:76px}.mk-pdf-all{align-self:flex-start}}
      `}</style>
      <div className="mk-pdf-head">
        <div>
          <p className="mk-pdf-kicker">🔥 Most Popular PDF Tools</p>
          <h2 id="popular-pdf-tools-title">Free Online PDF Tools</h2>
          <p>Convert, merge, compress, split and sign PDF files quickly and easily.</p>
        </div>
        <a className="mk-pdf-all" href="/tools/">View All PDF Tools →</a>
      </div>
      <div className="mk-pdf-grid">
        {TOOLS.map(([icon,title,description,href,badge]) => (
          <a className="mk-pdf-card" href={href} key={href}>
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
