import type { Metadata } from "next";
import { CONVERTER_DEFINITIONS } from "@/lib/converters/converterTypes";

export const metadata: Metadata = {
  title: "Saudi Expat Tools & GIS Engineering Tools | MYKSA CONNECT",
  description: "Free Saudi expat, professional, property, finance, health, measurement, GIS and engineering tools for everyday use.",
  alternates: { canonical: "/tools/" },
};

const ESSENTIAL_TOOLS = [
  ["📐", "Gaz ↔ Square Meter Converter", "Convert Gaz (Gaj) and square meters for property and plot measurements", "/tools/gaz-square-meter-converter/"],
  ["📏", "Square Feet ↔ Square Meter Converter", "Convert property area between square feet and square meters", "/tools/square-feet-square-meter-converter/"],
  ["🏠", "Marla ↔ Square Feet / Square Meter", "Convert Marla using selectable regional standards", "/tools/marla-converter/"],
  ["🌍", "Acre ↔ Hectare ↔ Square Meter", "Convert land area between acres, hectares and square meters", "/tools/acre-hectare-square-meter-converter/"],
  ["📏", "Feet & Inches ↔ Centimeter", "Convert everyday length and height measurements", "/tools/feet-inches-centimeter-converter/"],
  ["⚖️", "BMI Calculator", "Calculate Body Mass Index from weight and height", "/tools/bmi-calculator/"],
  ["🎂", "Age Calculator", "Calculate exact age in years, months and days", "/tools/age-calculator/"],
  ["%", "Percentage Calculator", "Calculate percentages, increases, decreases and amounts", "/tools/percentage-calculator/"],
  ["💳", "Loan / EMI Calculator", "Estimate monthly EMI, total repayment and interest", "/tools/loan-emi-calculator/"],
  ["🧾", "Saudi VAT Calculator — 15%", "Calculate Saudi VAT-inclusive and VAT-exclusive amounts", "/tools/saudi-vat-calculator/"],
];

const EXPAT_TOOLS = [
  ["📅", "Iqama Expiry Calculator", "Check remaining Iqama validity", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "Convert dates between calendars", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "Calculate monthly and yearly salary", "/tools/salary-calculator/"],
  ["💱", "Currency Converter", "Convert between currencies using reference exchange rates", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "Split rent and shared bills with roommates", "/tools/rent-split-calculator/"],
  ["✈️", "Travel Currency Calculator", "Estimate travel money conversion", "/tools/travel-currency-calculator/"],
  ["⏰", "Working Hours Calculator", "Calculate net working hours and breaks", "/tools/working-hours-calculator/"],
  ["📆", "Days Between Dates", "Calculate days, weeks and date differences", "/tools/days-between-dates/"],
];

const PROFESSIONAL_TOOLS = [
  ["🧾", "End of Service Calculator", "Estimate Saudi end-of-service benefits", "/tools/end-of-service-calculator/"],
  ["💰", "GOSI Calculator", "Estimate employee and employer GOSI contributions", "/tools/gosi-calculator/"],
  ["⏱️", "Overtime Calculator", "Calculate overtime pay from basic salary and hours", "/tools/overtime-calculator/"],
  ["🏖️", "Annual Leave Calculator", "Estimate annual leave entitlement and accrual", "/tools/annual-leave-calculator/"],
  ["📋", "Final Settlement Calculator", "Estimate salary, leave, EOSB and other settlement items", "/tools/final-settlement-calculator/"],
  ["🧾", "VAT Calculator", "Calculate VAT-inclusive and VAT-exclusive amounts", "/tools/vat-calculator/"],
  ["⛽", "Fuel Cost Calculator", "Estimate fuel cost from distance, mileage and fuel price", "/tools/fuel-cost-calculator/"],
];

