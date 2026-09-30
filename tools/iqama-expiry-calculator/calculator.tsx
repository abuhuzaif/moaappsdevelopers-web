"use client";

import { useMemo, useState } from "react";

export default function IqamaExpiryCalculator() {
  const [expiry, setExpiry] = useState("");
  const result = useMemo(() => {
    if (!expiry) return null;
    const end = new Date(`${expiry}T23:59:59`);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);
    return { days, expired: days < 0 };
  }, [expiry]);

  return (
    <section style={{ maxWidth: 620, margin: "32px auto", padding: 24, border: "1px solid #d8e1df", borderRadius: 16 }}>
      <h2 style={{ marginTop: 0 }}>Iqama Expiry Calculator</h2>
      <p>Enter the expiry date shown on your official Iqama record.</p>
      <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>Iqama expiry date</label>
      <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccd6d3" }} />
      {result && (
        <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: result.expired ? "#fff1f1" : "#eefaf6" }}>
          {result.expired ? `Iqama expiry date passed ${Math.abs(result.days)} days ago.` : `${result.days} days remaining until the Iqama expiry date.`}
        </div>
      )}
    </section>
  );
}
