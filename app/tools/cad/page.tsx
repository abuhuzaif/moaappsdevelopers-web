import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAD Tools — DWG & DXF Converters | MYKSA CONNECT",
  description: "Free online CAD conversion tools for DWG and DXF drawings: DWG to DXF, DWG to PDF, DWG to SVG and DXF to SVG.",
  alternates: { canonical: "/tools/cad/" },
};

const CAD_TOOLS = [
  {
    slug: "dwg-to-dxf",
    icon: "DXF",
    title: "DWG → DXF",
    description: "Convert AutoCAD DWG drawings to the more interoperable DXF format.",
    input: "DWG",
    output: "DXF",
  },
  {
    slug: "dwg-to-pdf",
    icon: "PDF",
    title: "DWG → PDF",
    description: "Convert DWG drawings to PDF for sharing, printing and review.",
    input: "DWG",
    output: "PDF",
  },
  {
    slug: "dwg-to-svg",
    icon: "SVG",
    title: "DWG → SVG",
    description: "Convert DWG drawings to scalable SVG graphics for web and design workflows.",
    input: "DWG",
    output: "SVG",
  },
  {
    slug: "dxf-to-svg",
    icon: "SVG",
    title: "DXF → SVG",
    description: "Convert DXF drawings to scalable SVG graphics for modern digital workflows.",
    input: "DXF",
    output: "SVG",
  },
];

export default function CadToolsPage() {
  return (
    <main className="cad-page">
      <style>{`
        .cad-page{min-height:100vh;background:#fbfaf7;color:#0b1719;padding:32px 20px 72px;font-family:Inter,Arial,sans-serif}
        .cad-shell{width:min(1120px,100%);margin:0 auto}
        .cad-breadcrumb{font-size:13px;margin-bottom:22px;color:#65716f}
        .cad-breadcrumb a{color:#005744;text-decoration:none;font-weight:800}
        .cad-hero{position:relative;overflow:hidden;border-radius:24px;background:linear-gradient(135deg,#003d31 0%,#005744 52%,#06172a 100%);padding:44px 38px;color:#fff;border:1px solid rgba(246,185,31,.35);box-shadow:0 18px 45px rgba(6,23,42,.16)}
        .cad-hero:after{content:"CAD";position:absolute;right:-20px;bottom:-48px;color:rgba(255,255,255,.045);font-size:170px;font-weight:950;letter-spacing:-12px;pointer-events:none}
        .cad-kicker{margin:0 0 9px;color:#f6c52f;font-size:12px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase}
        .cad-hero h1{position:relative;z-index:1;margin:0 0 13px;color:#fff;font-size:clamp(34px,5vw,54px);line-height:1.05;letter-spacing:-1.7px}
        .cad-hero p{position:relative;z-index:1;margin:0;max-width:760px;color:rgba(255,255,255,.86);font-size:16px;line-height:1.7}
        .cad-badges{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}
        .cad-badge{padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(246,185,31,.38);font-size:11px;font-weight:800}
        .cad-section{padding-top:40px}
        .cad-section-kicker{margin:0 0 6px;color:#005744;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase}
        .cad-section h2{margin:0;color:#06172a;font-size:30px;letter-spacing:-.8px}
        .cad-section-intro{margin:8px 0 22px;color:#65716f;font-size:14px;line-height:1.6}
        .cad-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
        .cad-card{position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:220px;padding:24px;border-radius:20px;text-decoration:none;color:inherit;background:linear-gradient(145deg,#fff 0%,#f8fbfa 100%);border:1px solid #cfe2dc;box-shadow:0 9px 26px rgba(6,23,42,.06);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
        .cad-card:after{content:"";position:absolute;right:-35px;top:-35px;width:120px;height:120px;border-radius:50%;background:rgba(246,185,31,.08)}
        .cad-card:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(6,23,42,.12);border-color:#58b99a}
        .cad-icon{position:relative;z-index:1;width:52px;height:52px;display:grid;place-items:center;border-radius:14px;background:#e7f6f0;color:#005744;border:1px solid #bde2d4;font-size:12px;font-weight:950;letter-spacing:.4px}
        .cad-title{position:relative;z-index:1;margin-top:17px;color:#06172a;font-size:23px;font-weight:900;letter-spacing:-.4px}
        .cad-description{position:relative;z-index:1;margin-top:8px;color:#5e6c69;font-size:13px;line-height:1.55;max-width:520px}
        .cad-meta{position:relative;z-index:1;display:flex;gap:8px;margin-top:15px}
        .cad-meta span{padding:6px 9px;border-radius:8px;background:#f1f6f4;color:#40534f;font-size:10px;font-weight:800;border:1px solid #dce9e4}
        .cad-open{position:relative;z-index:1;margin-top:auto;padding-top:18px;color:#005744;font-size:12px;font-weight:900}
        .cad-note{margin-top:24px;padding:15px 17px;border-radius:14px;border:1px solid #f0dfaa;background:#fff9e8;color:#5d5231;font-size:12px;line-height:1.55}
        @media(max-width:700px){.cad-page{padding:20px 14px 50px}.cad-hero{border-radius:18px;padding:32px 24px}.cad-grid{grid-template-columns:1fr}.cad-section h2{font-size:27px}}
      `}</style>

      <div className="cad-shell">
        <nav className="cad-breadcrumb" aria-label="Breadcrumb">
          <a href="/">MYKSA CONNECT</a><span> / </span><a href="/tools/">Tools</a><span> / </span><span>CAD Tools</span>
        </nav>

        <header className="cad-hero">
          <p className="cad-kicker">MYKSA CONNECT • CAD CONVERTER</p>
          <h1>CAD Tools</h1>
          <p>Professional online conversion tools for AutoCAD DWG and DXF drawings. Convert CAD files into practical formats for engineering, sharing and digital workflows.</p>
          <div className="cad-badges">
            <span className="cad-badge">DWG &amp; DXF</span>
            <span className="cad-badge">Cloud conversion</span>
            <span className="cad-badge">No CAD software required</span>
          </div>
        </header>

        <section className="cad-section" aria-labelledby="cad-tools-title">
          <p className="cad-section-kicker">🛠️ CAD Conversion Tools</p>
          <h2 id="cad-tools-title">DWG &amp; DXF Converters</h2>
          <p className="cad-section-intro">Choose a conversion below. Your original CAD file remains unchanged and the converted file is returned as a download.</p>

          <div className="cad-grid">
            {CAD_TOOLS.map((tool) => (
              <a key={tool.slug} className="cad-card" href={`/tools/${tool.slug}/`}>
                <span className="cad-icon">{tool.icon}</span>
                <span className="cad-title">{tool.title}</span>
                <span className="cad-description">{tool.description}</span>
                <span className="cad-meta"><span>Input: {tool.input}</span><span>Output: {tool.output}</span></span>
                <span className="cad-open">Open tool →</span>
              </a>
            ))}
          </div>

          <div className="cad-note"><strong>CAD privacy note:</strong> Only upload drawings you are authorized to send to a third-party conversion service. Files are processed through the configured conversion provider.</div>
        </section>
      </div>
    </main>
  );
}
