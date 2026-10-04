"use client";

import { useMemo, useState } from "react";
import ToolSeoContent from "./ToolSeoContent";

type Kind =
  | "gaz"
  | "sqm"
  | "marla"
  | "acre"
  | "length"
  | "bmi"
  | "age"
  | "percentage"
  | "emi"
  | "vat";

// Maps each calculator kind to its page slug (used to load SEO text from lib/toolSeo.ts).
const KIND_TO_SLUG: Record<Kind, string> = {
  gaz: "gaz-square-meter-converter",
  sqm: "square-feet-square-meter-converter",
  marla: "marla-converter",
  acre: "acre-hectare-square-meter-converter",
  length: "feet-inches-centimeter-converter",
  bmi: "bmi-calculator",
  age: "age-calculator",
  percentage: "percentage-calculator",
  emi: "loan-emi-calculator",
  vat: "saudi-vat-calculator",
};

const today = new Date().toISOString().slice(0, 10);
const n = (v: string) => Number(v) || 0;
const fmt = (v: number, digits = 4) => Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: digits }) : "—";

export default function EssentialCalculator({ kind, title, description }: { kind: Kind; title: string; description: string }) {
  const [value, setValue] = useState("1");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [marlaStandard, setMarlaStandard] = useState("272.25");
  const [unit, setUnit] = useState("acre");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [cm, setCm] = useState("177.8");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [dob, setDob] = useState("1990-01-01");
  const [asOf, setAsOf] = useState(today);
  const [percent, setPercent] = useState("15");
  const [base, setBase] = useState("1000");
  const [part, setPart] = useState("150");
  const [percentMode, setPercentMode] = useState("of");
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("5");
  const [months, setMonths] = useState("60");
  const [vatMode, setVatMode] = useState("exclusive");
  const [vatRate, setVatRate] = useState("15");

  const result = useMemo(() => {
    if (kind === "gaz") {
      const x = n(value);
      return direction === "forward" ? `${fmt(x * 0.83612736)} m²` : `${fmt(x / 0.83612736)} Gaz`;
    }
    if (kind === "sqm") {
      const x = n(value);
      return direction === "forward" ? `${fmt(x * 0.09290304)} m²` : `${fmt(x / 0.09290304)} ft²`;
    }
    if (kind === "marla") {
      const x = n(value), area = n(marlaStandard);
      return direction === "forward" ? `${fmt(x * area)} ft²  •  ${fmt(x * area * 0.09290304)} m²` : `${fmt(x / area)} Marla`;
    }
    if (kind === "acre") {
      const x = n(value);
      const m2 = unit === "acre" ? x * 4046.8564224 : unit === "hectare" ? x * 10000 : x;
      return `${fmt(m2)} m²  •  ${fmt(m2 / 4046.8564224)} acres  •  ${fmt(m2 / 10000)} hectares`;
    }
    if (kind === "length") {
      if (direction === "forward") return `${fmt((n(feet) * 12 + n(inches)) * 2.54)} cm`;
      const totalIn = n(cm) / 2.54;
      const f = Math.floor(totalIn / 12), i = totalIn - f * 12;
      return `${f} ft ${fmt(i, 2)} in`;
    }
    if (kind === "bmi") {
      const bmi = n(weight) / Math.pow(n(height) / 100, 2);
      const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obesity range";
      return `${fmt(bmi, 2)} — ${label}`;
    }
    if (kind === "age") {
      const start = new Date(dob), end = new Date(asOf);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return "Enter a valid date range";
      let years = end.getFullYear() - start.getFullYear();
      let monthsAge = end.getMonth() - start.getMonth();
      let daysAge = end.getDate() - start.getDate();
      if (daysAge < 0) { monthsAge--; const prev = new Date(end.getFullYear(), end.getMonth(), 0).getDate(); daysAge += prev; }
      if (monthsAge < 0) { years--; monthsAge += 12; }
      return `${years} years, ${monthsAge} months, ${daysAge} days`;
    }
    if (kind === "percentage") {
      if (percentMode === "of") return `${fmt(n(percent) * n(base) / 100)} ( ${n(percent)}% of ${fmt(n(base))} )`;
      if (percentMode === "what") return n(base) === 0 ? "—" : `${fmt(n(part) / n(base) * 100, 2)}%`;
      return n(base) === 0 ? "—" : `${fmt((n(part) - n(base)) / n(base) * 100, 2)}%`;
    }
    if (kind === "emi") {
      const P = n(principal), r = n(rate) / 100 / 12, m = n(months);
      const emi = r === 0 ? P / m : P * r * Math.pow(1 + r, m) / (Math.pow(1 + r, m) - 1);
      return `Monthly EMI: SAR ${fmt(emi, 2)}  •  Total: SAR ${fmt(emi * m, 2)}  •  Interest: SAR ${fmt(emi * m - P, 2)}`;
    }
    if (kind === "vat") {
      const x = n(value), r = n(vatRate) / 100;
      if (vatMode === "exclusive") return `Net: SAR ${fmt(x, 2)}  •  VAT: SAR ${fmt(x * r, 2)}  •  Gross: SAR ${fmt(x * (1 + r), 2)}`;
      return `Net: SAR ${fmt(x / (1 + r), 2)}  •  VAT: SAR ${fmt(x - x / (1 + r), 2)}  •  Gross: SAR ${fmt(x, 2)}`;
    }
    return "—";
  }, [kind, value, direction, marlaStandard, unit, feet, inches, cm, weight, height, dob, asOf, percent, base, part, percentMode, principal, rate, months, vatMode, vatRate]);

  const field = (label: string, val: string, set: (v: string) => void, type = "number") => (
    <label className="ec-field"><span>{label}</span><input type={type} value={val} onChange={e => set(e.target.value)} /></label>
  );

  return (
    <main className="ec-page">
      <style>{`.ec-page{min-height:100vh;background:#fbfaf7;color:#0b1719;padding:32px 18px 70px;font-family:Inter,Arial,sans-serif}.ec-shell{width:min(900px,100%);margin:auto}.ec-crumb{font-size:13px;color:#5d6a68;margin-bottom:20px}.ec-crumb a{color:#005744;text-decoration:none;font-weight:800}.ec-card{background:#fff;border:1px solid #dfe7e3;border-radius:22px;box-shadow:0 12px 34px rgba(6,23,42,.07);padding:30px}.ec-card h1{margin:0;color:#06172a;font-size:clamp(28px,5vw,44px);letter-spacing:-1px}.ec-desc{color:#65716f;line-height:1.65;margin:10px 0 26px}.ec-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.ec-field{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:800;color:#263633}.ec-field input,.ec-field select{height:46px;border:1px solid #cbd9d4;border-radius:11px;padding:0 13px;background:#fff;font-size:15px;color:#0b1719}.ec-full{grid-column:1/-1}.ec-switch{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}.ec-switch button{border:1px solid #cbd9d4;background:#fff;color:#005744;border-radius:999px;padding:9px 14px;font-weight:800;cursor:pointer}.ec-switch button.active{background:#005744;color:#fff;border-color:#005744}.ec-result{margin-top:24px;padding:22px;border-radius:16px;background:#f1f8f5;border:1px solid #cde5dc}.ec-result small{display:block;color:#60706d;font-weight:800;margin-bottom:7px}.ec-result strong{font-size:22px;color:#06172a;line-height:1.45}.ec-note{margin-top:18px;color:#65716f;font-size:12px;line-height:1.6}.ec-actions{margin-top:22px}.ec-actions a{color:#005744;font-weight:800;text-decoration:none}@media(max-width:600px){.ec-card{padding:22px}.ec-grid{grid-template-columns:1fr}}`}</style>
      <div className="ec-shell">
        <div className="ec-crumb"><a href="/tools/">MYKSA CONNECT Tools</a> › {title}</div>
        <section className="ec-card">
          <h1>{title}</h1><p className="ec-desc">{description}</p>

          {(kind === "gaz" || kind === "sqm" || kind === "marla" || kind === "length") && <div className="ec-switch">
            <button className={direction === "forward" ? "active" : ""} onClick={() => setDirection("forward")}>{kind === "gaz" ? "Gaz → m²" : kind === "sqm" ? "ft² → m²" : kind === "marla" ? "Marla → Area" : "Feet & Inches → cm"}</button>
            <button className={direction === "reverse" ? "active" : ""} onClick={() => setDirection("reverse")}>{kind === "gaz" ? "m² → Gaz" : kind === "sqm" ? "m² → ft²" : kind === "marla" ? "ft² → Marla" : "cm → Feet & Inches"}</button>
          </div>}

          {kind === "gaz" && field("Amount", value, setValue)}
          {kind === "sqm" && field("Square feet", value, setValue)}
          {kind === "marla" && <div className="ec-grid">{field(direction === "forward" ? "Marla" : "Square feet", value, setValue)}<label className="ec-field"><span>Marla standard</span><select value={marlaStandard} onChange={e=>setMarlaStandard(e.target.value)}><option value="272.25">272.25 ft² (Pakistan standard)</option><option value="225">225 ft² (common local standard)</option></select></label></div>}
          {kind === "acre" && <div className="ec-grid">{field("Amount", value, setValue)}<label className="ec-field"><span>Input unit</span><select value={unit} onChange={e=>setUnit(e.target.value)}><option value="acre">Acre</option><option value="hectare">Hectare</option><option value="sqm">Square meter</option></select></label></div>}
          {kind === "length" && direction === "forward" && <div className="ec-grid">{field("Feet", feet, setFeet)}{field("Inches", inches, setInches)}</div>}
          {kind === "length" && direction === "reverse" && field("Centimeters", cm, setCm)}
          {kind === "bmi" && <div className="ec-grid">{field("Weight (kg)", weight, setWeight)}{field("Height (cm)", height, setHeight)}</div>}
          {kind === "age" && <div className="ec-grid">{field("Date of birth", dob, setDob, "date")}{field("Age on date", asOf, setAsOf, "date")}</div>}
          {kind === "percentage" && <div className="ec-grid"><label className="ec-field ec-full"><span>Calculation</span><select value={percentMode} onChange={e=>setPercentMode(e.target.value)}><option value="of">What is X% of Y?</option><option value="what">X is what % of Y?</option><option value="change">Percentage increase / decrease</option></select></label>{percentMode === "of" && <>{field("Percentage", percent, setPercent)}{field("Base amount", base, setBase)}</>}{percentMode !== "of" && <>{field("New / part value", part, setPart)}{field("Original / whole value", base, setBase)}</>}</div>}
          {kind === "emi" && <div className="ec-grid">{field("Loan amount (SAR)", principal, setPrincipal)}{field("Annual interest rate (%)", rate, setRate)}{field("Loan term (months)", months, setMonths)}</div>}
          {kind === "vat" && <div className="ec-grid"><label className="ec-field"><span>Calculation</span><select value={vatMode} onChange={e=>setVatMode(e.target.value)}><option value="exclusive">Add VAT to net amount</option><option value="inclusive">Extract VAT from VAT-inclusive amount</option></select></label>{field("Amount (SAR)", value, setValue)}{field("VAT rate (%)", vatRate, setVatRate)}</div>}

          <div className="ec-result"><small>RESULT</small><strong>{result}</strong></div>
          {kind === "gaz" && <p className="ec-note">For this converter, 1 Gaz (Gaj) is treated as 1 square yard = 9 square feet = 0.83612736 m².</p>}
          {kind === "marla" && <p className="ec-note">Marla size varies by region. Select the standard that matches your property document or listing.</p>}
          {kind === "vat" && <p className="ec-note">Default VAT rate is 15%. Change the rate if you need a different calculation.</p>}
          {kind === "emi" && <p className="ec-note">EMI uses the standard reducing-balance monthly payment formula. Actual bank charges, insurance and fees may differ.</p>}
          {kind === "bmi" && <p className="ec-note">BMI is a general screening measure and is not a medical diagnosis.</p>}
          <div className="ec-actions"><a href="/tools/">← Back to all Saudi Expat Tools</a></div>
        </section>
        <ToolSeoContent slug={KIND_TO_SLUG[kind]} />
      </div>
    </main>
  );
}