const GIS_TOOLS = [
  ["⭐", "SHP → KML", "Convert ESRI Shapefile data to KML", "/tools/shp-to-kml/"],
  ["⭐", "KML → SHP", "Convert KML layers to ESRI Shapefile", "/tools/kml-to-shp/"],
  ["⭐", "SHP → GeoJSON", "Convert ESRI Shapefile data to GeoJSON", "/tools/shp-to-geojson/"],
  ["⭐", "GeoJSON → KML", "Convert GeoJSON features to KML", "/tools/geojson-to-kml/"],
  ["⭐", "CSV → KML", "Convert coordinate CSV data to KML", "/tools/csv-to-kml/"],
  ["⭐", "KML → CSV", "Export KML coordinates and attributes to CSV", "/tools/kml-to-csv/"],
  ["⭐", "DXF → KML", "Convert supported CAD/DXF geometry to KML", "/tools/dxf-to-kml/"],
  ["⭐", "KML → DXF", "Convert supported KML geometry to DXF", "/tools/kml-to-dxf/"],
  ["📐", "DWG → DXF", "Convert AutoCAD DWG drawings to the interoperable DXF format", "/tools/dwg-to-dxf/"],
    ["PDF", "PDF to DXF", "Convert vector PDF drawings to DXF format online.", "/tools/pdf-to-dxf/"],
  ["📐", "DWG → PDF", "Convert AutoCAD DWG drawings to PDF for sharing and printing", "/tools/dwg-to-pdf/"],
  ["📐", "DWG → SVG", "Convert AutoCAD DWG drawings to scalable SVG graphics", "/tools/dwg-to-svg/"],
  ["📐", "DXF → SVG", "Convert DXF drawings to scalable SVG graphics", "/tools/dxf-to-svg/"],
  ["🖼️", "JPG to PDF", "Convert images into a professional PDF online.", "/tools/jpg-to-pdf/"],
  ["⭐", "Lat/Lon → UTM", "Convert latitude and longitude to UTM coordinates", "/tools/latlon-to-utm/"],
  ["⭐", "UTM → Lat/Lon", "Convert UTM coordinates back to latitude and longitude", "/tools/utm-to-latlon/"],
];

const FEATURED_TOOLS = [
  ["📄", "PDF to Word", "Convert PDF files to editable Word documents.", "/tools/pdf-to-word/"],
  ["🔗", "Merge PDF", "Combine multiple PDF files into one document.", "/tools/merge-pdf/"],
  ["📦", "Compress PDF", "Reduce PDF size for easy sharing and upload.", "/tools/compress-pdf/"],
  ["🖼️", "JPG to PDF", "Convert images into a professional PDF online.", "/tools/jpg-to-pdf/"],
  ["📄", "PDF to JPG", "Convert PDF pages into high-quality JPG images.", "/tools/pdf-to-jpg/"],
  ["✂️", "Split PDF", "Split a PDF and extract only the pages you need.", "/tools/split-pdf/"],
  ["✍️", "Sign PDF", "Add, move and resize your signature on a PDF.", "/tools/sign-pdf/"],
  ["🔎", "PDF OCR", "Extract searchable text from scanned PDFs.", "/tools/pdf-ocr/"],
  ["📅", "Iqama Expiry Calculator", "Check your Iqama expiry date quickly.", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "Convert Hijri and Gregorian dates instantly.", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "Calculate monthly and yearly salary.", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "Convert SAR to INR, PKR and more.", "/tools/sar-currency-converter/"],
] as const;

const CARD_PALETTE = ["blue", "green", "gold", "purple", "orange", "cyan"] as const;

type CardColor = (typeof CARD_PALETTE)[number];

function ToolCard({ icon, title, description, href, index }: { icon: string; title: string; description: string; href: string; index: number }) {
  const color = CARD_PALETTE[index % CARD_PALETTE.length];
  return <a className={`tool-card tool-card-${color}`} href={href}><div className="tool-icon">{icon}</div><div className="tool-title">{title}</div><div className="tool-description">{description}</div><div className="tool-arrow">Open tool →</div></a>;
}

function FeaturedToolCard({ icon, title, description, href, index, badge }: { icon: string; title: string; description: string; href: string; index: number; badge?: boolean }) {
  const color = CARD_PALETTE[index % CARD_PALETTE.length];
  return <a className={`featured-tool-card featured-tool-${color}`} href={href}>
    <span className="featured-tool-icon" aria-hidden="true">{icon}</span>
    <span className="featured-tool-copy"><strong>{title}</strong><small>{description}</small></span>
    {badge ? <span className="featured-tool-badge">NEW</span> : null}
    <b aria-hidden="true">→</b>
  </a>;
}

function ConverterCard({ name, shortDescription, slug, index }: { name: string; shortDescription: string; slug: string; index: number }) {
  const color = CARD_PALETTE[index % CARD_PALETTE.length];
  return <a className={`converter-card converter-card-${color}`} href={`/tools/${slug}/`}><div className="converter-icon">↔</div><div className="converter-title">{name}</div><div className="converter-description">{shortDescription}</div><div className="converter-arrow">Open tool →</div></a>;
}

function Section({ id, kicker, title, description, tools }: { id: string; kicker: string; title: string; description: string; tools: string[][] }) {
  return <section id={id} className="tool-section"><div className="section-head"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2><p className="section-description">{description}</p></div></div><div className="tools-grid">{tools.map(([icon, toolTitle, toolDescription, href], index) => <ToolCard key={href} icon={icon} title={toolTitle} description={toolDescription} href={href} index={index}/>)}</div></section>;
}

