"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

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

const COLORS = ["blue", "green", "gold", "purple", "orange", "cyan"] as const;

export default function HomeFeaturedTools() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || pathname !== "/") return null;

  const target = document.querySelector(".mk-main");
  if (!target) return null;

  const section = (
    <section className="mk-home-featured-tools" aria-labelledby="home-featured-tools-title">
      <style>{`
        .mk-main{display:flex;flex-direction:column;}
        .mk-home-featured-tools{order:-10;position:relative;overflow:hidden;margin:0 0 28px;border:1px solid #dce9e4;border-top:3px solid #005744;border-radius:18px;background:linear-gradient(135deg,#fff 0%,#fbfdfc 62%,#fff9e7 100%);padding:20px 22px 18px;box-shadow:0 9px 28px rgba(6,23,42,.06);}
        .mk-home-featured-tools:after{content:"";position:absolute;width:220px;height:220px;right:-105px;top:-120px;border-radius:50%;background:rgba(246,185,31,.09);pointer-events:none;}
        .mk-home-featured-head{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:17px;}
        .mk-home-featured-copy{min-width:0;}
        .mk-home-featured-badge{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:#fff6dc;border:1px solid #f1d98a;color:#7a5a00;font-size:10px;font-weight:900;letter-spacing:.65px;text-transform:uppercase;}
        .mk-home-featured-copy h2{margin:7px 0 4px;color:#06172a;font-family:'Plus Jakarta Sans',Inter,Arial,sans-serif;font-size:28px;line-height:1.15;letter-spacing:-.8px;}
        .mk-home-featured-copy p{margin:0;color:#64716e;font-size:12px;line-height:1.5;}
        .mk-home-featured-all{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:10px;background:#005744;color:#fff;text-decoration:none;font-size:11px;font-weight:850;border:1px solid rgba(246,185,31,.7);white-space:nowrap;}
        .mk-home-featured-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;}
        .mk-home-featured-card{position:relative;min-height:74px;display:flex;align-items:center;gap:10px;text-decoration:none;color:#06172a;border:1px solid;border-radius:13px;padding:11px 12px;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;}
        .mk-home-featured-card:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(6,23,42,.09);}
        .mk-home-featured-icon{width:36px;height:36px;flex:0 0 36px;display:grid;place-items:center;border-radius:10px;font-size:18px;}
        .mk-home-featured-copy2{min-width:0;display:flex;flex-direction:column;gap:3px;flex:1;}
        .mk-home-featured-copy2 strong{font-size:12px;line-height:1.2;font-weight:850;}
        .mk-home-featured-copy2 small{color:#61706d;font-size:9.5px;line-height:1.25;}
        .mk-home-featured-card>b{font-size:15px;font-weight:900;}
        .mk-home-featured-blue{background:#edf6ff;border-color:#69b5f3;}.mk-home-featured-blue .mk-home-featured-icon{background:#a9d8ff;}.mk-home-featured-blue>b{color:#1268b0;}
        .mk-home-featured-green{background:#ecfbf4;border-color:#62cf99;}.mk-home-featured-green .mk-home-featured-icon{background:#a8e9c8;}.mk-home-featured-green>b{color:#087344;}
        .mk-home-featured-gold{background:#fff8df;border-color:#e5b92f;}.mk-home-featured-gold .mk-home-featured-icon{background:#ffdb70;}.mk-home-featured-gold>b{color:#8a5a00;}
        .mk-home-featured-purple{background:#f5efff;border-color:#b58be8;}.mk-home-featured-purple .mk-home-featured-icon{background:#d1b5fa;}.mk-home-featured-purple>b{color:#63319f;}
        .mk-home-featured-orange{background:#fff2e9;border-color:#e99a62;}.mk-home-featured-orange .mk-home-featured-icon{background:#ffc39d;}.mk-home-featured-orange>b{color:#ad4b08;}
        .mk-home-featured-cyan{background:#eaf9fc;border-color:#61c1df;}.mk-home-featured-cyan .mk-home-featured-icon{background:#a9e2f6;}.mk-home-featured-cyan>b{color:#066b89;}
        @media(max-width:980px){.mk-home-featured-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
        @media(max-width:700px){.mk-home-featured-head{align-items:stretch;flex-direction:column;gap:12px;}.mk-home-featured-all{align-self:flex-start;}.mk-home-featured-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;}.mk-home-featured-card{min-height:70px;padding:10px;}.mk-home-featured-copy2 small{display:none;}}
        @media(max-width:450px){.mk-home-featured-grid{grid-template-columns:1fr;}}
      `}</style>
      <div className="mk-home-featured-head">
        <div className="mk-home-featured-copy">
          <span className="mk-home-featured-badge">🔥 Most Popular Tools</span>
          <h2 id="home-featured-tools-title">Free Online PDF &amp; Expat Tools</h2>
          <p>Fast, simple browser-based tools for PDFs plus the essential calculators Saudi Arabia expats use every day.</p>
        </div>
        <a className="mk-home-featured-all" href="/tools/">Explore All Tools →</a>
      </div>
      <div className="mk-home-featured-grid">
        {FEATURED_TOOLS.map(([icon, title, description, href], index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <a key={href} href={href} className={`mk-home-featured-card mk-home-featured-${color}`}>
              <span className="mk-home-featured-icon" aria-hidden="true">{icon}</span>
              <span className="mk-home-featured-copy2"><strong>{title}</strong><small>{description}</small></span>
              {title === "Sign PDF" ? <span style={{position:"absolute",right:28,top:6,padding:"2px 5px",borderRadius:999,background:"#f6b91f",color:"#3f3000",fontSize:7,fontWeight:900}}>NEW</span> : null}
              <b aria-hidden="true">→</b>
            </a>
          );
        })}
      </div>
    </section>
  );

  return createPortal(section, target);
}
