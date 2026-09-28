"use client";

import { useMemo, useState } from "react";

const RATES: Record<string, { name: string; perSar: number; sarPerUnit: number }> = {
  USD: { name: "US Dollar", perSar: 0.2666666667, sarPerUnit: 3.75 },
  EUR: { name: "Euro", perSar: 0.234453, sarPerUnit: 4.26525 },
  GBP: { name: "British Pound", perSar: 0.201729, sarPerUnit: 4.95712 },
  INR: { name: "Indian Rupee", perSar: 25.5951, sarPerUnit: 0.03907 },
  PKR: { name: "Pakistani Rupee", perSar: 73.910, sarPerUnit: 0.01353 },
  AED: { name: "UAE Dirham", perSar: 0.979432, sarPerUnit: 1.021 },
  QAR: { name: "Qatari Riyal", perSar: 0.970936, sarPerUnit: 1.02993 },
  KWD: { name: "Kuwaiti Dinar", perSar: 0.082427, sarPerUnit: 12.13199 },
  BDT: { name: "Bangladeshi Taka", perSar: 32.8198, sarPerUnit: 0.03047 },
  LKR: { name: "Sri Lankan Rupee", perSar: 88.1834, sarPerUnit: 0.01134 },
  CNY: { name: "Chinese Yuan", perSar: 1.79012, sarPerUnit: 0.55862 },
  JPY: { name: "Japanese Yen", perSar: 42.3900, sarPerUnit: 0.02359 },
};

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🧮", "Zakat Calculator", "/tools/zakat-calculator/"],
] as const;

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

