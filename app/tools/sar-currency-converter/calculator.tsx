"use client";

import { useEffect, useMemo, useState } from "react";

const TOOL_LINKS = [
  ["📅", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["✈️", "Travel Currency Calculator", "/tools/travel-currency-calculator/"],
] as const;

type Country = {
  code: string;
  name: string;
  currency: string;
  currencyName: string;
  flag: string;
};

const COUNTRIES: Country[] = [
  { code: "SA", name: "Saudi Arabia", currency: "SAR", currencyName: "Saudi Riyal", flag: "🇸🇦" },
  { code: "IN", name: "India", currency: "INR", currencyName: "Indian Rupee", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", currency: "PKR", currencyName: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", currency: "BDT", currencyName: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", currency: "LKR", currencyName: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", currencyName: "UAE Dirham", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", currency: "QAR", currencyName: "Qatari Riyal", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", currency: "KWD", currencyName: "Kuwaiti Dinar", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", currency: "BHD", currencyName: "Bahraini Dinar", flag: "🇧🇭" },
  { code: "OM", name: "Oman", currency: "OMR", currencyName: "Omani Rial", flag: "🇴🇲" },
  { code: "US", name: "United States", currency: "USD", currencyName: "US Dollar", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", currencyName: "British Pound", flag: "🇬🇧" },
  { code: "EU", name: "European Union", currency: "EUR", currencyName: "Euro", flag: "🇪🇺" },
  { code: "CA", name: "Canada", currency: "CAD", currencyName: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AU", name: "Australia", currency: "AUD", currencyName: "Australian Dollar", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", currency: "NZD", currencyName: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "JP", name: "Japan", currency: "JPY", currencyName: "Japanese Yen", flag: "🇯🇵" },
  { code: "CN", name: "China", currency: "CNY", currencyName: "Chinese Yuan", flag: "🇨🇳" },
  { code: "MY", name: "Malaysia", currency: "MYR", currencyName: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", currency: "IDR", currencyName: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "TH", name: "Thailand", currency: "THB", currencyName: "Thai Baht", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", currency: "PHP", currencyName: "Philippine Peso", flag: "🇵🇭" },
  { code: "SG", name: "Singapore", currency: "SGD", currencyName: "Singapore Dollar", flag: "🇸🇬" },
  { code: "KR", name: "South Korea", currency: "KRW", currencyName: "South Korean Won", flag: "🇰🇷" },
  { code: "TR", name: "Türkiye", currency: "TRY", currencyName: "Turkish Lira", flag: "🇹🇷" },
  { code: "EG", name: "Egypt", currency: "EGP", currencyName: "Egyptian Pound", flag: "🇪🇬" },
  { code: "JO", name: "Jordan", currency: "JOD", currencyName: "Jordanian Dinar", flag: "🇯🇴" },
  { code: "IQ", name: "Iraq", currency: "IQD", currencyName: "Iraqi Dinar", flag: "🇮🇶" },
  { code: "NP", name: "Nepal", currency: "NPR", currencyName: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "ZA", name: "South Africa", currency: "ZAR", currencyName: "South African Rand", flag: "🇿🇦" },
  { code: "CH", name: "Switzerland", currency: "CHF", currencyName: "Swiss Franc", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", currency: "SEK", currencyName: "Swedish Krona", flag: "🇸🇪" },
  { code: "NO", name: "Norway", currency: "NOK", currencyName: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", currency: "DKK", currencyName: "Danish Krone", flag: "🇩🇰" },
  { code: "RU", name: "Russia", currency: "RUB", currencyName: "Russian Ruble", flag: "🇷🇺" },
  { code: "BR", name: "Brazil", currency: "BRL", currencyName: "Brazilian Real", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", currency: "MXN", currencyName: "Mexican Peso", flag: "🇲🇽" },
];

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
  BHD: 0.10052,
  OMR: 0.10267,
  CAD: 0.3615,
  AUD: 0.384,
  NZD: 0.438,
  MYR: 1.0875,
  IDR: 4180,
  THB: 8.59,
  PHP: 15.2,
  SGD: 0.34,
  KRW: 395,
  TRY: 11.45,
  EGP: 12.75,
  JOD: 0.189,
  IQD: 349,
  NPR: 35.8,
  ZAR: 4.65,
  CHF: 0.225,
  SEK: 2.76,
  NOK: 2.72,
  DKK: 1.75,
  RUB: 20.9,
  BRL: 1.42,
  MXN: 4.8,
};

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "IDR" ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("en-SA", { maximumFractionDigits: 2 })} ${currency}`;
  }
}

function countryLabel(country: Country) {
  return `${country.flag} ${country.name} — ${country.currency}`;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [fromCountry, setFromCountry] = useState("SA");
  const [toCountry, setToCountry] = useState("IN");
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

  const from = COUNTRIES.find((country) => country.code === fromCountry) ?? COUNTRIES[0];
  const to = COUNTRIES.find((country) => country.code === toCountry) ?? COUNTRIES[1];

  const result = useMemo(() => {
    const value = Number(amount) || 0;
    const fromPerSar = rates[from.currency] ?? 0;
    const toPerSar = rates[to.currency] ?? 0;
    if (!fromPerSar || !toPerSar) return { converted: 0, rate: 0 };
    const rate = toPerSar / fromPerSar;
    return { converted: value * rate, rate };
  }, [amount, from.currency, to.currency, rates]);

  const swapCountries = () => {
    setFromCountry(toCountry);
    setToCountry(fromCountry);
  };

  return (
    <main className="sar-page">
      <div className="sar-shell">
        <nav className="sar-crumbs">
          <a href="/">MYKSA CONNECT</a><span>›</span><a href="/tools/">Saudi Expat Tools</a><span>›</span><span>Currency Converter</span>
        </nav>

        <div className="sar-banner">
          <img src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />
        </div>

        <section className="sar-main-card">
          <div className="sar-input-panel">
            <div className="sar-panel-head">
              <div><span className="sar-icon">💱</span><h1>Currency Converter</h1></div>
              <span className="sar-badge">Free Tool</span>
            </div>
            <p className="sar-help">Convert money between countries using automatically updated reference exchange rates.</p>

            <label className="sar-field"><span>Amount</span><input type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>

            <div className="sar-country-row">
              <label className="sar-field"><span>From Country</span><select value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>{COUNTRIES.map((country) => <option key={country.code} value={country.code}>{countryLabel(country)}</option>)}</select></label>
              <button className="sar-swap" type="button" onClick={swapCountries} aria-label="Swap countries" title="Swap countries">⇄</button>
              <label className="sar-field"><span>To Country</span><select value={toCountry} onChange={(e) => setToCountry(e.target.value)}>{COUNTRIES.map((country) => <option key={country.code} value={country.code}>{countryLabel(country)}</option>)}</select></label>
            </div>

            <div className="sar-selection-summary"><span>{from.flag} {from.name}</span><b>→</b><span>{to.flag} {to.name}</span></div>
            <div className="sar-note">ⓘ Reference rates are for information only. Banks, exchange houses and payment providers may apply their own rates and fees.</div>
          </div>

          <div className="sar-result-panel">
            <div className="sar-result-label">CONVERSION RESULT</div>
            <div className="sar-result-title">{to.name} · {to.currencyName}</div>
            <div className="sar-result-main">{money(result.converted, to.currency)}</div>
            <div className="sar-rate-box">
              <div><span>Exchange rate</span><strong>1 {from.currency} = {result.rate ? result.rate.toFixed(6) : "—"} {to.currency}</strong></div>
              <div><span>Entered amount</span><strong>{money(Number(amount) || 0, from.currency)}</strong></div>
            </div>
            <div className="sar-source">Source: {source} · {loading ? "Updating…" : `Updated: ${updatedAt}`}</div>
          </div>
        </section>

        <section className="sar-source-note">Rates are automatically fetched through the MYKSA server from the configured reference-rate API. They are not guaranteed bank, exchange-house or card rates. <a href="https://www.exchangerate-api.com/" target="_blank" rel="noreferrer">Rates by ExchangeRate-API</a>.</section>

        <section className="sar-info-grid">
          <article className="sar-info sar-info-green"><h2>How to use this converter</h2><p>Select the country you are sending money from, select the destination country, enter the amount and read the converted value instantly.</p><div className="sar-steps"><div><b>1</b><span>Enter the amount you want to convert.</span></div><div><b>2</b><span>Choose the From Country.</span></div><div><b>3</b><span>Choose the To Country.</span></div><div><b>4</b><span>Read the converted amount instantly.</span></div></div></article>
          <article className="sar-info sar-info-gold"><h2>Popular conversions</h2><ul><li>Saudi Arabia → India</li><li>Saudi Arabia → Pakistan</li><li>Saudi Arabia → Bangladesh</li><li>Saudi Arabia → UAE</li></ul></article>
        </section>

        <section className="sar-faq"><h2>Frequently Asked Questions</h2><details><summary>Are these live exchange-house rates?</summary><p>No. They are reference rates. Your bank, exchange house or payment provider may use a different customer rate and may add fees.</p></details><details><summary>Can I convert between any two countries?</summary><p>The converter supports the currencies available from the configured reference-rate provider. Countries sharing the same currency use the same currency rate.</p></details><details><summary>Can I swap the From and To countries?</summary><p>Yes. Use the ⇄ button between the two country selectors to swap them instantly.</p></details><details><summary>Can I use this tool on my phone?</summary><p>Yes. The converter is responsive and works on mobile, tablet and desktop browsers.</p></details></section>

        <section className="sar-related"><h2>More Saudi Expat Tools</h2><div className="sar-related-grid">{TOOL_LINKS.map(([icon,title,href]) => <a href={href} key={href}><span>{icon}</span><strong>{title}</strong></a>)}<a href="/tools/"><span>•••</span><strong>More Tools</strong></a></div></section>
      </div>

      <style jsx>{`
        .sar-page{min-height:100vh;background:#fbfaf7;color:#0b1719;padding:0 0 70px}.sar-shell{width:min(1120px,calc(100% - 32px));margin:0 auto}.sar-crumbs{display:flex;gap:8px;align-items:center;padding:18px 0 10px;font-size:12px;color:#667370}.sar-crumbs a{color:#005744;font-weight:800;text-decoration:none}.sar-banner{width:100%;overflow:hidden;border-radius:4px;margin:4px 0 18px}.sar-banner img{display:block;width:100%;height:auto;object-fit:contain}.sar-main-card{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:10px;background:#fff;border:1px solid #dfe7e3;border-radius:16px;box-shadow:0 8px 28px rgba(6,23,42,.08)}.sar-input-panel,.sar-result-panel{border:1px solid #dce8e3;border-radius:13px;padding:24px}.sar-input-panel{background:#f7fcfa}.sar-result-panel{background:#fffaf0;border-color:#ead9a6;display:flex;flex-direction:column;justify-content:center}.sar-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.sar-panel-head>div{display:flex;align-items:center;gap:9px}.sar-panel-head h1{font-size:21px;margin:0;color:#003c31}.sar-icon{font-size:24px;background:#e5f4ef;border-radius:9px;padding:5px}.sar-badge{font-size:10px;color:#6d5500;background:#fff3c8;border:1px solid #efc84e;border-radius:999px;padding:5px 10px;white-space:nowrap}.sar-help{font-size:13px;color:#60706d;line-height:1.55;margin:12px 0 18px}.sar-field{display:block;margin-top:13px;flex:1}.sar-field span{display:block;font-size:12px;font-weight:800;margin-bottom:6px;color:#18312e}.sar-field input,.sar-field select{width:100%;box-sizing:border-box;border:1px solid #c9dcd5;border-radius:9px;padding:12px;background:#fff;color:#0b1719;font-size:14px;outline:none}.sar-field input:focus,.sar-field select:focus{border-color:#005744;box-shadow:0 0 0 3px rgba(0,87,68,.09)}.sar-country-row{display:grid;grid-template-columns:1fr 44px 1fr;gap:8px;align-items:end}.sar-country-row .sar-field{min-width:0}.sar-swap{width:44px;height:44px;border:1px solid #c9dcd5;border-radius:9px;background:#fff;color:#005744;font-size:21px;font-weight:900;cursor:pointer;margin-bottom:0}.sar-swap:hover{background:#eaf5f1}.sar-selection-summary{display:flex;justify-content:center;align-items:center;gap:10px;margin-top:14px;padding:10px;border:1px solid #d9e8e2;border-radius:9px;background:#fff;color:#27423d;font-size:12px;font-weight:800}.sar-selection-summary b{color:#005744}.sar-note{margin-top:12px;background:#eaf5f1;border-radius:9px;padding:11px;font-size:11px;color:#60706d;line-height:1.5}.sar-result-label{text-align:center;font-size:10px;font-weight:900;letter-spacing:1.4px;color:#947100}.sar-result-title{text-align:center;color:#005744;font-weight:800;margin-top:9px}.sar-result-main{text-align:center;font-size:38px;font-weight:900;color:#06172a;margin:10px 0 20px}.sar-rate-box{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e7d9ad;border-radius:10px;overflow:hidden;background:#fff}.sar-rate-box div{padding:14px;text-align:center}.sar-rate-box div+div{border-left:1px solid #e7d9ad}.sar-rate-box span{display:block;font-size:10px;color:#68736f;margin-bottom:6px}.sar-rate-box strong{font-size:14px;color:#003c31}.sar-source{text-align:center;font-size:10px;color:#7b7667;margin-top:12px;line-height:1.45}.sar-info-grid{display:grid;grid-template-columns:1.35fr .9fr;gap:12px;margin-top:14px}.sar-info{border:1px solid #dfe7e3;border-radius:13px;padding:22px;background:#fff}.sar-info-gold{background:#fffaf0;border-color:#ead9a6}.sar-info h2,.sar-faq h2,.sar-related h2{font-size:19px;color:#06172a;margin:0 0 9px}.sar-info p,.sar-info li,.sar-faq p{font-size:12px;line-height:1.65;color:#60706d}.sar-info ul{margin:10px 0 0;padding-left:18px}.sar-steps{display:grid;gap:8px;margin-top:13px}.sar-steps div{display:flex;gap:9px;align-items:center;font-size:12px;color:#334c48}.sar-steps b{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#005744;color:#fff;font-size:11px}.sar-source-note{margin-top:10px;padding:9px 11px;border:1px solid #dfe7e3;border-radius:9px;background:#edf7f3;color:#60706d;font-size:10px;line-height:1.5}.sar-source-note a{color:#005744;font-weight:800;text-decoration:none}.sar-faq,.sar-related{margin-top:14px;background:#fff;border:1px solid #dfe7e3;border-radius:13px;padding:22px}.sar-faq details{border-top:1px solid #e0e7e4;padding:12px 0}.sar-faq summary{cursor:pointer;font-size:12px;font-weight:800;color:#17312e}.sar-faq p{margin:8px 0 0}.sar-related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.sar-related-grid a{display:flex;align-items:center;gap:9px;text-decoration:none;color:#18312e;border:1px solid #dfe7e3;border-radius:9px;padding:11px;background:#fff;font-size:11px}.sar-related-grid span{font-size:18px}.sar-related-grid strong{font-size:11px}@media(max-width:760px){.sar-shell{width:min(100% - 20px,1120px)}.sar-main-card,.sar-info-grid{grid-template-columns:1fr}.sar-country-row{grid-template-columns:1fr}.sar-swap{width:100%;height:38px;order:2}.sar-country-row .sar-field:last-child{order:3}.sar-result-main{font-size:31px}.sar-related-grid{grid-template-columns:1fr 1fr}.sar-banner{border-radius:3px}.sar-panel-head h1{font-size:18px}}
      `}</style>
    </main>
  );
}
