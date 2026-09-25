"use client";
import { useEffect, useMemo, useState } from "react";

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🛠️", "More Tools", "/tools/"],
] as const;

const FALLBACK_RATES: Record<string, number> = {
  SAR: 1,
  USD: 0.2666666667,
  EUR: 0.234453,
  GBP: 0.201729,
  INR: 25.5951,
  PKR: 73.91,
  AED: 0.979432,
  QAR: 0.970936,
  KWD: 0.082427,
  BDT: 32.8198,
  LKR: 88.1834,
  CNY: 1.79012,
  JPY: 42.39,
  CAD: 0.37699,
  AUD: 0.3958,
  CHF: 0.2210,
  MYR: 1.0910,
  SGD: 0.3400,
  THB: 8.85,
  IDR: 4375,
  PHP: 15.28,
  KRW: 396.0,
  TRY: 10.75,
  EGP: 13.90,
  JOD: 0.1890,
  OMR: 0.10267,
  BHD: 0.10052,
  ZAR: 4.50,
  NPR: 160.0,
};

const COUNTRIES = [
  ["🇸🇦", "Saudi Arabia", "SAR"],
  ["🇮🇳", "India", "INR"],
  ["🇵🇰", "Pakistan", "PKR"],
  ["🇧🇩", "Bangladesh", "BDT"],
  ["🇱🇰", "Sri Lanka", "LKR"],
  ["🇦🇪", "United Arab Emirates", "AED"],
  ["🇶🇦", "Qatar", "QAR"],
  ["🇰🇼", "Kuwait", "KWD"],
  ["🇧🇭", "Bahrain", "BHD"],
  ["🇴🇲", "Oman", "OMR"],
  ["🇺🇸", "United States", "USD"],
  ["🇬🇧", "United Kingdom", "GBP"],
  ["🇪🇺", "Eurozone", "EUR"],
  ["🇨🇦", "Canada", "CAD"],
  ["🇦🇺", "Australia", "AUD"],
  ["🇨🇭", "Switzerland", "CHF"],
  ["🇯🇵", "Japan", "JPY"],
  ["🇨🇳", "China", "CNY"],
  ["🇲🇾", "Malaysia", "MYR"],
  ["🇸🇬", "Singapore", "SGD"],
  ["🇹🇭", "Thailand", "THB"],
  ["🇮🇩", "Indonesia", "IDR"],
  ["🇵🇭", "Philippines", "PHP"],
  ["🇰🇷", "South Korea", "KRW"],
  ["🇹🇷", "Türkiye", "TRY"],
  ["🇪🇬", "Egypt", "EGP"],
  ["🇯🇴", "Jordan", "JOD"],
  ["🇿🇦", "South Africa", "ZAR"],
  ["🇳🇵", "Nepal", "NPR"],
] as const;

const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(([flag, name, code]) => [code, { flag, name }]));

// The API returns how many units of each currency equal 1 SAR.
// Therefore a cross-rate is targetUnitsPerSAR / sourceUnitsPerSAR.
function getRate(rates: Record<string, number>, from: string, to: string) {
  const fromPerSar = rates[from] ?? 1;
  const toPerSar = rates[to] ?? 1;
  if (!fromPerSar || !toPerSar) return 0;
  return toPerSar / fromPerSar;
}

