"use client";

import { useMemo, useState } from "react";

export default function SarCurrencyConverter() {
  const [sar, setSar] = useState("");
  const [inrRate, setInrRate] = useState("23");
  const [pkrRate, setPkrRate] = useState("74");
  const value = Number(sar);
  const inr = useMemo(() => (Number.isFinite(value) ? value * Number(inrRate) : 0), [value, inrRate]);
  const pkr = useMemo(() => (Number.isFinite(value) ? value * Number(pkrRate) : 0), [value, pkrRate]);

  return (
    <section style={{ maxWidth: 620, margin: "32px auto", padding: 24, border: "1px solid #d8e1df", borderRadius: 16 }}>
      <h2 style={{ marginTop: 0 }}>SAR Currency Converter</h2>
      <p>Enter an amount and adjust the rates to the current rate offered by your bank or exchange provider.</p>
      <input type="number" min="0" value={sar} onChange={(e) => setSar(e.target.value)} placeholder="Amount in SAR" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccd6d3", marginBottom: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>INR rate<input type="number" step="0.01" value={inrRate} onChange={(e) => setInrRate(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} /></label>
        <label>PKR rate<input type="number" step="0.01" value={pkrRate} onChange={(e) => setPkrRate(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} /></label>
      </div>
      {sar && <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "#eefaf6", lineHeight: 1.8 }}><div><strong>INR:</strong> {inr.toLocaleString()}</div><div><strong>PKR:</strong> {pkr.toLocaleString()}</div><small>Rates are estimates and can change.</small></div>}
    </section>
  );
}
