"use client";

import { useMemo, useState } from "react";

export default function HijriGregorianConverter() {
  const [date, setDate] = useState("");
  const hijri = useMemo(() => {
    if (!date) return "";
    const value = new Date(`${date}T12:00:00`);
    return new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(value);
  }, [date]);

  return (
    <section style={{ maxWidth: 620, margin: "32px auto", padding: 24, border: "1px solid #d8e1df", borderRadius: 16 }}>
      <h2 style={{ marginTop: 0 }}>Hijri / Gregorian Converter</h2>
      <p>Select a Gregorian date to see its Hijri equivalent.</p>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccd6d3" }} />
      {hijri && <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "#eefaf6", fontWeight: 700 }}>{hijri}</div>}
    </section>
  );
}