export default function TravelCurrencyCalculator() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("SAR");
  const [to, setTo] = useState("INR");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [updatedAt, setUpdatedAt] = useState("25 September 2026");
  const [source, setSource] = useState("Fallback reference rate");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/exchange-rates", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.rates) return;
        setRates(data.rates);
        setUpdatedAt(data.updatedAt ?? "Latest available");
        setSource(data.source ?? "Automatic exchange-rate API");
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const rate = useMemo(() => getRate(rates, from, to), [rates, from, to]);
  const result = useMemo(() => (Number(amount) || 0) * rate, [amount, rate]);
  const fromCountry = COUNTRY_BY_CODE[from];
  const toCountry = COUNTRY_BY_CODE[to];

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
  }

  return (
    <main className="tool-page">
      <style jsx>{`
        .tool-page{min-height:100vh;background:#fbfaf7;color:#0b1719;font-family:inherit}
        .shell{width:min(1120px,100%);margin:0 auto;padding:0 4px 52px}
        .crumbs{padding:10px 0 12px;font-size:11px;color:#6a7774}.crumbs a{color:#005744;text-decoration:none;font-weight:800}.crumbs span{margin:0 5px}
        .banner{display:block;width:100%;height:auto;object-fit:contain;border-radius:3px}
        .calc-card{margin-top:12px;background:#fff;border:1px solid #dfe7e3;border-radius:11px;padding:7px;display:grid;grid-template-columns:1fr 1fr;gap:7px}
        .panel{border-radius:10px;padding:20px 20px 16px;border:1px solid #d9e7e1;min-width:0}
        .input-panel{background:linear-gradient(145deg,#f2faf7 0%,#fff 78%)}.result-panel{background:linear-gradient(145deg,#fffaf0 0%,#fff 90%);border-color:#ead8a5}
        .head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.title{font-size:17px;font-weight:900;color:#005744}
        .icon{display:inline-grid;place-items:center;width:30px;height:30px;margin-right:7px;border-radius:9px;background:#dcefe8;font-size:16px;vertical-align:middle}
        .badge{font-size:9px;padding:4px 8px;border-radius:999px;border:1px solid #f0ca57;background:#fff8dd;color:#8a5b00;white-space:nowrap}
        label{display:block;font-size:11px;font-weight:800;color:#243534;margin-bottom:6px}
        input,select{width:100%;box-sizing:border-box;border:1px solid #cbd9d4;border-radius:8px;background:#fff;padding:9px 10px;color:#102123;font:inherit;font-size:12px}
        input:focus,select:focus{outline:2px solid rgba(246,185,31,.25);border-color:#005744}
        input[readonly]{background:#f5f8f7;color:#52615f}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{margin-bottom:10px}
        .country-label{display:flex;align-items:center;gap:6px}.country-select{font-size:12px}
        .swap-row{display:flex;justify-content:center;margin:-2px 0 5px}.swap{border:1px solid #cbd9d4;background:#fff;color:#005744;border-radius:999px;width:34px;height:28px;cursor:pointer;font-weight:900}.swap:hover{border-color:#005744;background:#f2faf7}
        .hint{font-size:9px;color:#65716f;line-height:1.45;margin:5px 0 10px}
        .note{margin-top:9px;padding:9px 10px;border-radius:7px;background:#edf7f3;color:#5b6c68;font-size:8px;line-height:1.45}
        .status{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:8px;color:#5f6e6b}.dot{width:6px;height:6px;border-radius:50%;background:#005744}.dot.loading{background:#f6b91f}
        .result-kicker{text-align:center;color:#8a6200;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin:48px 0 4px}
        .result-title{text-align:center;color:#005744;font-size:13px;font-weight:900;margin-bottom:12px}.big{text-align:center;color:#06172a;font-size:30px;font-weight:950;line-height:1.05;margin:0 0 12px}
        .result-box{border:1px solid #eadfbe;border-radius:8px;background:#fff;overflow:hidden}.result-grid{display:grid;grid-template-columns:1fr 1fr}.result-grid>div{padding:10px;text-align:center}.result-grid>div:first-child{border-right:1px solid #eadfbe}.result-grid span{display:block;font-size:8px;color:#7a8583;margin-bottom:4px}.result-grid strong{font-size:12px;color:#102123}
        .section{margin-top:10px;background:#fff;border:1px solid #dfe7e3;border-radius:9px;padding:15px}.section h2{font-size:14px;color:#06172a;margin:0 0 6px}.intro{font-size:9px;color:#65716f;line-height:1.5;margin:0 0 8px}.steps{display:grid;gap:5px}.step{font-size:9px;color:#465654}.step b{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#005744;color:#fff;margin-right:6px;font-size:8px}
        .faq{border-top:1px solid #dfe7e3;padding:8px 0}.faq:first-of-type{border-top:0}.faq summary{font-size:10px;font-weight:800;color:#20302f;cursor:pointer}.faq p{font-size:9px;color:#65716f;line-height:1.5;margin:5px 0 0}
        .related{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.related a{text-decoration:none;color:#102123;border:1px solid #dfe7e3;border-radius:7px;padding:8px;font-size:9px;font-weight:800}.related a:hover{border-color:#005744}.related i{font-style:normal;margin-right:4px}
        @media(max-width:760px){.shell{padding:0 8px 40px}.calc-card{grid-template-columns:1fr}.row{grid-template-columns:1fr}.result-kicker{margin-top:8px}.related{grid-template-columns:1fr 1fr}}
      `}</style>

      <div className="shell">
        <nav className="crumbs"><a href="/">MYKSA CONNECT</a><span>›</span><a href="/tools/">Saudi Expat Tools</a><span>›</span>Travel Currency Calculator</nav>
        <img className="banner" src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools"/>
        <section className="calc-card">
          <div className="panel input-panel">
            <div className="head"><div className="title"><span className="icon">✈️</span>Travel Currency Calculator</div><span className="badge">Free Tool</span></div>
            <p className="hint">Convert travel amounts using automatically updated reference exchange rates. Choose countries instead of currency codes, and the latest available reference rate is applied automatically.</p>
            <div className="field"><label>Amount</label><input type="number" min="0" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/></div>
            <div className="row">
              <div className="field"><label className="country-label">From Country</label><select className="country-select" value={from} onChange={e=>setFrom(e.target.value)}>{COUNTRIES.map(([flag,name,code])=><option key={code} value={code}>{flag} {name} — {code}</option>)}</select></div>
              <div className="field"><label className="country-label">To Country</label><select className="country-select" value={to} onChange={e=>setTo(e.target.value)}>{COUNTRIES.map(([flag,name,code])=><option key={code} value={code}>{flag} {name} — {code}</option>)}</select></div>
            </div>
            <div className="swap-row"><button className="swap" type="button" onClick={swapCurrencies} aria-label="Swap countries">⇄</button></div>
            <div className="field"><label>Current reference rate</label><input type="text" readOnly value={`1 ${from} = ${rate.toFixed(6)} ${to}`}/></div>
            <div className="note">Reference rates are for estimation only. Bank, card and exchange-house customer rates and fees can differ.</div>
            <div className="status"><span className={`dot${loading ? " loading" : ""}`}></span>{loading ? "Updating exchange rate…" : `Updated: ${updatedAt}`}</div>
          </div>
          <div className="panel result-panel">
            <div className="result-kicker">TRAVEL CONVERSION RESULT</div>
            <div className="result-title">{fromCountry?.flag} {fromCountry?.name} → {toCountry?.flag} {toCountry?.name}</div>
            <div className="big">{result.toLocaleString(undefined,{maximumFractionDigits:2})} {to}</div>
            <div className="result-box"><div className="result-grid"><div><span>Entered amount</span><strong>{Number(amount||0).toLocaleString()} {from}</strong></div><div><span>Exchange rate</span><strong>1 {from} = {rate.toFixed(6)} {to}</strong></div></div></div>
            <div className="note">Source: {source}. This is a reference-rate estimate, not a guaranteed customer rate.</div>
          </div>
        </section>
        <section className="section"><h2>How to use this calculator</h2><p className="intro">Enter your travel amount, choose the source and destination countries, and the latest available reference rate is applied automatically.</p><div className="steps"><div className="step"><b>1</b>Enter your travel amount.</div><div className="step"><b>2</b>Select the source and destination countries.</div><div className="step"><b>3</b>Use ⇄ to swap the countries when needed.</div><div className="step"><b>4</b>Read the automatically updated converted amount.</div></div></section>
        <section className="section"><h2>Frequently Asked Questions</h2>
          <details className="faq"><summary>Are these live bank or exchange-house rates?</summary><p>No. They are automatically updated reference rates. Your bank, card or exchange house may use a different customer rate and fees.</p></details>
          <details className="faq"><summary>How often are the rates updated?</summary><p>The API provider publishes new reference data daily. MYKSA caches the response server-side to reduce unnecessary requests.</p></details>
          <details className="faq"><summary>Does the calculator include fees?</summary><p>No. Card, ATM and exchange fees are not included.</p></details>
        </section>
        <section className="section"><h2>More Saudi Expat Tools</h2><div className="related">{TOOL_LINKS.map(([i,t,h])=><a href={h} key={h}><i>{i}</i>{t}</a>)}</div></section>
      </div>
    </main>
  );
}
