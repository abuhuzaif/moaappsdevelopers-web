"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🧮", "Zakat Calculator", "/tools/zakat-calculator/"],
  ["•••", "More Tools", "/tools/"],
];

function money(value: number) {
  return new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 2 }).format(value);
}

export default function RentSplitCalculator() {
  const [rent, setRent] = useState("3000");
  const [utilities, setUtilities] = useState("300");
  const [people, setPeople] = useState("2");
  const [months, setMonths] = useState("1");

  const result = useMemo(() => {
    const r = Math.max(0, Number(rent) || 0);
    const u = Math.max(0, Number(utilities) || 0);
    const p = Math.max(1, Math.floor(Number(people) || 1));
    const m = Math.max(1, Math.floor(Number(months) || 1));
    const monthlyTotal = r + u;
    return { r, u, p, m, monthlyTotal, perPersonMonthly: monthlyTotal / p, totalPeriod: monthlyTotal * m, perPersonPeriod: (monthlyTotal * m) / p };
  }, [rent, utilities, people, months]);

  return (
    <main className="tool-page">
      <style jsx>{`\
        .tool-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:inherit}.shell{width:min(1120px,100%);margin:0 auto}.breadcrumb{font-size:12px;color:#65716f;padding:8px 0 10px}.breadcrumb a{color:#005744;text-decoration:none;font-weight:800}.hero-banner{width:100%;display:block;height:auto;object-fit:contain;border-radius:3px}.content{padding:12px 0 55px}.main-card{background:#fff;border:1px solid #dfe7e3;border-radius:14px;padding:7px;box-shadow:0 8px 24px rgba(6,23,42,.05)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.panel{border-radius:10px;padding:20px;min-width:0}.input-panel{background:linear-gradient(145deg,#f0faf6 0%,#fff 75%);border:1px solid #d9e7e1}.result-panel{background:linear-gradient(145deg,#fffdf7 0%,#fffaf0 100%);border:1px solid #ecdcae;display:flex;flex-direction:column;justify-content:center}.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px}.title{margin:0;color:#005744;font-size:17px;font-weight:900;display:flex;align-items:center;gap:8px}.icon{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#dcefe8;font-size:16px}.badge{padding:5px 9px;border-radius:999px;border:1px solid #f0ca57;background:#fff8dd;color:#8a5b00;font-size:9px;font-weight:900;white-space:nowrap}.field{display:block;margin-bottom:11px}.field span{display:block;margin-bottom:6px;font-size:11px;font-weight:800;color:#233335}.input-wrap{position:relative}.input-wrap b{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;color:#7a8583}.input{width:100%;box-sizing:border-box;border:1px solid #cfd9d5;border-radius:8px;padding:9px 42px 9px 10px;font:inherit;font-size:12px;background:#fff;color:#102123}.input:focus{outline:2px solid rgba(246,185,31,.25);border-color:#005744}.helper{margin-top:10px;padding:9px 11px;border-radius:8px;background:#edf7f3;color:#536765;font-size:9px;line-height:1.4}.result-kicker{text-align:center;color:#8a5b00;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}.big{text-align:center;color:#071d35;font-size:30px;font-weight:900;line-height:1.05;margin:4px 0 10px}.result-box{display:grid;grid-template-columns:1fr 1fr;border:1px solid #eadfbe;border-radius:9px;overflow:hidden;background:#fff}.result-box div{padding:9px;text-align:center}.result-box div+div{border-left:1px solid #eadfbe}.result-box span{display:block;color:#7a8583;font-size:8px;margin-bottom:3px}.result-box strong{color:#005744;font-size:12px}.period{margin-top:8px;text-align:center;color:#596864;font-size:9px}.section{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:14px}.section h2{margin:0 0 7px;color:#06172a;font-size:15px}.section p{margin:0;color:#5d6a68;font-size:10px;line-height:1.55}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.step{font-size:9px;color:#536765;line-height:1.4}.step b{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:5px;border-radius:50%;background:#005744;color:#fff;font-size:9px}.faq{border-top:1px solid #dfe7e3;padding:9px 0}.faq:first-of-type{border-top:0}.faq summary{cursor:pointer;color:#20302f;font-size:10px;font-weight:850}.faq p{margin:5px 0 0;font-size:9px}.related{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-top:8px}.related a{text-decoration:none;color:#102123;background:#fff;border:1px solid #dfe7e3;border-radius:7px;padding:8px;font-size:8px;font-weight:800}.related span{display:block;font-size:14px;margin-bottom:4px}.note{margin-top:9px;padding:9px 11px;border-radius:8px;background:#fff8df;color:#665b38;font-size:9px;line-height:1.45}@media(max-width:760px){.shell{padding:0 10px}.grid{grid-template-columns:1fr}.steps{grid-template-columns:1fr}.related{grid-template-columns:repeat(2,1fr)}.panel{padding:16px}.content{padding-top:10px}}\
      `}</style>
      <div className="shell">
        <nav className="breadcrumb"><a href="/">MYKSA CONNECT</a> &nbsp;›&nbsp; <a href="/tools/">Saudi Expat Tools</a> &nbsp;›&nbsp; Rent Split Calculator</nav>
        <img className="hero-banner" src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />
        <section className="content">
          <div className="main-card"><div className="grid">
            <div className="panel input-panel">
              <div className="head"><h1 className="title"><span className="icon">🏠</span>Rent Split Calculator</h1><span className="badge">Free Tool</span></div>
              <label className="field"><span>Monthly rent</span><div className="input-wrap"><input className="input" type="number" min="0" inputMode="decimal" value={rent} onChange={e=>setRent(e.target.value)}/><b>SAR</b></div></label>
              <label className="field"><span>Monthly utilities & shared bills</span><div className="input-wrap"><input className="input" type="number" min="0" inputMode="decimal" value={utilities} onChange={e=>setUtilities(e.target.value)}/><b>SAR</b></div></label>
              <label className="field"><span>Number of people</span><input className="input" type="number" min="1" step="1" value={people} onChange={e=>setPeople(e.target.value)}/></label>
              <label className="field"><span>Number of months</span><input className="input" type="number" min="1" step="1" value={months} onChange={e=>setMonths(e.target.value)}/></label>
              <div className="helper">Enter the shared monthly costs and number of people. The calculator divides the total equally.</div>
            </div>
            <div className="panel result-panel">
              <div className="result-kicker">SPLIT RESULT</div><div className="big">{money(result.perPersonMonthly)}</div>
              <div className="result-box"><div><span>Total monthly cost</span><strong>{money(result.monthlyTotal)}</strong></div><div><span>Per person / month</span><strong>{money(result.perPersonMonthly)}</strong></div></div>
              <div className="period">For {result.m} month{result.m===1?"":"s"}: <strong>{money(result.perPersonPeriod)}</strong> per person</div>
            </div>
          </div></div>

          <div className="section"><h2>How to use this calculator</h2><p>Enter your monthly rent, shared bills and number of people. The result shows the equal share for each person.</p><div className="steps"><div className="step"><b>1</b>Enter monthly rent.</div><div className="step"><b>2</b>Add utilities and shared bills.</div><div className="step"><b>3</b>See each person's share.</div></div></div>
          <div className="section"><h2>Rent sharing note</h2><p>This tool assumes an equal split. If roommates have different room sizes, private utilities or agreed percentages, adjust the inputs or calculate those differences separately.</p></div>
          <div className="section"><h2>Frequently Asked Questions</h2><details className="faq"><summary>Does this include utilities?</summary><p>Yes. Enter monthly utilities and other shared bills in the utilities field.</p></details><details className="faq"><summary>Can I split rent between more than two people?</summary><p>Yes. Enter any whole number of people from 1 upward.</p></details><details className="faq"><summary>Is my information stored?</summary><p>No login is required and calculations are performed in your browser.</p></details></div>
          <div className="section"><h2>More Saudi Expat Tools</h2><div className="related">{TOOL_LINKS.map(([icon,title,href])=><a href={href} key={href}><span>{icon}</span>{title}</a>)}</div></div>
        </section>
      </div>
    </main>
  );
}
