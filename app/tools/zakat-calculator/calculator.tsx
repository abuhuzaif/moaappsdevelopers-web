"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["•••", "More Tools", "/tools/"],
];

function money(value: number) {
  return new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 2 }).format(value);
}

export default function ZakatCalculator() {
  const [cash, setCash] = useState("0");
  const [gold, setGold] = useState("0");
  const [silver, setSilver] = useState("0");
  const [receivables, setReceivables] = useState("0");
  const [other, setOther] = useState("0");
  const [liabilities, setLiabilities] = useState("0");
  const [nisab, setNisab] = useState("0");

  const result = useMemo(() => {
    const n = (v:string) => Math.max(0, Number(v)||0);
    const assets = n(cash)+n(gold)+n(silver)+n(receivables)+n(other);
    const net = Math.max(0, assets-n(liabilities));
    const threshold = n(nisab);
    const eligible = threshold > 0 && net >= threshold;
    const zakat = eligible ? net * 0.025 : 0;
    return {assets,net,threshold,eligible,zakat};
  },[cash,gold,silver,receivables,other,liabilities,nisab]);

  return (
    <main className="tool-page">
      <style jsx>{`\
        .tool-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:inherit}.shell{width:min(1120px,100%);margin:0 auto}.breadcrumb{font-size:12px;color:#65716f;padding:8px 0 10px}.breadcrumb a{color:#005744;text-decoration:none;font-weight:800}.hero-banner{width:100%;display:block;height:auto;object-fit:contain;border-radius:3px}.content{padding:12px 0 55px}.main-card{background:#fff;border:1px solid #dfe7e3;border-radius:14px;padding:7px;box-shadow:0 8px 24px rgba(6,23,42,.05)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.panel{border-radius:10px;padding:20px;min-width:0}.input-panel{background:linear-gradient(145deg,#f0faf6 0%,#fff 75%);border:1px solid #d9e7e1}.result-panel{background:linear-gradient(145deg,#fffdf7 0%,#fffaf0 100%);border:1px solid #ecdcae;display:flex;flex-direction:column;justify-content:center}.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}.title{margin:0;color:#005744;font-size:17px;font-weight:900;display:flex;align-items:center;gap:8px}.icon{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#dcefe8;font-size:16px}.badge{padding:5px 9px;border-radius:999px;border:1px solid #f0ca57;background:#fff8dd;color:#8a5b00;font-size:9px;font-weight:900;white-space:nowrap}.intro{margin:0 0 12px;color:#5d6a68;font-size:9px;line-height:1.45}.field{display:block;margin-bottom:8px}.field span{display:block;margin-bottom:5px;font-size:10px;font-weight:800;color:#233335}.input-wrap{position:relative}.input-wrap b{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:9px;color:#7a8583}.input{width:100%;box-sizing:border-box;border:1px solid #cfd9d5;border-radius:7px;padding:8px 35px 8px 9px;font:inherit;font-size:11px;background:#fff;color:#102123}.input:focus{outline:2px solid rgba(246,185,31,.25);border-color:#005744}.helper{margin-top:9px;padding:8px 10px;border-radius:8px;background:#edf7f3;color:#536765;font-size:8px;line-height:1.4}.result-kicker{text-align:center;color:#8a5b00;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}.status{text-align:center;font-size:11px;font-weight:900;color:#005744;margin:3px 0}.status.not-eligible{color:#8a5b00}.big{text-align:center;color:#071d35;font-size:30px;font-weight:900;line-height:1.05;margin:5px 0 9px}.result-box{display:grid;grid-template-columns:1fr 1fr;border:1px solid #eadfbe;border-radius:9px;overflow:hidden;background:#fff}.result-box div{padding:8px;text-align:center}.result-box div+div{border-left:1px solid #eadfbe}.result-box span{display:block;color:#7a8583;font-size:8px;margin-bottom:3px}.result-box strong{color:#005744;font-size:11px}.formula{margin-top:8px;text-align:center;color:#596864;font-size:8px}.section{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:10px;padding:14px}.section h2{margin:0 0 7px;color:#06172a;font-size:15px}.section p{margin:0;color:#5d6a68;font-size:10px;line-height:1.55}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.step{font-size:9px;color:#536765;line-height:1.4}.step b{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:5px;border-radius:50%;background:#005744;color:#fff;font-size:9px}.faq{border-top:1px solid #dfe7e3;padding:9px 0}.faq:first-of-type{border-top:0}.faq summary{cursor:pointer;color:#20302f;font-size:10px;font-weight:850}.faq p{margin:5px 0 0;font-size:9px}.related{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-top:8px}.related a{text-decoration:none;color:#102123;background:#fff;border:1px solid #dfe7e3;border-radius:7px;padding:8px;font-size:8px;font-weight:800}.related span{display:block;font-size:14px;margin-bottom:4px}.note{margin-top:8px;padding:9px 11px;border-radius:8px;background:#fff8df;color:#665b38;font-size:9px;line-height:1.45}@media(max-width:760px){.shell{padding:0 10px}.grid{grid-template-columns:1fr}.steps{grid-template-columns:1fr}.related{grid-template-columns:repeat(2,1fr)}.panel{padding:16px}.content{padding-top:10px}}\
      `}</style>
      <div className="shell">
        <nav className="breadcrumb"><a href="/">MYKSA CONNECT</a> &nbsp;›&nbsp; <a href="/tools/">Saudi Expat Tools</a> &nbsp;›&nbsp; Zakat Calculator</nav>
        <img className="hero-banner" src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />
        <section className="content">
          <div className="main-card"><div className="grid">
            <div className="panel input-panel">
              <div className="head"><h1 className="title"><span className="icon">🧮</span>Zakat Calculator</h1><span className="badge">Free Tool</span></div>
              <p className="intro">Enter the value of your eligible Zakat assets, liabilities and the Nisab threshold you follow.</p>
              {[
                ['Cash & savings', cash, setCash],
                ['Gold value', gold, setGold],
                ['Silver value', silver, setSilver],
                ['Eligible receivables', receivables, setReceivables],
                ['Other zakatable assets', other, setOther],
                ['Short-term liabilities', liabilities, setLiabilities],
                ['Nisab threshold', nisab, setNisab],
              ].map(([label, value, setter]) => (
                <label className="field" key={label}>
                  <span>{label}</span>
                  <div className="input-wrap">
                    <input className="input" type="number" min="0" inputMode="decimal" value={value} onChange={e => setter(e.target.value)} />
                    <b>SAR</b>
                  </div>
                </label>
              ))}
              <div className="helper">For a religiously appropriate Nisab figure, enter the threshold based on the gold or silver method you follow. This calculator does not fetch a live metal price.</div>
            </div>
            <div className="panel result-panel">
              <div className="result-kicker">ZAKAT ESTIMATE</div><div className={`status ${result.eligible?"":"not-eligible"}`}>{result.threshold>0?(result.eligible?"Zakat threshold reached":"Below entered Nisab threshold"):"Enter your Nisab threshold"}</div><div className="big">{money(result.zakat)}</div>
              <div className="result-box"><div><span>Net Zakatable Wealth</span><strong>{money(result.net)}</strong></div><div><span>Zakat Rate</span><strong>2.5%</strong></div></div>
              <div className="formula">Estimated Zakat = eligible net wealth × 2.5%</div>
            </div>
          </div></div>
          <div className="section"><h2>How to use this calculator</h2><p>Add the values of assets you consider Zakatable, subtract eligible short-term liabilities, then enter the Nisab threshold you follow. The tool estimates 2.5% when your net wealth reaches that threshold.</p><div className="steps"><div className="step"><b>1</b>Enter eligible assets.</div><div className="step"><b>2</b>Subtract eligible liabilities.</div><div className="step"><b>3</b>Check Nisab and estimate Zakat.</div></div></div>
          <div className="section"><h2>Zakat calculation note</h2><p>This is an estimation tool, not a religious ruling. Zakat rules can differ by asset type, debt, ownership, Hawl and the Nisab method followed. For a personal ruling, consult a qualified scholar or trusted Zakat authority.</p><div className="note">The calculator intentionally lets you enter your own Nisab threshold so it does not assume a particular gold/silver price or religious method.</div></div>
          <div className="section"><h2>Frequently Asked Questions</h2><details className="faq"><summary>Why do I need to enter the Nisab threshold?</summary><p>Nisab values can change with precious-metal prices and different methods may be followed. Enter the figure appropriate to your situation.</p></details><details className="faq"><summary>Does the calculator use a 2.5% rate?</summary><p>Yes, when the entered net Zakatable wealth reaches the entered Nisab threshold, the estimate uses 2.5%.</p></details><details className="faq"><summary>Is this a religious ruling?</summary><p>No. It is a simple estimation tool and should not replace advice from a qualified scholar.</p></details></div>
          <div className="section"><h2>More Saudi Expat Tools</h2><div className="related">{TOOL_LINKS.map(([icon,title,href])=><a href={href} key={href}><span>{icon}</span>{title}</a>)}</div></div>
        </section>
      </div>
    </main>
  );
}
