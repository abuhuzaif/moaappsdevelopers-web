"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🧮", "Zakat Calculator", "/tools/zakat-calculator/"],
  ["•••", "More Tools", "/tools/"],
];

function pad(value: number) { return String(value).padStart(2, "0"); }
function toInputDate(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
function parseInputDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}
function parts(date: Date, calendar?: string) {
  const formatter = new Intl.DateTimeFormat(calendar || "en-SA", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const p = formatter.formatToParts(date);
  const get = (type:string) => p.find(x=>x.type===type)?.value || "";
  return { weekday:get("weekday"), day:get("day"), month:get("month"), year:get("year") };
}
function hijriParts(date: Date) {
  try { return parts(date, "en-SA-u-ca-islamic-umalqura"); }
  catch { return { weekday:"", day:"", month:"Hijri date unavailable", year:"" }; }
}

export default function HijriGregorianConverter() {
  const today = useMemo(() => new Date(), []);
  const [gregorianDate, setGregorianDate] = useState(toInputDate(today));
  const [submitted, setSubmitted] = useState(true);
  const selectedDate = parseInputDate(gregorianDate);
  const result = selectedDate ? { gregorian:parts(selectedDate), hijri:hijriParts(selectedDate) } : null;

  return (
    <main className="tool-page">
      <style jsx>{`
        .tool-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:inherit}.shell{width:min(1100px,100%);margin:0 auto}.breadcrumb{padding:10px 0 12px;font-size:11px;color:#6a7774}.breadcrumb a{color:#005744;text-decoration:none;font-weight:800}.banner{display:block;width:100%;height:auto;border-radius:4px;object-fit:contain}.content{padding:12px 0 42px}.calculator-card{background:#fff;border:1px solid #dfe7e3;border-radius:12px;padding:6px;box-shadow:0 3px 12px rgba(6,23,42,.05)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.panel{min-width:0;border-radius:10px;padding:20px 22px}.input-panel{background:#f3faf7;border:1px solid #d7e8e1}.result-panel{background:#fffaf0;border:1px solid #ead9a9;display:flex;flex-direction:column;justify-content:center;min-height:246px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}.panel-title{margin:0;color:#005744;font-size:16px;font-weight:900;display:flex;align-items:center;gap:8px}.panel-icon{width:30px;height:30px;border-radius:9px;background:#dff1ea;display:grid;place-items:center;font-size:16px}.badge{padding:5px 9px;border:1px solid #f0ca57;background:#fff8dc;color:#8a5b00;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.label{display:block;margin:0 0 7px;color:#263735;font-size:10px;font-weight:800}.input{width:100%;box-sizing:border-box;border:1px solid #cbd9d4;border-radius:8px;background:#fff;color:#102123;padding:9px 10px;font:inherit;font-size:11px;min-height:38px}.input:focus{outline:2px solid rgba(246,185,31,.22);border-color:#005744}.btn{width:100%;border:0;border-radius:8px;background:#005744;color:#fff;padding:10px 14px;font:inherit;font-size:11px;font-weight:900;cursor:pointer;margin-top:12px}.btn:hover{background:#003c31}.helper{margin-top:9px;padding:8px 9px;border-radius:7px;background:#e9f5f0;color:#61716d;font-size:8px;line-height:1.45}.result-kicker{text-align:center;margin:0 0 5px;color:#8a5b00;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.result-title{text-align:center;color:#005744;font-size:11px;font-weight:900;margin-bottom:7px}.date-card{display:grid;grid-template-columns:1fr 1fr;border:1px solid #eadfbe;border-radius:8px;overflow:hidden;background:#fff}.date-side{padding:11px 8px;text-align:center}.date-side:first-child{background:#eaf7f0;border-right:1px solid #dbe8e1}.date-side:last-child{background:#fff5d7}.date-label{display:block;color:#687673;font-size:7px;font-weight:800;margin-bottom:4px}.day{display:block;color:#005744;font-size:27px;line-height:.95;font-weight:950}.month{display:block;margin-top:5px;color:#005744;font-size:12px;font-weight:900;line-height:1.2;white-space:nowrap}.year{display:block;margin-top:2px;color:#005744;font-size:10px;font-weight:800}.date-side:last-child .day,.date-side:last-child .month,.date-side:last-child .year{color:#8a6200}.weekday{display:inline-block;margin-top:6px;padding:3px 7px;border-radius:999px;background:rgba(0,87,68,.09);color:#005744;font-size:7px;font-weight:800}.date-side:last-child .weekday{background:rgba(212,155,0,.12);color:#8a6200}.note{margin-top:7px;padding:7px 8px;border-radius:7px;background:#fff8df;color:#665b38;font-size:7px;line-height:1.45}.note strong{color:#8a6200}.section-grid{display:grid;grid-template-columns:1.45fr .95fr;gap:8px;margin-top:10px}.section-card{background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:14px 16px}.section-card.gold{background:#fffaf0;border-color:#ead9a9}.section-card h2{margin:0 0 6px;color:#06172a;font-size:14px}.section-card p{margin:0;color:#61706d;font-size:9px;line-height:1.6}.steps{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:5px}.steps li{display:flex;gap:7px;align-items:center;color:#3e4e4b;font-size:8px}.num{width:15px;height:15px;border-radius:50%;background:#005744;color:#fff;display:grid;place-items:center;font-size:7px;font-weight:900;flex:0 0 auto}.mini-list{margin:7px 0 0;padding-left:16px;color:#53615f;font-size:8px;line-height:1.65}.faq-card{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:12px 16px}.faq-card h2{margin:0 0 3px;color:#06172a;font-size:14px}.faq{border-top:1px solid #dfe7e3;padding:7px 0}.faq summary{cursor:pointer;color:#263735;font-size:9px;font-weight:800}.faq p{margin:5px 0 0;color:#65716f;font-size:8px;line-height:1.55}.related-card{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:12px 14px}.related-card h2{margin:0 0 8px;color:#06172a;font-size:14px}.related{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.related a{display:flex;align-items:center;gap:7px;text-decoration:none;color:#16302d;background:#fff;border:1px solid #dfe7e3;border-radius:7px;padding:7px 8px;font-size:8px;font-weight:800}.related-icon{font-size:13px}.empty{text-align:center;color:#687673}.empty-icon{font-size:27px;margin-bottom:5px}.empty h3{margin:0 0 4px;color:#805900;font-size:13px}.empty p{margin:0 auto;font-size:9px;line-height:1.5;max-width:250px}@media(max-width:700px){.shell{padding:0 10px}.breadcrumb{font-size:10px}.grid,.section-grid{grid-template-columns:1fr}.panel{padding:17px}.result-panel{min-height:220px}.date-card{grid-template-columns:1fr}.date-side:first-child{border-right:0;border-bottom:1px solid #dbe8e1}.month{white-space:normal}.related{grid-template-columns:1fr 1fr}}
      `}</style>

      <div className="shell">
        <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">MYKSA CONNECT</a> <span>›</span> <a href="/tools/">Saudi Expat Tools</a> <span>›</span> Hijri / Gregorian Converter</nav>
        <img className="banner" src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />
        <div className="content">
          <div className="calculator-card"><div className="grid">
            <section className="panel input-panel">
              <div className="panel-head"><h1 className="panel-title"><span className="panel-icon">📅</span>Gregorian Date</h1><span className="badge">Free Tool</span></div>
              <label className="label" htmlFor="gregorian-date">Select Gregorian date</label>
              <input id="gregorian-date" className="input" type="date" value={gregorianDate} onChange={(e)=>{setGregorianDate(e.target.value);setSubmitted(false)}} />
              <button className="btn" type="button" onClick={()=>setSubmitted(true)}>↻ &nbsp; Convert Date</button>
              <div className="helper">ⓘ Select any Gregorian date to get the corresponding Hijri date using the Saudi Umm al-Qura calendar.</div>
            </section>
            <section className="panel result-panel">
              {submitted && result ? <><p className="result-kicker">Conversion Result</p><p className="result-title">Hijri Date (Umm al-Qura)</p><div className="date-card"><div className="date-side"><span className="date-label">Gregorian Date</span><span className="day">{result.gregorian.day}</span><span className="month">{result.gregorian.month}</span><span className="year">{result.gregorian.year}</span><span className="weekday">{result.gregorian.weekday}</span></div><div className="date-side"><span className="date-label">Hijri Date (Umm al-Qura)</span><span className="day">{result.hijri.day}</span><span className="month">{result.hijri.month}</span><span className="year">{result.hijri.year} AH</span><span className="weekday">{result.hijri.weekday}</span></div></div><div className="note"><strong>Saudi calendar note:</strong> This conversion uses your browser's Umm al-Qura Islamic calendar support where available. Results can differ from manually sighted moon dates for some religious occasions.</div></> : <div className="empty"><div className="empty-icon">🌙</div><h3>Your Hijri result will appear here</h3><p>Select a date and tap “Convert Date”.</p></div>}
            </section>
          </div></div>

          <div className="section-grid"><section className="section-card"><h2>How to use this converter</h2><p>Choose a Gregorian date and convert it to the corresponding Saudi Umm al-Qura Hijri date.</p><ol className="steps"><li><span className="num">1</span>Choose the Gregorian date.</li><li><span className="num">2</span>Tap “Convert Date”.</li><li><span className="num">3</span>Read the Gregorian and Hijri results instantly.</li></ol></section><section className="section-card gold"><h2>Common date conversions</h2><ul className="mini-list"><li>Gregorian date → Hijri date</li><li>Saudi Umm al-Qura calendar reference</li><li>Useful for documents, planning and dates</li></ul></section></div>

          <section className="faq-card"><h2>Frequently Asked Questions</h2><details className="faq"><summary>Which Hijri calendar does this tool use?</summary><p>It uses the browser's Islamic Umm al-Qura calendar implementation where available.</p></details><details className="faq"><summary>Can I use this converter on my phone?</summary><p>Yes. It is responsive and works on mobile, tablet and desktop browsers.</p></details><details className="faq"><summary>Are my dates uploaded or stored?</summary><p>No login is required and the conversion is performed in your browser.</p></details></section>

          <section className="related-card"><h2>More Saudi Expat Tools</h2><div className="related">{TOOL_LINKS.map(([icon,title,href])=><a key={href} href={href}><span className="related-icon">{icon}</span>{title}</a>)}</div></section>
        </div>
      </div>
    </main>
  );
}
