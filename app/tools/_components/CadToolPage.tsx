import CadConverterClient from "./CadConverterClient";

type Props = {
  slug: "dwg-to-dxf" | "dwg-to-pdf" | "dwg-to-svg" | "dxf-to-svg" | "pdf-to-dxf";
  title: string;
  description: string;
  input: string;
  output: string;
};

const COPY: Record<Props["slug"], { intro: string; steps: string[]; faqs: Array<{ q: string; a: string }> }> = {
  "dwg-to-dxf": {
    intro: "Convert AutoCAD DWG drawings to DXF online when you need a more interoperable CAD exchange format for GIS, surveying, engineering and drafting workflows.",
    steps: ["Choose a DWG drawing.", "Start the DWG to DXF conversion.", "Download the DXF file and verify layers, geometry, text and dimensions in your CAD software."],
    faqs: [
      { q: "What is DWG to DXF used for?", a: "DXF is commonly used to exchange CAD drawing data between different CAD and engineering applications." },
      { q: "Will the original DWG be changed?", a: "No. The uploaded drawing is used to create a separate DXF output file." },
      { q: "Will every DWG object convert perfectly?", a: "Conversion results depend on the drawing version, entities, fonts, proxy objects and other CAD features. Always verify important drawings." },
    ],
  },
  "dwg-to-pdf": {
    intro: "Convert AutoCAD DWG drawings to PDF online for easy sharing, printing, review and document submission without requiring CAD software on every device.",
    steps: ["Choose a DWG drawing.", "Start the DWG to PDF conversion.", "Download and review the PDF before printing or submitting it."],
    faqs: [
      { q: "Can I share a DWG drawing as PDF?", a: "Yes. PDF is useful when recipients need to view or print the drawing without opening the original CAD file." },
      { q: "Does the conversion modify my DWG?", a: "No. A separate PDF output is generated." },
      { q: "Should I verify the PDF scale?", a: "Yes. For engineering or construction use, verify page size, scale, line weights and plotted content before relying on the PDF." },
    ],
  },
  "dwg-to-svg": {
    intro: "Convert DWG drawings to scalable SVG graphics for web pages, digital documentation and design workflows where vector graphics are useful.",
    steps: ["Choose a DWG drawing.", "Start the DWG to SVG conversion.", "Download the SVG and inspect the vector result in a browser or compatible design application."],
    faqs: [
      { q: "What is SVG useful for?", a: "SVG is a scalable vector format that can be displayed on websites and edited by compatible graphics tools." },
      { q: "Will the SVG preserve every CAD feature?", a: "Not necessarily. Complex CAD entities, fonts and 3D features can require review after conversion." },
      { q: "Does the tool change my DWG?", a: "No. The DWG remains unchanged and a separate SVG is generated." },
    ],
  },
  "dxf-to-svg": {
    intro: "Convert DXF drawings to scalable SVG graphics for web, documentation and lightweight vector workflows.",
    steps: ["Choose a DXF drawing.", "Start the DXF to SVG conversion.", "Download the SVG and verify geometry, text and line work."],
    faqs: [
      { q: "Can DXF be converted to SVG?", a: "Yes. DXF is a CAD exchange format and SVG is a web-friendly vector graphics format." },
      { q: "Will layers and dimensions always look identical?", a: "CAD-to-SVG conversion can represent drawing content differently, so review the result for important drawings." },
      { q: "Is the DXF file modified?", a: "No. The tool creates a separate SVG output." },
    ],
  },
  "pdf-to-dxf": {
    intro: "Convert vector PDF drawings to DXF format online when you need to bring PDF-based plans or drawings into CAD software.",
    steps: ["Choose a PDF containing vector line drawings.", "Start the PDF to DXF conversion.", "Download the DXF file and verify layers, geometry, text and dimensions in your CAD software."],
    faqs: [
      { q: "Does this work with any PDF?", a: "It works best with PDFs that contain vector line drawings, typically exported from CAD or design software. Scanned or image-based PDFs will not convert into usable CAD geometry." },
      { q: "Will the original PDF be changed?", a: "No. The uploaded PDF is used to create a separate DXF output file." },
      { q: "Will every PDF convert perfectly?", a: "Conversion quality depends on how the PDF was created. Always verify important drawings after conversion." },
    ],
  },
};

export default function CadToolPage({ slug, title, description, input, output }: Props) {
  const copy = COPY[slug];
  const siteUrl = "https://www.myksaconnect.com";
  const pageUrl = `${siteUrl}/tools/${slug}/`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MYKSA CONNECT", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${siteUrl}/tools/` },
      { "@type": "ListItem", position: 3, name: "CAD Tools", item: `${siteUrl}/tools/` },
      { "@type": "ListItem", position: 4, name: title, item: pageUrl },
    ],
  };

  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none" }}>MYKSA CONNECT</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none" }}>Tools</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <span style={{ color: "#52605d" }}>CAD Tools</span>
        </nav>

        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • CAD converter</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(30px,5vw,46px)", margin: "8px 0 12px" }}>{title}</h1>
        <p style={{ color: "#5d6a68", fontSize: 16, lineHeight: 1.7 }}>{description}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: {input}</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: {output}</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>CAD processing</span>
        </div>

        <CadConverterClient slug={slug} />

        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28, marginBottom: 12 }}>{title}</h2>
          <p>{copy.intro}</p>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            {copy.steps.map((step) => <li key={step} style={{ marginBottom: 8 }}>{step}</li>)}
          </ol>
          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Frequently asked questions</h2>
          {copy.faqs.map((faq) => (
            <section key={faq.q} style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}>
              <h3 style={{ color: "#06172a", fontSize: 17, margin: 0 }}>{faq.q}</h3>
              <p style={{ margin: "7px 0 0" }}>{faq.a}</p>
            </section>
          ))}
        </article>

        <a href="/tools/" style={{ display: "inline-block", marginTop: 24, color: "#005744", fontWeight: 800, textDecoration: "none" }}>← Back to all tools</a>
      </section>
    </main>
  );
}
