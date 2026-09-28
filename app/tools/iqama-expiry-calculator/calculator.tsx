"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🧮", "Zakat Calculator", "/tools/zakat-calculator/"],
  ["•••", "More Tools", "/tools/"],
];

function formatGregorian(date: Date) {
  return new Intl.DateTimeFormat("en-SA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHijri(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "Hijri date unavailable in this browser";
  }
}

function parseDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function calendarMonthsAndDays(from: Date, to: Date) {
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());

  let anchor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, from.getUTCDate())
  );

  if (anchor > to) {
    months -= 1;
    anchor = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + months, from.getUTCDate())
    );
  }

  const days = Math.round((to.getTime() - anchor.getTime()) / 86400000);
  return { months: Math.max(months, 0), days: Math.max(days, 0) };
}

export default function IqamaExpiryCalculator() {
  const [expiry, setExpiry] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const expiryDate = parseDate(expiry);
    if (!expiryDate) return null;

    const today = todayUtc();
    const days = Math.round((expiryDate.getTime() - today.getTime()) / 86400000);
    const expired = days < 0;
    const absoluteDays = Math.abs(days);
    const md = expired
      ? calendarMonthsAndDays(expiryDate, today)
      : calendarMonthsAndDays(today, expiryDate);

    return {
      expiryDate,
      days,
      expired,
      absoluteDays,
      months: md.months,
      remainderDays: md.days,
      hijri: formatHijri(expiryDate),
    };
  }, [expiry]);

  return (
    <main className="tool-page">
      <style jsx>{`
        .tool-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:inherit}
        .shell{width:min(1100px,100%);margin:0 auto}
        .breadcrumb{padding:10px 0 12px;font-size:11px;color:#6a7774}
        .breadcrumb a{color:#005744;text-decoration:none;font-weight:800}
        .banner{display:block;width:100%;height:auto;border-radius:4px;object-fit:contain}
        .content{padding:12px 0 42px}
        .calculator-card{background:#fff;border:1px solid #dfe7e3;border-radius:12px;padding:6px;box-shadow:0 3px 12px rgba(6,23,42,.05)}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .panel{min-width:0;border-radius:10px;padding:20px 22px}
        .input-panel{background:#f3faf7;border:1px solid #d7e8e1}
        .result-panel{background:#fffaf0;border:1px solid #ead9a9;display:flex;flex-direction:column;justify-content:center;min-height:246px}
        .panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}
        .panel-title{margin:0;color:#005744;font-size:16px;font-weight:900;display:flex;align-items:center;gap:8px}
        .panel-icon{width:30px;height:30px;border-radius:9px;background:#dff1ea;display:grid;place-items:center;font-size:16px}
        .badge{padding:5px 9px;border:1px solid #f0ca57;background:#fff8dc;color:#8a5b00;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}
        .label{display:block;margin:0 0 7px;color:#263735;font-size:10px;font-weight:800}
        input{width:100%;box-sizing:border-box;border:1px solid #cbd9d4;border-radius:8px;background:#fff;color:#102123;padding:9px 10px;font:inherit;font-size:11px;min-height:38px}
        input:focus{outline:2px solid rgba(246,185,31,.22);border-color:#005744}
        .hint{margin:7px 0 13px;color:#687673;font-size:9px;line-height:1.45}
        .btn{width:100%;border:0;border-radius:8px;background:#005744;color:#fff;padding:10px 14px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
        .btn:hover{background:#003c31}
        .privacy{margin-top:12px;padding:9px 10px;border-radius:7px;background:#e9f5f0;color:#61716d;font-size:8px;line-height:1.45}
        .result-kicker{text-align:center;margin:0 0 5px;color:#8a5b00;font-size:8px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
        .result-title{text-align:center;color:#005744;font-size:11px;font-weight:900;margin-bottom:7px}
        .big{text-align:center;color:#06172a;font-size:27px;line-height:1.05;font-weight:950;margin:0 0 10px}
        .result-box{border:1px solid #eadfbe;border-radius:8px;overflow:hidden;background:#fff}
        .date-line{margin:0;padding:8px 10px;text-align:center;color:#40514e;font-size:8px;line-height:1.65}
        .date-line strong{color:#005744}
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px}
        .stat{background:#fff;border:1px solid #e2e6e3;border-radius:7px;padding:7px 4px;text-align:center}
        .stat span{display:block;color:#7a8583;font-size:7px;margin-bottom:2px}.stat strong{color:#14292a;font-size:11px}
        .empty{text-align:center}.empty-icon{font-size:27px;margin-bottom:5px}.empty h3{margin:0 0 4px;color:#805900;font-size:13px}.empty p{margin:0 auto;color:#6c6960;font-size:9px;line-height:1.5;max-width:250px}
        .section-grid{display:grid;grid-template-columns:1.45fr .95fr;gap:8px;margin-top:10px}
        .section-card{background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:14px 16px}
        .section-card.gold{background:#fffaf0;border-color:#ead9a9}
        .section-card h2{margin:0 0 6px;color:#06172a;font-size:14px}.section-card p{margin:0;color:#61706d;font-size:9px;line-height:1.6}
        .steps{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:5px}.steps li{display:flex;gap:7px;align-items:center;color:#3e4e4b;font-size:8px}.num{width:15px;height:15px;border-radius:50%;background:#005744;color:#fff;display:grid;place-items:center;font-size:7px;font-weight:900;flex:0 0 auto}
        .mini-list{margin:7px 0 0;padding-left:16px;color:#53615f;font-size:8px;line-height:1.65}
        .faq-card{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:12px 16px}.faq-card h2{margin:0 0 3px;color:#06172a;font-size:14px}.faq{border-top:1px solid #dfe7e3;padding:7px 0}.faq summary{cursor:pointer;color:#263735;font-size:9px;font-weight:800}.faq p{margin:5px 0 0;color:#65716f;font-size:8px;line-height:1.55}
        .related-card{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:12px 14px}.related-card h2{margin:0 0 8px;color:#06172a;font-size:14px}.related{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.related a{display:flex;align-items:center;gap:7px;text-decoration:none;color:#16302d;background:#fff;border:1px solid #dfe7e3;border-radius:7px;padding:7px 8px;font-size:8px;font-weight:800}.related-icon{font-size:13px}
        @media(max-width:700px){.shell{padding:0 10px}.breadcrumb{font-size:10px}.grid,.section-grid{grid-template-columns:1fr}.panel{padding:17px}.result-panel{min-height:220px}.related{grid-template-columns:1fr 1fr}}
      `}</style>

      <div className="shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">MYKSA CONNECT</a> <span>›</span> <a href="/tools/">Saudi Expat Tools</a> <span>›</span> Iqama Expiry Calculator
        </nav>
        <img className="banner" src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />

        <div className="content">
          <div className="calculator-card">
            <div className="grid">
              <section className="panel input-panel">
                <div className="panel-head"><h1 className="panel-title"><span className="panel-icon">📅</span>Iqama Expiry Date</h1><span className="badge">Free Tool</span></div>
                <label className="label" htmlFor="iqama-expiry">Select your Iqama expiry date</label>
                <input id="iqama-expiry" type="date" value={expiry} onChange={(e)=>{setExpiry(e.target.value);setSubmitted(false)}} />
                <p className="hint">Enter the expiry date exactly as shown on your Iqama or official record.</p>
                <button className="btn" type="button" onClick={()=>setSubmitted(true)}>✓ Check Iqama Expiry</button>
                <div className="privacy">🔒 <strong>Privacy:</strong> This calculator runs in your browser. Your date is used only to calculate the result and is not submitted to MYKSA CONNECT.</div>
              </section>

              <section className="panel result-panel">
                {!submitted && <div className="empty"><div className="empty-icon">📅</div><h3>Check your Iqama expiry</h3><p>Select your expiry date and tap “Check Iqama Expiry” to see remaining time and the Hijri expiry date.</p></div>}
                {submitted && !result && <div className="empty"><div className="empty-icon">📅</div><h3>Date required</h3><p>Please select your Iqama expiry date above to calculate the remaining time.</p></div>}
                {result && <>
                  <p className="result-kicker">Iqama Expiry Status</p>
                  <p className="result-title">{result.expired ? "Iqama has expired" : "Iqama is currently valid"}</p>
                  <p className="big">{result.expired ? `${result.absoluteDays} days ago` : `${result.days} days remaining`}</p>
                  <div className="result-box"><p className="date-line"><strong>Expiry:</strong> {formatGregorian(result.expiryDate)}<br/><strong>Hijri:</strong> {result.hijri}</p></div>
                  <div className="stats"><div className="stat"><span>Calendar months</span><strong>{result.months}</strong></div><div className="stat"><span>Extra days</span><strong>{result.remainderDays}</strong></div><div className="stat"><span>Calculated from</span><strong>Today</strong></div></div>
                </>}
              </section>
            </div>
          </div>

          <div className="section-grid">
            <section className="section-card"><h2>How to use this calculator</h2><p>Enter the expiry date shown on your Iqama or official Saudi record.</p><ol className="steps"><li><span className="num">1</span>Select your Iqama expiry date.</li><li><span className="num">2</span>Tap “Check Iqama Expiry”.</li><li><span className="num">3</span>Read your remaining days, months and Hijri expiry date.</li></ol></section>
            <section className="section-card gold"><h2>Iqama expiry information</h2><ul className="mini-list"><li>The calculator uses the date you enter.</li><li>It does not access your Iqama number or Absher account.</li><li>For official records, use authorized Saudi government services.</li></ul></section>
          </div>

          <section className="faq-card"><h2>Frequently Asked Questions</h2>
            <details className="faq"><summary>Can I enter my Iqama number to get the expiry date?</summary><p>No. An Iqama number does not mathematically contain the expiry date. This tool requires the expiry date shown on your official record.</p></details>
            <details className="faq"><summary>Does this calculator connect to Absher?</summary><p>No. It is a browser-based calculator and does not access your Absher account or government records.</p></details>
            <details className="faq"><summary>Can I use this tool on my phone?</summary><p>Yes. The calculator is responsive and works on mobile, tablet and desktop browsers.</p></details>
          </section>

          <section className="related-card"><h2>More Saudi Expat Tools</h2><div className="related">{TOOL_LINKS.map(([icon,title,href])=><a key={href} href={href}><span className="related-icon">{icon}</span>{title}</a>)}</div></section>
        </div>
      </div>
    </main>
  );
}
