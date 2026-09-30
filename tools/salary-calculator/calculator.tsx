"use client";

import { useMemo, useState } from "react";

export default function SalaryCalculator() {
  const [monthly, setMonthly] = useState("");
  const yearly = useMemo(() => {
    const value = Number(monthly);
    return Number.isFinite(value) && value > 0 ? value * 12 : 0;
  }, [monthly]);

  return (
    <section style={{ maxWidth: 620, margin: "32px auto", padding: 24, border: "1px solid #d8e1df", borderRadius: 16 }}>
      <h2 style={{ marginTop: 0 }}>Saudi Salary Calculator</h2>
      <p>Enter your monthly salary to calculate the simple annual equivalent.</p>
      <input type="number" min="0" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="Monthly salary (SAR)" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccd6d3" }} />
      {yearly > 0 && <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "#eefaf6" }}><strong>Yearly salary:</strong> SAR {yearly.toLocaleString()}</div>}
    </section>
  );
}
