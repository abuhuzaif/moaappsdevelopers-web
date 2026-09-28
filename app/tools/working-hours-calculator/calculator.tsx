
"use client";
import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🛠️", "More Tools", "/tools/"],
];

export default function WorkingHoursCalculator(){
  const [start,setStart]=useState("08:00"),[end,setEnd]=useState("17:00"),[breakM,setBreakM]=useState("60");
  const result=useMemo(()=>{
    const [sh,sm]=start.split(":").map(Number),[eh,em]=end.split(":").map(Number);
    if([sh,sm,eh,em].some(Number.isNaN)) return null;
    let mins=(eh*60+em)-(sh*60+sm); if(mins<0) mins+=1440;
    mins=Math.max(0,mins-(Number(breakM)||0));
    return {mins,h:Math.floor(mins/60),m:mins%60};
  },[start,end,breakM]);
  return (
    <main className="tool-page">
<style jsx>{`
  .tool-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:inherit}
  .shell{width:min(1120px,100%);margin:0 auto;padding:0 4px 52px}
  .crumbs{padding:10px 0 12px;font-size:11px;color:#6a7774}
  .crumbs a{color:#005744;text-decoration:none;font-weight:800}.crumbs span{margin:0 5px}
  .banner{display:block;width:100%;height:auto;object-fit:contain;border-radius:3px}
  .calc-card{margin-top:12px;background:#fff;border:1px solid #dfe7e3;border-radius:11px;padding:7px;display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .panel{border-radius:10px;padding:20px 20px 16px;border:1px solid #d9e7e1;min-width:0}
  .input-panel{background:linear-gradient(145deg,#f2faf7 0%,#fff 78%)}.result-panel{background:linear-gradient(145deg,#fffaf0 0%,#fff 90%);border-color:#ead8a5}
  .head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}.title{font-size:17px;font-weight:900;color:#005744}
  .icon{display:inline-grid;place-items:center;width:30px;height:30px;margin-right:7px;border-radius:9px;background:#dcefe8;font-size:16px;vertical-align:middle}
  .badge{font-size:9px;padding:4px 8px;border-radius:999px;border:1px solid #f0ca57;background:#fff8dd;color:#8a5b00;white-space:nowrap}
  label{display:block;font-size:11px;font-weight:800;color:#243534;margin-bottom:6px}
  input,select{width:100%;box-sizing:border-box;border:1px solid #cbd9d4;border-radius:8px;background:#fff;padding:9px 10px;color:#102123;font:inherit;font-size:12px}
  input:focus,select:focus{outline:2px solid rgba(246,185,31,.25);border-color:#005744}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{margin-bottom:10px}
  .hint{font-size:9px;color:#65716f;line-height:1.45;margin:5px 0 10px}
  .btn{width:100%;border:0;border-radius:8px;background:#005744;color:#fff;padding:10px 12px;font:inherit;font-size:11px;font-weight:900;cursor:pointer}
  .btn:hover{background:#003c31}
  .result-kicker{text-align:center;color:#8a6200;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin:48px 0 4px}
  .result-title{text-align:center;color:#005744;font-size:13px;font-weight:900;margin-bottom:12px}
  .big{text-align:center;color:#06172a;font-size:30px;font-weight:950;line-height:1.05;margin:0 0 12px}
  .result-box{border:1px solid #eadfbe;border-radius:8px;background:#fff;overflow:hidden}
  .result-grid{display:grid;grid-template-columns:1fr 1fr}.result-grid>div{padding:10px;text-align:center}.result-grid>div:first-child{border-right:1px solid #eadfbe}
  .result-grid span{display:block;font-size:8px;color:#7a8583;margin-bottom:4px}.result-grid strong{font-size:12px;color:#102123}
  .note{margin-top:9px;padding:9px 10px;border-radius:7px;background:#edf7f3;color:#5b6c68;font-size:8px;line-height:1.45}
  .empty{min-height:175px;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;border:1px dashed #e7d7a7;border-radius:8px;background:#fffaf0;padding:15px}
  .empty .empty-icon{font-size:27px;margin-bottom:6px}.empty strong{font-size:13px;color:#805900}.empty span{font-size:9px;color:#6c6960;margin-top:4px;max-width:230px;line-height:1.45}
  .section{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:9px;padding:15px}
  .section h2{font-size:14px;color:#06172a;margin:0 0 6px}.intro{font-size:9px;color:#65716f;line-height:1.5;margin:0 0 8px}
  .steps{display:grid;gap:5px}.step{font-size:9px;color:#465654}.step b{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#005744;color:#fff;margin-right:6px;font-size:8px}
  .faq{border-top:1px solid #dfe7e3;padding:8px 0}.faq:first-of-type{border-top:0}.faq summary{font-size:10px;font-weight:800;color:#20302f;cursor:pointer}.faq p{font-size:9px;color:#65716f;line-height:1.5;margin:5px 0 0}
  .related{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.related a{text-decoration:none;color:#102123;border:1px solid #dfe7e3;border-radius:7px;padding:8px;font-size:9px;font-weight:800}.related a:hover{border-color:#005744}.related i{font-style:normal;margin-right:4px}
  @media(max-width:760px){.shell{padding:0 8px 40px}.calc-card{grid-template-columns:1fr}.row{grid-template-columns:1fr}.result-kicker{margin-top:8px}.related{grid-template-columns:1fr 1fr}}
`}</style>

    <div className="shell">
      <nav className="crumbs"><a href="/">MYKSA CONNECT</a><span>›</span><a href="/tools/">Saudi Expat Tools</a><span>›</span>Working Hours Calculator</nav>
      <img className="banner" src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools"/>
      <section className="calc-card">
        <div className="panel input-panel">
          <div className="head"><div className="title"><span className="icon">⏱️</span>Working Hours Calculator</div><span className="badge">Free Tool</span></div>
          <div className="row"><div className="field"><label>Start time</label><input type="time" value={start} onChange={e=>setStart(e.target.value)}/></div><div className="field"><label>End time</label><input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></div></div>
          <div className="field"><label>Unpaid break (minutes)</label><input type="number" min="0" inputMode="numeric" value={breakM} onChange={e=>setBreakM(e.target.value)}/></div>
          <div className="note">If your shift crosses midnight, the calculator treats the end time as the following day.</div>
        </div>
        <div className="panel result-panel">
          <div className="result-kicker">WORKING TIME RESULT</div>
          <div className="result-title">Net working time</div>
          <div className="big">{result ? `${result.h}h ${result.m}m` : "—"}</div>
          <div className="result-box"><div className="result-grid"><div><span>Total minutes</span><strong>{result?.mins ?? "—"}</strong></div><div><span>Break deducted</span><strong>{Number(breakM)||0} min</strong></div></div></div>
        </div>
      </section>
      <section className="section"><h2>How to use this calculator</h2><p className="intro">Choose your shift start and end times, then enter any unpaid break.</p><div className="steps"><div className="step"><b>1</b>Select your start time.</div><div className="step"><b>2</b>Select your end time.</div><div className="step"><b>3</b>Enter unpaid break minutes and read the net hours.</div></div></section>
      <section className="section"><h2>Frequently Asked Questions</h2>
        <details className="faq"><summary>Does it handle overnight shifts?</summary><p>Yes. If the end time is earlier than the start time, it is treated as the next day.</p></details>
        <details className="faq"><summary>Are overtime rules included?</summary><p>No. This tool calculates elapsed net working time only; employment-specific overtime rules can differ.</p></details>
        <details className="faq"><summary>Can I use it on mobile?</summary><p>Yes. The tool is responsive for phone, tablet and desktop browsers.</p></details>
      </section>
      <section className="section"><h2>More Saudi Expat Tools</h2><div className="related">{TOOL_LINKS.map(([i,t,h])=><a href={h} key={h}><i>{i}</i>{t}</a>)}</div></section>
    </div>
    </main>
  );
}

