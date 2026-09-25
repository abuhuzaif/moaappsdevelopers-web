import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saudi Expat Tools & GIS Engineering Tools | MYKSA CONNECT",
  description:
    "Free Saudi expat, professional, GIS and engineering tools including calculators and geospatial format converters.",
  alternates: {
    canonical: "/tools/",
  },
};

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
  ["⭐", "Lat/Lon → UTM", "Convert latitude and longitude to UTM coordinates", "/tools/latlon-to-utm/"],
  ["⭐", "UTM → Lat/Lon", "Convert UTM coordinates back to latitude and longitude", "/tools/utm-to-latlon/"],
];

function ToolCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a className="tool-card" href={href}>
      <div className="tool-icon">{icon}</div>
      <div className="tool-title">{title}</div>
      <div className="tool-description">{description}</div>
      <div className="tool-arrow">Open tool →</div>
    </a>
  );
}

function Section({
  id,
  kicker,
  title,
  description,
  tools,
}: {
  id: string;
  kicker: string;
  title: string;
  description: string;
  tools: string[][];
}) {
  return (
    <section id={id} className="tool-section">
      <div className="section-head">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2>{title}</h2>
          <p className="section-description">{description}</p>
        </div>
      </div>

      <div className="tools-grid">
        {tools.map(([icon, toolTitle, toolDescription, href]) => (
          <ToolCard
            key={href}
            icon={icon}
            title={toolTitle}
            description={toolDescription}
            href={href}
          />
        ))}
      </div>
    </section>
  );
}

export default function ToolsPage() {
  return (
    <main className="tools-page">
      <style>{`
        .tools-page {
          min-height: 100vh;
          background: #fbfaf7;
          color: #0b1719;
          font-family: Inter, Arial, sans-serif;
          padding: 0 20px 70px;
        }

        .tools-shell {
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .breadcrumb {
          padding: 28px 0 18px;
          font-size: 13px;
          color: #5d6a68;
        }

        .breadcrumb a {
          color: #005744;
          text-decoration: none;
          font-weight: 700;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          min-height: 310px;
          background:
            linear-gradient(90deg, rgba(0, 60, 49, .98) 0%, rgba(0, 87, 68, .94) 52%, rgba(6, 23, 42, .78) 100%),
            url("/images/myksa-tools-banner.png") center / cover no-repeat;
          box-shadow: 0 14px 40px rgba(6, 23, 42, .13);
          display: flex;
          align-items: center;
        }

        .hero-copy {
          max-width: 700px;
          padding: 42px 48px;
          color: #fff;
        }

        .hero-label {
          margin: 0 0 10px;
          color: #f6b91f;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 0 0 14px;
          color: #fff;
          font-family: "Plus Jakarta Sans", Inter, Arial, sans-serif;
          font-size: clamp(34px, 5vw, 54px);
          line-height: 1.05;
          letter-spacing: -1.8px;
        }

        .hero p {
          margin: 0;
          max-width: 650px;
          color: rgba(255,255,255,.88);
          font-size: 16px;
          line-height: 1.7;
        }

        .hero-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .hero-badge {
          border: 1px solid rgba(246,185,31,.55);
          background: rgba(255,255,255,.08);
          color: #fff;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 700;
        }

        .tool-section {
          padding-top: 44px;
        }

        .section-head {
          margin-bottom: 18px;
        }

        .section-kicker {
          margin: 0 0 6px;
          color: #005744;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .section-head h2 {
          margin: 0;
          color: #06172a;
          font-family: "Plus Jakarta Sans", Inter, Arial, sans-serif;
          font-size: clamp(27px, 4vw, 38px);
          letter-spacing: -1px;
        }

        .section-description {
          margin: 7px 0 0;
          color: #5d6a68;
          font-size: 15px;
          line-height: 1.6;
          max-width: 760px;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .tool-card {
          min-height: 190px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          background: #fff;
          border: 1px solid #dfe7e3;
          border-radius: 18px;
          padding: 21px;
          box-shadow: 0 7px 22px rgba(6,23,42,.055);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .tool-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,87,68,.35);
          box-shadow: 0 13px 30px rgba(6,23,42,.10);
        }

        .tool-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #eef7f3;
          font-size: 24px;
          margin-bottom: 15px;
        }

        .tool-title {
          color: #06172a;
          font-size: 17px;
          font-weight: 850;
          line-height: 1.25;
        }

        .tool-description {
          margin-top: 7px;
          color: #65716f;
          font-size: 13px;
          line-height: 1.5;
        }

        .tool-arrow {
          margin-top: auto;
          padding-top: 15px;
          color: #005744;
          font-size: 12px;
          font-weight: 850;
        }

        .gis-note {
          margin-top: 18px;
          padding: 14px 16px;
          border: 1px solid #f0dfaa;
          background: #fff9e8;
          color: #5d5231;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.55;
        }

        .footer-note {
          margin-top: 46px;
          padding-top: 22px;
          border-top: 1px solid #dfe7e3;
          color: #6a7673;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 980px) {
          .tools-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .tools-page {
            padding: 0 14px 48px;
          }

          .breadcrumb {
            padding-top: 20px;
          }

          .hero {
            min-height: 330px;
            border-radius: 18px;
          }

          .hero-copy {
            padding: 30px 24px;
          }

          .hero h1 {
            font-size: 38px;
          }

          .tools-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .tool-card {
            min-height: 175px;
            padding: 17px;
          }
        }

        @media (max-width: 450px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="tools-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">MYKSA CONNECT</a>
          <span> › </span>
          <span>All Tools</span>
        </nav>

        <section className="hero">
          <div className="hero-copy">
            <p className="hero-label">MYKSA CONNECT • TOOL DIRECTORY</p>
            <h1>Saudi Expat Tools</h1>
            <p>
              Professional, everyday and engineering tools for expatriates,
              employees, businesses and GIS users in Saudi Arabia.
            </p>
            <div className="hero-badges">
              <span className="hero-badge">Free Tools</span>
              <span className="hero-badge">Fast &amp; Simple</span>
              <span className="hero-badge">GIS / Engineering</span>
              <span className="hero-badge">No Login Required</span>
            </div>
          </div>
        </section>

        <Section
          id="expat-tools"
          kicker="🇸🇦 Saudi Expat Tools"
          title="Everyday Saudi Tools"
          description="Useful calculators and converters for daily life in Saudi Arabia."
          tools={EXPAT_TOOLS}
        />

        <Section
          id="professional-tools"
          kicker="💼 Professional Saudi Tools"
          title="Work, Salary & Business Tools"
          description="Practical calculators for employees, expatriates and businesses in Saudi Arabia."
          tools={PROFESSIONAL_TOOLS}
        />

        <Section
          id="gis-engineering"
          kicker="🗺️ GIS / Engineering"
          title="GIS / Engineering Tools"
          description="Geospatial and engineering conversion tools for GIS technicians, surveyors, telecom teams and field engineers."
          tools={GIS_TOOLS}
        />

        <div className="gis-note">
          <strong>GIS file formats:</strong> Shapefile conversions normally require
          the related SHP/SHX/DBF/PRJ files together. For best results, upload
          the complete Shapefile package when the individual converter is available.
        </div>

        <div className="footer-note">
          More MYKSA CONNECT tools are being added to this directory.
        </div>
      </div>
    </main>
  );
}
