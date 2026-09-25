 "use client";

import { useMemo, useState } from "react";

type ToolKey =
  | "eosb"
  | "gosi"
  | "overtime"
  | "leave"
  | "settlement"
  | "vat"
  | "fuel";

const GREEN = "#005744";
const DEEP = "#003c31";
const GOLD = "#f6b91f";
const NAVY = "#06172a";
const BG = "#fbfaf7";
const BORDER = "#dfe7e3";
const MUTED = "#5d6a68";

const money = (n: number) =>
  `SAR ${Math.max(0, Number.isFinite(n) ? n : 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function dateDiffDays(a: string, b: string) {
  if (!a || !b) return 0;
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}

function serviceYearsMonthsDays(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (!start || !end || e <= s) return { years: 0, months: 0, days: 0, totalDays: 0 };
  let years = e.getFullYear() - s.getFullYear();
  let anchor = new Date(s);
  anchor.setFullYear(s.getFullYear() + years);
  if (anchor > e) {
    years--;
    anchor = new Date(s);
    anchor.setFullYear(s.getFullYear() + years);
  }
  let months = e.getMonth() - anchor.getMonth();
  if (months < 0) months += 12;
  const monthAnchor = new Date(anchor);
  monthAnchor.setMonth(anchor.getMonth() + months);
  if (monthAnchor > e) {
    months--;
    monthAnchor.setMonth(anchor.getMonth() + months);
  }
  const days = Math.floor((e.getTime() - monthAnchor.getTime()) / 86400000);
  return { years, months, days, totalDays: dateDiffDays(start, end) };
}

function eosbBase(actualWage: number, years: number, months: number, days: number) {
  const service = Math.max(0, years + months / 12 + days / 365);
  const firstFive = Math.min(service, 5) * actualWage * 0.5;
  const afterFive = Math.max(0, service - 5) * actualWage;
  return firstFive + afterFive;
}

function resignationFactor(service: number) {
  if (service < 2) return 0;
  if (service < 5) return 1 / 3;
  if (service < 10) return 2 / 3;
  return 1;
}

function calculateLeaveEntitlement(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (!start || !end || e <= s) return 0;

  const five = new Date(s);
  five.setFullYear(s.getFullYear() + 5);

  if (e <= five) return dateDiffDays(start, end) * (21 / 365);

  const first = dateDiffDays(start, five.toISOString().slice(0, 10)) * (21 / 365);
  const second = dateDiffDays(five.toISOString().slice(0, 10), end) * (30 / 365);
  return first + second;
}

function field(label: string, value: string, setValue: (v: string) => void, type = "number", placeholder = "") {
  return (
    <label className="pt-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} />
    </label>
  );
}

function selectField(label: string, value: string, setValue: (v: string) => void, options: [string, string][]) {
  return (
    <label className="pt-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

const configs: Record<ToolKey, { icon: string; title: string; lead: string }> = {
  eosb: {
    icon: "🧾",
    title: "End of Service Calculator",
    lead: "Estimate Saudi end-of-service benefits from your wage, service period and reason for leaving.",
  },
  gosi: {
    icon: "💰",
    title: "GOSI Calculator",
    lead: "Estimate monthly GOSI employee and employer contributions using the applicable Saudi contribution category.",
  },
  overtime: {
    icon: "⏰",
    title: "Overtime Calculator",
    lead: "Estimate overtime compensation from your basic salary and overtime hours.",
  },
  leave: {
    icon: "🏖️",
    title: "Annual Leave Calculator",
    lead: "Estimate annual leave accrued and remaining based on Saudi minimum leave rules.",
  },
  settlement: {
    icon: "📋",
    title: "Final Settlement Calculator",
    lead: "Build an estimated final settlement from salary due, leave, EOSB, overtime and other amounts.",
  },
  vat: {
    icon: "🧾",
    title: "Saudi VAT Calculator",
    lead: "Add or extract the Saudi standard VAT rate and see the net amount, VAT and total.",
  },
  fuel: {
    icon: "⛽",
    title: "Saudi Fuel Cost Calculator",
    lead: "Estimate trip, weekly and monthly fuel cost using distance, efficiency and fuel price.",
  },
};

export default function ProfessionalTool({ tool }: { tool: ToolKey }) {
  const c = configs[tool];

  // EOSB
  const [wage, setWage] = useState("7000");
  const [serviceY, setServiceY] = useState("5");
  const [serviceM, setServiceM] = useState("0");
  const [serviceD, setServiceD] = useState("0");
  const [eosbReason, setEosbReason] = useState("termination");

  // GOSI
  const [gBasic, setGBasic] = useState("7000");
  const [gHousing, setGHousing] = useState("1500");
  const [gCategory, setGCategory] = useState("saudi-old");

  // OT
  const [otBasic, setOtBasic] = useState("7000");
  const [otHours, setOtHours] = useState("10");
  const [otMonthlyHours, setOtMonthlyHours] = useState("240");

  // Leave
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveUsed, setLeaveUsed] = useState("0");
  const [leaveSalary, setLeaveSalary] = useState("7000");

  // Settlement
  const [settSalary, setSettSalary] = useState("7000");
  const [settSalaryDays, setSettSalaryDays] = useState("0");
  const [settLeaveDays, setSettLeaveDays] = useState("0");
  const [settBasic, setSettBasic] = useState("7000");
  const [settY, setSettY] = useState("5");
  const [settM, setSettM] = useState("0");
  const [settD, setSettD] = useState("0");
  const [settReason, setSettReason] = useState("termination");
  const [settOT, setSettOT] = useState("0");
  const [settOther, setSettOther] = useState("0");
  const [settDeduct, setSettDeduct] = useState("0");

  // VAT
  const [vatAmount, setVatAmount] = useState("10000");
  const [vatMode, setVatMode] = useState("add");

  // Fuel
  const [distance, setDistance] = useState("100");
  const [efficiency, setEfficiency] = useState("12");
  const [fuelPrice, setFuelPrice] = useState("2.18");
  const [tripsWeek, setTripsWeek] = useState("5");

  const result = useMemo(() => {
    if (tool === "eosb") {
      const base = eosbBase(num(wage), num(serviceY), num(serviceM), num(serviceD));
      const service = Math.max(0, num(serviceY) + num(serviceM) / 12 + num(serviceD) / 365);
      const factor = eosbReason === "resignation" ? resignationFactor(service) : 1;
      return { base, factor, total: base * factor };
    }

    if (tool === "gosi") {
      const subject = Math.min(45000, Math.max(0, num(gBasic) + num(gHousing)));
      let employeeRate = 0;
      let employerRate = 0;
      if (gCategory === "saudi-old") {
        employeeRate = 0.0975;
        employerRate = 0.1175;
      } else if (gCategory === "saudi-new-2026") {
        employeeRate = 0.1075;
        employerRate = 0.1275;
      } else {
        employeeRate = 0;
        employerRate = 0.02;
      }
      return {
        subject,
        employee: subject * employeeRate,
        employer: subject * employerRate,
        employeeRate,
        employerRate,
      };
    }

    if (tool === "overtime") {
      const basic = num(otBasic);
      const hours = num(otHours);
      const monthlyHours = Math.max(1, num(otMonthlyHours) || 240);
      const hourly = basic / monthlyHours;
      const otHourly = hourly + basic / monthlyHours * 0.5;
      return { hourly, otHourly, total: otHourly * hours };
    }

    if (tool === "leave") {
      const accrued = calculateLeaveEntitlement(leaveStart, leaveEnd);
      const remaining = Math.max(0, accrued - num(leaveUsed));
      return {
        accrued,
        remaining,
        value: remaining * num(leaveSalary) / 30,
        serviceDays: dateDiffDays(leaveStart, leaveEnd),
      };
    }

    if (tool === "settlement") {
      const service = Math.max(0, num(settY) + num(settM) / 12 + num(settD) / 365);
      const eosbBaseValue = eosbBase(num(settBasic), num(settY), num(settM), num(settD));
      const eosbFactor = settReason === "resignation" ? resignationFactor(service) : 1;
      const eosb = eosbBaseValue * eosbFactor;
      const salaryDue = num(settSalary) / 30 * num(settSalaryDays);
      const leaveValue = num(settSalary) / 30 * num(settLeaveDays);
      const total = salaryDue + leaveValue + eosb + num(settOT) + num(settOther) - num(settDeduct);
      return { salaryDue, leaveValue, eosb, total };
    }

    if (tool === "vat") {
      const amount = Math.max(0, num(vatAmount));
      if (vatMode === "add") {
        const vat = amount * 0.15;
        return { net: amount, vat, total: amount + vat };
      }
      const net = amount / 1.15;
      return { net, vat: amount - net, total: amount };
    }

    const d = Math.max(0, num(distance));
    const e = Math.max(0.01, num(efficiency));
    const p = Math.max(0, num(fuelPrice));
    const liters = d / e;
    const trip = liters * p;
    const weekly = trip * Math.max(0, num(tripsWeek));
    return { liters, trip, weekly, monthly: weekly * 4.345 };
  }, [
    tool, wage, serviceY, serviceM, serviceD, eosbReason,
    gBasic, gHousing, gCategory,
    otBasic, otHours, otMonthlyHours,
    leaveStart, leaveEnd, leaveUsed, leaveSalary,
    settSalary, settSalaryDays, settLeaveDays, settBasic, settY, settM, settD, settReason, settOT, settOther, settDeduct,
    vatAmount, vatMode, distance, efficiency, fuelPrice, tripsWeek
  ]);

  return (
    <main className="pt-page">
      <style jsx global>{`
        .pt-page{min-height:100vh;background:${BG};color:#0b1719;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding-bottom:70px}
        .pt-shell{width:min(1120px,calc(100% - 32px));margin:0 auto}
        .pt-breadcrumb{padding:20px 0 8px;font-size:12px;color:#667370}
        .pt-breadcrumb a{color:${GREEN};font-weight:800;text-decoration:none}
        .pt-hero{text-align:center;padding:30px 10px 30px}
        .pt-kicker{color:${GREEN};font-size:12px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;margin:0 0 9px}
        .pt-hero h1{font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:${NAVY};font-size:clamp(34px,5vw,56px);line-height:1.06;letter-spacing:-1.8px;margin:0 0 12px}
        .pt-lead{max-width:760px;margin:0 auto;color:${MUTED};line-height:1.7;font-size:16px}
        .pt-banner{margin:18px auto 28px;border-radius:18px;overflow:hidden;border:1px solid ${BORDER};background:white;box-shadow:0 10px 30px rgba(6,23,42,.06)}
        .pt-banner img{display:block;width:100%;height:auto;object-fit:contain}
        .pt-card{background:white;border:1px solid ${BORDER};border-radius:20px;padding:26px;box-shadow:0 10px 30px rgba(6,23,42,.06)}
        .pt-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:18px}
        .pt-panel{border:1px solid ${BORDER};border-radius:16px;padding:22px;background:#fff}
        .pt-panel h2{margin:0 0 6px;color:${NAVY};font-size:19px}
        .pt-panel p{margin:0 0 18px;color:${MUTED};font-size:13px;line-height:1.6}
        .pt-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .pt-field{display:block}
        .pt-field span{display:block;font-size:12px;font-weight:800;color:#31403f;margin-bottom:7px}
        .pt-field input,.pt-field select{width:100%;box-sizing:border-box;border:1px solid #cfdcd7;border-radius:11px;padding:12px 13px;background:#fff;color:#102123;font:inherit;outline:none}
        .pt-field input:focus,.pt-field select:focus{border-color:${GREEN};box-shadow:0 0 0 3px rgba(0,87,68,.09)}
        .pt-button{width:100%;border:0;border-radius:12px;background:${GREEN};color:#fff;padding:13px 16px;font-weight:900;font-size:14px;margin-top:16px;cursor:pointer}
        .pt-result{background:linear-gradient(145deg,${NAVY},${DEEP});color:#fff;border-radius:16px;padding:24px;min-height:260px}
        .pt-result-kicker{font-size:11px;letter-spacing:1.1px;font-weight:900;color:${GOLD};text-transform:uppercase}
        .pt-result-total{font-size:clamp(30px,5vw,46px);font-weight:900;margin:7px 0 18px;letter-spacing:-1.2px}
        .pt-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
        .pt-stat{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:13px}
        .pt-stat span{display:block;color:#b9c7c4;font-size:11px;margin-bottom:5px}.pt-stat strong{font-size:16px}
        .pt-note{margin-top:14px;padding:12px 14px;border-radius:11px;background:#eef7f3;color:#36504b;font-size:12px;line-height:1.6}
        .pt-section{margin-top:28px;background:#fff;border:1px solid ${BORDER};border-radius:18px;padding:24px}
        .pt-section h2{margin:0 0 10px;color:${NAVY};font-size:24px}
        .pt-section p,.pt-section li{color:#52615f;line-height:1.75;font-size:14px}
        .pt-related{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:15px}
        .pt-related a{display:block;text-decoration:none;color:#102123;border:1px solid ${BORDER};border-radius:12px;padding:14px;background:#fff;font-weight:800;font-size:13px}
        .pt-related a span{display:block;font-size:22px;margin-bottom:8px}
        .pt-source{font-size:12px;color:#667370;margin-top:16px}
        .pt-source a{color:${GREEN};font-weight:800}
        @media(max-width:820px){.pt-grid{grid-template-columns:1fr}.pt-related{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.pt-shell{width:min(100% - 20px,1120px)}.pt-card{padding:12px}.pt-panel{padding:18px}.pt-fields{grid-template-columns:1fr}.pt-stats{grid-template-columns:1fr}.pt-related{grid-template-columns:1fr 1fr}.pt-hero{padding:24px 4px}}
      `}</style>

      <div className="pt-shell">
        <div className="pt-breadcrumb">
          <a href="/">MYKSA CONNECT</a> &nbsp;›&nbsp; <a href="/tools/">Saudi Expat Tools</a> &nbsp;›&nbsp; {c.title}
        </div>

        <section className="pt-hero">
          <p className="pt-kicker">🇸🇦 Professional Saudi Tool</p>
          <h1>{c.icon} {c.title}</h1>
          <p className="pt-lead">{c.lead} Free, fast and designed for Saudi residents and businesses.</p>
        </section>

        <div className="pt-banner">
          <img src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" />
        </div>

        <section className="pt-card">
          <div className="pt-grid">
            <div className="pt-panel">
              {tool === "eosb" && <>
                <h2>Enter employment details</h2><p>Use the wage and service period relevant to your employment record.</p>
                <div className="pt-fields">
                  {field("Actual / last wage (SAR)", wage, setWage)}
                  {field("Service years", serviceY, setServiceY)}
                  {field("Service months", serviceM, setServiceM)}
                  {field("Service days", serviceD, setServiceD)}
                  {selectField("Reason for leaving", eosbReason, setEosbReason, [["termination","Termination / employer ending"],["resignation","Resignation"],["expiry","Contract expiry / other"]])}
                </div>
                <button className="pt-button" type="button">Calculate EOSB</button>
              </>}

              {tool === "gosi" && <>
                <h2>Enter salary details</h2><p>Contributory wage is estimated from basic salary plus housing allowance, subject to the calculator's stated cap.</p>
                <div className="pt-fields">
                  {field("Basic salary (SAR)", gBasic, setGBasic)}
                  {field("Housing allowance (SAR)", gHousing, setGHousing)}
                  {selectField("Coverage / registration category", gCategory, setGCategory, [
                    ["saudi-old","Saudi — existing/old system"],
                    ["saudi-new-2026","Saudi — new system, 2026 rate"],
                    ["non-saudi","Non-Saudi — occupational hazards"],
                  ])}
                </div>
              </>}

              {tool === "overtime" && <>
                <h2>Enter overtime details</h2><p>The calculator uses the Saudi Labour Law overtime structure and defaults to 240 monthly hours.</p>
                <div className="pt-fields">
                  {field("Basic salary (SAR)", otBasic, setOtBasic)}
                  {field("Overtime hours", otHours, setOtHours)}
                  {field("Monthly working hours", otMonthlyHours, setOtMonthlyHours)}
                </div>
              </>}

              {tool === "leave" && <>
                <h2>Enter service details</h2><p>Calculate minimum annual leave accrued between two dates. You can subtract leave already taken.</p>
                <div className="pt-fields">
                  {field("Service start date", leaveStart, setLeaveStart, "date")}
                  {field("Service end / as-of date", leaveEnd, setLeaveEnd, "date")}
                  {field("Leave already used (days)", leaveUsed, setLeaveUsed)}
                  {field("Monthly salary (SAR)", leaveSalary, setLeaveSalary)}
                </div>
              </>}

              {tool === "settlement" && <>
                <h2>Enter final settlement details</h2><p>This is a planning estimate. Add only amounts that are actually due under your contract and employment record.</p>
                <div className="pt-fields">
                  {field("Monthly salary (SAR)", settSalary, setSettSalary)}
                  {field("Salary days due", settSalaryDays, setSettSalaryDays)}
                  {field("Unused leave days", settLeaveDays, setSettLeaveDays)}
                  {field("Basic salary for EOSB (SAR)", settBasic, setSettBasic)}
                  {field("Service years", settY, setSettY)}
                  {field("Service months", settM, setSettM)}
                  {field("Service days", settD, setSettD)}
                  {selectField("Reason for leaving", settReason, setSettReason, [["termination","Termination / employer ending"],["resignation","Resignation"],["expiry","Contract expiry / other"]])}
                  {field("Overtime due (SAR)", settOT, setSettOT)}
                  {field("Other dues (SAR)", settOther, setSettOther)}
                  {field("Deductions (SAR)", settDeduct, setSettDeduct)}
                </div>
              </>}

              {tool === "vat" && <>
                <h2>Choose VAT calculation</h2><p>Saudi Arabia's standard VAT rate is 15% where applicable.</p>
                <div className="pt-fields">
                  {field(vatMode === "add" ? "Amount before VAT (SAR)" : "Amount including VAT (SAR)", vatAmount, setVatAmount)}
                  {selectField("Calculation", vatMode, setVatMode, [["add","Add 15% VAT"],["extract","Extract VAT from total"]])}
                </div>
              </>}

              {tool === "fuel" && <>
                <h2>Enter trip details</h2><p>For September 2026, Aramco lists gasoline 91 at SAR 2.18/litre. You can edit the fuel price for your actual station/date.</p>
                <div className="pt-fields">
                  {field("Distance per trip (km)", distance, setDistance)}
                  {field("Vehicle efficiency (km/L)", efficiency, setEfficiency)}
                  {field("Fuel price (SAR/L)", fuelPrice, setFuelPrice)}
                  {field("Trips per week", tripsWeek, setTripsWeek)}
                </div>
              </>}
            </div>

            <div className="pt-result">
              <div className="pt-result-kicker">{c.title}</div>

              {tool === "eosb" && <>
                <div className="pt-result-total">{money((result as any).total)}</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Full benefit before factor</span><strong>{money((result as any).base)}</strong></div>
                  <div className="pt-stat"><span>Applicable factor</span><strong>{((result as any).factor * 100).toFixed(2)}%</strong></div>
                </div>
              </>}

              {tool === "gosi" && <>
                <div className="pt-result-total">{money((result as any).employee)}</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Employee monthly contribution</span><strong>{money((result as any).employee)}</strong></div>
                  <div className="pt-stat"><span>Employer monthly contribution</span><strong>{money((result as any).employer)}</strong></div>
                  <div className="pt-stat"><span>Subject wage</span><strong>{money((result as any).subject)}</strong></div>
                  <div className="pt-stat"><span>Employee / employer rates</span><strong>{((result as any).employeeRate*100).toFixed(2)}% / {((result as any).employerRate*100).toFixed(2)}%</strong></div>
                </div>
              </>}

              {tool === "overtime" && <>
                <div className="pt-result-total">{money((result as any).total)}</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Normal hourly rate</span><strong>{money((result as any).hourly)}</strong></div>
                  <div className="pt-stat"><span>Estimated OT hourly rate</span><strong>{money((result as any).otHourly)}</strong></div>
                </div>
              </>}

              {tool === "leave" && <>
                <div className="pt-result-total">{(result as any).remaining.toFixed(2)} days</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Accrued leave</span><strong>{(result as any).accrued.toFixed(2)} days</strong></div>
                  <div className="pt-stat"><span>Leave already used</span><strong>{num(leaveUsed).toFixed(2)} days</strong></div>
                  <div className="pt-stat"><span>Estimated value remaining</span><strong>{money((result as any).value)}</strong></div>
                  <div className="pt-stat"><span>Service period</span><strong>{(result as any).serviceDays} days</strong></div>
                </div>
              </>}

              {tool === "settlement" && <>
                <div className="pt-result-total">{money((result as any).total)}</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Salary due</span><strong>{money((result as any).salaryDue)}</strong></div>
                  <div className="pt-stat"><span>Unused leave</span><strong>{money((result as any).leaveValue)}</strong></div>
                  <div className="pt-stat"><span>EOSB</span><strong>{money((result as any).eosb)}</strong></div>
                  <div className="pt-stat"><span>OT + other − deductions</span><strong>{money(num(settOT)+num(settOther)-num(settDeduct))}</strong></div>
                </div>
              </>}

              {tool === "vat" && <>
                <div className="pt-result-total">{money((result as any).total)}</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Net amount</span><strong>{money((result as any).net)}</strong></div>
                  <div className="pt-stat"><span>VAT (15%)</span><strong>{money((result as any).vat)}</strong></div>
                  <div className="pt-stat"><span>Total</span><strong>{money((result as any).total)}</strong></div>
                </div>
              </>}

              {tool === "fuel" && <>
                <div className="pt-result-total">{money((result as any).trip)}</div>
                <div className="pt-stats">
                  <div className="pt-stat"><span>Fuel per trip</span><strong>{(result as any).liters.toFixed(2)} L</strong></div>
                  <div className="pt-stat"><span>Weekly estimate</span><strong>{money((result as any).weekly)}</strong></div>
                  <div className="pt-stat"><span>Monthly estimate</span><strong>{money((result as any).monthly)}</strong></div>
                </div>
              </>}

              <div className="pt-note">Reference calculator only. Employment, insurance and tax outcomes can depend on your contract, registration status, exceptions and current regulations. Verify official figures where required.</div>
            </div>
          </div>
        </section>

        <section className="pt-section">
          <h2>How to use this calculator</h2>
          <p>Enter the requested information, review the breakdown, and use the result as a planning estimate. For official legal, insurance or tax status, check the relevant Saudi government service.</p>
        </section>

        <section className="pt-section">
          <h2>More Professional Saudi Tools</h2>
          <div className="pt-related">
            <a href="/tools/end-of-service-calculator/"><span>🧾</span>End of Service</a>
            <a href="/tools/gosi-calculator/"><span>💰</span>GOSI</a>
            <a href="/tools/overtime-calculator/"><span>⏰</span>Overtime</a>
            <a href="/tools/annual-leave-calculator/"><span>🏖️</span>Annual Leave</a>
            <a href="/tools/final-settlement-calculator/"><span>📋</span>Final Settlement</a>
            <a href="/tools/vat-calculator/"><span>🧾</span>VAT</a>
            <a href="/tools/fuel-cost-calculator/"><span>⛽</span>Fuel Cost</a>
          </div>
        </section>
      </div>
    </main>
  );
}
