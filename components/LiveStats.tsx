"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LiveStats() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "listings"), where("status", "==", "active"));
        const snap = await getCountFromServer(q);
        setCount(snap.data().count);
      } catch {
        setCount(null);
      }
    })();
  }, []);

  const stats = [
    { label: "Apps Live", value: "5" },
    { label: "Cities Covered", value: "7" },
    { label: "Active Listings", value: count !== null ? `${count}+` : "—" },
  ];

  return (
    <div className="stats-row">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <p className="stat-value">{s.value}</p>
          <p className="stat-label">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