export default function SarCurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [currency, setCurrency] = useState("INR");
  const [direction, setDirection] = useState<"sar-to" | "to-sar">("sar-to");

  const result = useMemo(() => {
    const value = Number(amount) || 0;
    const rate = RATES[currency];
    if (!rate) return { converted: 0, rate: 0 };
    if (direction === "sar-to") {
      return { converted: value * rate.perSar, rate: rate.perSar };
    }
    return { converted: value * rate.sarPerUnit, rate: rate.sarPerUnit };
  }, [amount, currency, direction]);

  const selected = RATES[currency];

  return (
    <main className="sar-page">
      <div className="sar-shell">
        <nav className="sar-crumbs">
          <a href="/">MYKSA CONNECT</a><span>›</span><a href="/tools/">Saudi Expat Tools</a><span>›</span><span>SAR Currency Converter</span>
        </nav>

        <div className="sar-banner">
          <img src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />
        </div>

        <section className="sar-main-card">
          <div className="sar-input-panel">
            <div className="sar-panel-head">
              <div><span className="sar-icon">💱</span><h1>SAR Currency Converter</h1></div>
              <span className="sar-badge">Free Tool</span>
            </div>
            <p className="sar-help">Convert Saudi Riyals to popular currencies, or convert a foreign currency back to SAR.</p>

            <div className="sar-direction">
              <button className={direction === "sar-to" ? "active" : ""} onClick={() => setDirection("sar-to")} type="button">SAR → {currency}</button>
              <button className={direction === "to-sar" ? "active" : ""} onClick={() => setDirection("to-sar")} type="button">{currency} → SAR</button>
            </div>

            <label className="sar-field"><span>Amount</span><input type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>

            <label className="sar-field"><span>Currency</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {Object.entries(RATES).map(([code, item]) => <option key={code} value={code}>{code} — {item.name}</option>)}
              </select>
            </label>

            <div className="sar-note">ⓘ Reference rates are for information only. Banks, exchange houses and payment providers may apply their own rates and fees.</div>
          </div>

          <div className="sar-result-panel">
            <div className="sar-result-label">CONVERSION RESULT</div>
            <div className="sar-result-title">{direction === "sar-to" ? "Saudi Riyal" : selected.name}</div>
            <div className="sar-result-main">{money(result.converted, direction === "sar-to" ? currency : "SAR")}</div>
            <div className="sar-rate-box">
              <div><span>Exchange rate</span><strong>1 {direction === "sar-to" ? "SAR" : currency} = {direction === "sar-to" ? result.rate.toFixed(6) + " " + currency : result.rate.toFixed(4) + " SAR"}</strong></div>
              <div><span>Entered amount</span><strong>{direction === "sar-to" ? money(Number(amount) || 0, "SAR") : money(Number(amount) || 0, currency)}</strong></div>
            </div>
            <div className="sar-source">Reference date: 25 September 2026 · Saudi Central Bank published rates.</div>
          </div>
        </section>

        <section className="sar-info-grid">
          <article className="sar-info sar-info-green"><h2>How to use this converter</h2><p>Choose the conversion direction, enter an amount and select your currency.</p><div className="sar-steps"><div><b>1</b><span>Choose SAR or foreign currency.</span></div><div><b>2</b><span>Enter the amount you want to convert.</span></div><div><b>3</b><span>Read the converted amount instantly.</span></div></div></article>
          <article className="sar-info sar-info-gold"><h2>Popular SAR conversions</h2><ul><li>Saudi Riyal to Indian Rupee</li><li>Saudi Riyal to Pakistani Rupee</li><li>Saudi Riyal to US Dollar</li><li>Saudi Riyal to UAE Dirham</li></ul></article>
        </section>

        <section className="sar-faq"><h2>Frequently Asked Questions</h2><details><summary>Are these live exchange-house rates?</summary><p>No. They are reference rates. Your bank, exchange house or payment provider may use a different customer rate and may add fees.</p></details><details><summary>Why is USD fixed at 3.75 SAR?</summary><p>The Saudi Riyal is maintained at a fixed rate of 3.75 SAR per US dollar; other currencies move relative to the US dollar.</p></details><details><summary>Can I use this tool on my phone?</summary><p>Yes. The converter is responsive and works on mobile, tablet and desktop browsers.</p></details></section>

        <section className="sar-related"><h2>More Saudi Expat Tools</h2><div className="sar-related-grid">{TOOL_LINKS.map(([icon,title,href]) => <a href={href} key={href}><span>{icon}</span><strong>{title}</strong></a>)}<a href="/tools/"><span>•••</span><strong>More Tools</strong></a></div></section>
      </div>

      <style jsx>{`
        .sar-page{min-height:100vh;background:#fbfaf7;color:#0b1719;padding:0 0 70px}
        .sar-shell{width:min(1120px,calc(100% - 32px));margin:0 auto}
        .sar-crumbs{display:flex;gap:8px;align-items:center;padding:18px 0 10px;font-size:12px;color:#667370}.sar-crumbs a{color:#005744;font-weight:800;text-decoration:none}
        .sar-banner{width:100%;overflow:hidden;border-radius:4px;margin:4px 0 18px}.sar-banner img{display:block;width:100%;height:auto;object-fit:contain}
        .sar-main-card{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px;background:#fff;border:1px solid #dfe7e3;border-radius:16px;box-shadow:0 8px 28px rgba(6,23,42,.08)}
        .sar-input-panel,.sar-result-panel{border:1px solid #dce8e3;border-radius:13px;padding:24px}.sar-input-panel{background:#f7fcfa}.sar-result-panel{background:#fffaf0;border-color:#ead9a6;display:flex;flex-direction:column;justify-content:center}
        .sar-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.sar-panel-head>div{display:flex;align-items:center;gap:9px}.sar-panel-head h1{font-size:21px;margin:0;color:#003c31}.sar-icon{font-size:24px;background:#e5f4ef;border-radius:9px;padding:5px}.sar-badge{font-size:10px;color:#6d5500;background:#fff3c8;border:1px solid #efc84e;border-radius:999px;padding:5px 10px;white-space:nowrap}.sar-help{font-size:13px;color:#60706d;line-height:1.55;margin:12px 0 18px}
        .sar-direction{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}.sar-direction button{border:1px solid #cbded7;background:#fff;color:#005744;border-radius:9px;padding:10px;font-weight:800;cursor:pointer}.sar-direction button.active{background:#005744;color:#fff;border-color:#005744}
        .sar-field{display:block;margin-top:13px}.sar-field span{display:block;font-size:12px;font-weight:800;margin-bottom:6px;color:#18312e}.sar-field input,.sar-field select{width:100%;box-sizing:border-box;border:1px solid #c9dcd5;border-radius:9px;padding:12px;background:#fff;color:#0b1719;font-size:14px;outline:none}.sar-field input:focus,.sar-field select:focus{border-color:#005744;box-shadow:0 0 0 3px rgba(0,87,68,.09)}
        .sar-note{margin-top:16px;background:#eaf5f1;border-radius:9px;padding:11px;font-size:11px;color:#60706d;line-height:1.5}.sar-result-label{text-align:center;font-size:10px;font-weight:900;letter-spacing:1.4px;color:#947100}.sar-result-title{text-align:center;color:#005744;font-weight:800;margin-top:9px}.sar-result-main{text-align:center;font-size:38px;font-weight:900;color:#06172a;margin:10px 0 20px}.sar-rate-box{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e7d9ad;border-radius:10px;overflow:hidden;background:#fff}.sar-rate-box div{padding:14px;text-align:center}.sar-rate-box div+div{border-left:1px solid #e7d9ad}.sar-rate-box span{display:block;font-size:10px;color:#68736f;margin-bottom:6px}.sar-rate-box strong{font-size:14px;color:#003c31}.sar-source{text-align:center;font-size:10px;color:#7b7667;margin-top:12px;line-height:1.45}
        .sar-info-grid{display:grid;grid-template-columns:1.35fr .9fr;gap:12px;margin-top:14px}.sar-info{border:1px solid #dfe7e3;border-radius:13px;padding:22px;background:#fff}.sar-info-gold{background:#fffaf0;border-color:#ead9a6}.sar-info h2,.sar-faq h2,.sar-related h2{font-size:19px;color:#06172a;margin:0 0 9px}.sar-info p,.sar-info li,.sar-faq p{font-size:12px;line-height:1.65;color:#60706d}.sar-info ul{margin:10px 0 0;padding-left:18px}.sar-steps{display:grid;gap:8px;margin-top:13px}.sar-steps div{display:flex;gap:9px;align-items:center;font-size:12px;color:#334c48}.sar-steps b{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#005744;color:#fff;font-size:11px}
        .sar-faq,.sar-related{margin-top:14px;background:#fff;border:1px solid #dfe7e3;border-radius:13px;padding:22px}.sar-faq details{border-top:1px solid #e0e7e4;padding:12px 0}.sar-faq summary{cursor:pointer;font-size:12px;font-weight:800;color:#17312e}.sar-faq p{margin:8px 0 0}.sar-related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.sar-related-grid a{display:flex;align-items:center;gap:9px;text-decoration:none;color:#18312e;border:1px solid #dfe7e3;border-radius:9px;padding:11px;background:#fff;font-size:11px}.sar-related-grid span{font-size:18px}.sar-related-grid strong{font-size:11px}
        @media(max-width:760px){.sar-shell{width:min(100% - 20px,1120px)}.sar-main-card,.sar-info-grid{grid-template-columns:1fr}.sar-result-main{font-size:31px}.sar-related-grid{grid-template-columns:1fr 1fr}.sar-banner{border-radius:3px}.sar-panel-head h1{font-size:18px}}
      `}</style>
    </main>
  );
}