export default function ToolsPage() {
  return <main className="tools-page"><style>{`
    .tools-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:Inter,Arial,sans-serif;padding:0 20px 70px}.tools-shell{width:min(1120px,100%);margin:0 auto}.breadcrumb{padding:28px 0 18px;font-size:13px;color:#5d6a68}.breadcrumb a{color:#005744;text-decoration:none;font-weight:700}.hero{position:relative;overflow:hidden;border-radius:24px;min-height:310px;background:linear-gradient(90deg,rgba(0,60,49,.98) 0%,rgba(0,87,68,.94) 52%,rgba(6,23,42,.78) 100%),url('/images/myksa-tools-banner.png') center/cover no-repeat;box-shadow:0 14px 40px rgba(6,23,42,.13);display:flex;align-items:center}.hero-copy{max-width:700px;padding:42px 48px;color:#fff}.hero-label{margin:0 0 10px;color:#f6b91f;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}.hero h1{margin:0 0 14px;color:#fff;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;font-size:clamp(34px,5vw,54px);line-height:1.05;letter-spacing:-1.8px}.hero p{margin:0;max-width:650px;color:rgba(255,255,255,.88);font-size:16px;line-height:1.7}.hero-badges{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.hero-badge{border:1px solid rgba(246,185,31,.55);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:8px 13px;font-size:12px;font-weight:700}
    .featured-section{padding-top:28px}.featured-panel{position:relative;overflow:hidden;border:1px solid #dce9e4;border-top:3px solid #005744;border-radius:18px;background:linear-gradient(135deg,#ffffff 0%,#fbfdfc 62%,#fff9e7 100%);padding:22px 22px 20px;box-shadow:0 9px 28px rgba(6,23,42,.06)}.featured-panel:after{content:"";position:absolute;width:220px;height:220px;right:-100px;top:-120px;border-radius:50%;background:rgba(246,185,31,.09);pointer-events:none}.featured-head{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:18px}.featured-copy{min-width:0}.featured-kicker{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#fff6dc;border:1px solid #f1d98a;color:#7a5a00;font-size:10px;font-weight:900;letter-spacing:.7px;text-transform:uppercase}.featured-head h2{margin:7px 0 4px;color:#06172a;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;font-size:28px;line-height:1.15;letter-spacing:-.8px}.featured-head p{margin:0;color:#64716e;font-size:12px;line-height:1.5}.featured-all-link{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:10px;background:#005744;color:#fff;text-decoration:none;font-size:11px;font-weight:850;border:1px solid rgba(246,185,31,.7);white-space:nowrap}.featured-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.featured-tool-card{position:relative;min-height:74px;display:flex;align-items:center;gap:10px;text-decoration:none;color:#06172a;border:1px solid;border-radius:13px;padding:11px 12px;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}.featured-tool-card:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(6,23,42,.09)}.featured-tool-icon{width:36px;height:36px;flex:0 0 36px;display:grid;place-items:center;border-radius:10px;font-size:18px}.featured-tool-copy{min-width:0;display:flex;flex-direction:column;gap:3px;flex:1}.featured-tool-copy strong{font-size:12px;line-height:1.2;font-weight:850}.featured-tool-copy small{color:#61706d;font-size:9.5px;line-height:1.25}.featured-tool-card>b{font-size:15px;font-weight:900}.featured-tool-badge{position:absolute;right:28px;top:6px;padding:2px 5px;border-radius:999px;background:#f6b91f;color:#3f3000;font-size:7px;font-weight:900}.featured-tool-blue{background:#edf6ff;border-color:#b9dbff}.featured-tool-blue .featured-tool-icon{background:#d9ecff}.featured-tool-blue>b{color:#1475c8}.featured-tool-green{background:#ecfbf4;border-color:#b9ead2}.featured-tool-green .featured-tool-icon{background:#d6f5e5}.featured-tool-green>b{color:#08734f}.featured-tool-gold{background:#fff8df;border-color:#f1d88d}.featured-tool-gold .featured-tool-icon{background:#ffedb5}.featured-tool-gold>b{color:#a36d00}.featured-tool-purple{background:#f5efff;border-color:#d9c2ff}.featured-tool-purple .featured-tool-icon{background:#e7d8ff}.featured-tool-purple>b{color:#7440b5}.featured-tool-orange{background:#fff2e9;border-color:#ffc9a7}.featured-tool-orange .featured-tool-icon{background:#ffe0cc}.featured-tool-orange>b{color:#c65a1b}.featured-tool-cyan{background:#eaf9fc;border-color:#b8e6ee}.featured-tool-cyan .featured-tool-icon{background:#d5f2f7}.featured-tool-cyan>b{color:#087d91}
    .tool-section{padding-top:44px}.section-head{margin-bottom:18px}.section-kicker{margin:0 0 6px;color:#005744;font-size:12px;font-weight:900;letter-spacing:1.3px;text-transform:uppercase}.section-head h2{margin:0;color:#06172a;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;font-size:clamp(27px,4vw,38px);letter-spacing:-1px}.section-description{margin:7px 0 0;color:#5d6a68;font-size:15px;line-height:1.6;max-width:760px}.tools-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.tool-card{min-height:190px;display:flex;flex-direction:column;text-decoration:none;color:inherit;border:1px solid;border-radius:18px;padding:21px;box-shadow:0 7px 22px rgba(6,23,42,.055);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}.tool-card:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(6,23,42,.12)}.tool-card-blue{background:#edf6ff;border-color:#b9dbff}.tool-card-blue:hover{border-color:#63adff}.tool-card-green{background:#ecfbf4;border-color:#b9ead2}.tool-card-green:hover{border-color:#59c892}.tool-card-gold{background:#fff8df;border-color:#f1d88d}.tool-card-gold:hover{border-color:#e8b72e}.tool-card-purple{background:#f5efff;border-color:#d9c2ff}.tool-card-purple:hover{border-color:#a978ef}.tool-card-orange{background:#fff2e9;border-color:#ffc9a7}.tool-card-orange:hover{border-color:#ff914f}.tool-card-cyan{background:#eaf9fc;border-color:#b8e6ee}.tool-card-cyan:hover{border-color:#52b9ca}.tool-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:13px;font-size:24px;margin-bottom:15px}.tool-card-blue .tool-icon{background:#d9ecff}.tool-card-green .tool-icon{background:#d6f5e5}.tool-card-gold .tool-icon{background:#ffedb5}.tool-card-purple .tool-icon{background:#e7d8ff}.tool-card-orange .tool-icon{background:#ffe0cc}.tool-card-cyan .tool-icon{background:#d5f2f7}.tool-title{color:#06172a;font-size:17px;font-weight:850;line-height:1.25}.tool-description{margin-top:7px;color:#536462;font-size:13px;line-height:1.5}.tool-arrow{margin-top:auto;padding-top:15px;font-size:12px;font-weight:850}.tool-card-blue .tool-arrow{color:#1475c8}.tool-card-green .tool-arrow{color:#08734f}.tool-card-gold .tool-arrow{color:#a36d00}.tool-card-purple .tool-arrow{color:#7440b5}.tool-card-orange .tool-arrow{color:#c65a1b}.tool-card-cyan .tool-arrow{color:#087d91}.converter-section{padding-top:44px}.converter-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.converter-card{min-height:145px;display:flex;flex-direction:column;text-decoration:none;color:inherit;border:1px solid;border-radius:16px;padding:18px;box-shadow:0 6px 18px rgba(6,23,42,.05);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.converter-card:hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(6,23,42,.09)}.converter-card-blue{background:#f1f8ff;border-color:#c8e1fb}.converter-card-green{background:#effbf5;border-color:#c8ead8}.converter-card-gold{background:#fff9e7;border-color:#f0d99a}.converter-card-purple{background:#f7f2ff;border-color:#dfcff8}.converter-card-orange{background:#fff4ed;border-color:#ffd5be}.converter-card-cyan{background:#effbfd;border-color:#c6eaf0}.converter-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;font-size:16px;font-weight:900;margin-bottom:12px}.converter-card-blue .converter-icon{background:#dcedff;color:#1475c8}.converter-card-green .converter-icon{background:#d9f5e6;color:#08734f}.converter-card-gold .converter-icon{background:#ffefbf;color:#a36d00}.converter-card-purple .converter-icon{background:#e9dcff;color:#7440b5}.converter-card-orange .converter-icon{background:#ffe2d0;color:#c65a1b}.converter-card-cyan .converter-icon{background:#d8f3f7;color:#087d91}.converter-title{color:#06172a;font-size:15px;font-weight:850;line-height:1.3}.converter-description{margin-top:6px;color:#65716f;font-size:12px;line-height:1.45}.converter-arrow{margin-top:auto;padding-top:12px;font-size:11px;font-weight:850}.converter-card-blue .converter-arrow{color:#1475c8}.converter-card-green .converter-arrow{color:#08734f}.converter-card-gold .converter-arrow{color:#a36d00}.converter-card-purple .converter-arrow{color:#7440b5}.converter-card-orange .converter-arrow{color:#c65a1b}.converter-card-cyan .converter-arrow{color:#087d91}.converter-directory-link{display:inline-flex;margin-top:18px;color:#005744;text-decoration:none;font-size:13px;font-weight:850}.gis-note{margin-top:18px;padding:14px 16px;border:1px solid #f0dfaa;background:#fff9e8;color:#5d5231;border-radius:14px;font-size:13px;line-height:1.55}.footer-note{margin-top:46px;padding-top:22px;border-top:1px solid #dfe7e3;color:#6a7673;font-size:12px;text-align:center}@media(max-width:980px){.featured-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.tools-grid,.converter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:700px){.tools-page{padding:0 14px 48px}.breadcrumb{padding-top:20px}.hero{min-height:330px;border-radius:18px}.hero-copy{padding:30px 24px}.hero h1{font-size:38px}.featured-head{align-items:stretch;flex-direction:column}.featured-all-link{align-self:flex-start}.featured-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.featured-tool-card{min-height:70px;padding:10px}.featured-tool-copy small{display:none}.tools-grid,.converter-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tool-card,.converter-card{min-height:175px;padding:17px}}@media(max-width:450px){.featured-grid{grid-template-columns:1fr}.tools-grid,.converter-grid{grid-template-columns:1fr}}
  `}</style><div className="tools-shell"><nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">MYKSA CONNECT</a><span> › </span><span>All Tools</span></nav><section className="hero"><div className="hero-copy"><p className="hero-label">MYKSA CONNECT • TOOL DIRECTORY</p><h1>Saudi Expat Tools</h1><p>Professional, everyday and engineering tools for expatriates, employees, businesses and GIS users in Saudi Arabia.</p><div className="hero-badges"><span className="hero-badge">Free Tools</span><span className="hero-badge">Fast &amp; Simple</span><span className="hero-badge">GIS / Engineering</span><span className="hero-badge">No Login Required</span></div></div></section><section className="featured-section" aria-labelledby="featured-tools-title"><div className="featured-panel"><div className="featured-head"><div className="featured-copy"><span className="featured-kicker">🔥 Most Popular Tools</span><h2 id="featured-tools-title">Free Online PDF &amp; Expat Tools</h2><p>Fast, simple browser-based tools for PDFs plus the essential calculators Saudi Arabia expats use every day.</p></div><a className="featured-all-link" href="#converter-tools">Explore All Tools →</a></div><div className="featured-grid">{FEATURED_TOOLS.map(([icon, title, description, href], index) => <FeaturedToolCard key={href} icon={icon} title={title} description={description} href={href} index={index} badge={title === "Sign PDF"}/>)}</div></div></section><section id="converter-tools" className="converter-section"><div className="section-head"><div><p className="section-kicker">📄 Document &amp; File Tools</p><h2>Document, PDF, Data &amp; Image Converters</h2><p className="section-description">Browser-friendly converters for documents, PDFs, spreadsheets, structured data and images. Open any tool directly from this directory.</p></div></div><div className="converter-grid">{CONVERTER_DEFINITIONS.map((tool, index) => <ConverterCard key={tool.slug} slug={tool.slug} name={tool.name} shortDescription={tool.shortDescription} index={index}/>)}</div><a className="converter-directory-link" href="/tools/converters/">View dedicated converter directory →</a></section><Section id="essential-tools" kicker="⭐ Essential Tools" title="Essential Everyday Tools" description="Popular calculators and measurement converters for property, money, health and daily life." tools={ESSENTIAL_TOOLS}/><Section id="expat-tools" kicker="🇸🇦 Saudi Expat Tools" title="Everyday Saudi Tools" description="Useful calculators and converters for daily life in Saudi Arabia." tools={EXPAT_TOOLS}/><Section id="professional-tools" kicker="💼 Professional Saudi Tools" title="Work, Salary &amp; Business Tools" description="Practical calculators for employees, expatriates and businesses in Saudi Arabia." tools={PROFESSIONAL_TOOLS}/><Section id="gis-engineering" kicker="🗺️ GIS / CAD &amp; Engineering" title="GIS / CAD &amp; Engineering Tools" description="Geospatial, CAD and engineering conversion tools for GIS technicians, surveyors, telecom teams and field engineers." tools={GIS_TOOLS}/><div className="gis-note"><strong>GIS file formats:</strong> Shapefile conversions normally require the related SHP/SHX/DBF/PRJ files together. For best results, upload the complete Shapefile package when the individual converter is available.</div><div className="footer-note">More MYKSA CONNECT tools are being added to this directory.</div></div></main>;
}

