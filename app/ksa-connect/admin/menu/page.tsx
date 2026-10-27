"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";

/**
 * Admin → Menu editor (prices, calories, sold out).
 * Pick a restaurant, change prices / calories / names, mark dishes sold out,
 * then "Save changes". Live menu updates within ~5 minutes.
 */

type Price = { amount: number | ""; label?: string; cal?: number | "" };
type Item = {
  id: string;
  categoryId: string;
  sort: number;
  name: string;
  nameAr?: string;
  prices: Price[];
  isAvailable: boolean;
};
type Cat = { id: string; name: string; sort: number };
type R = { id: string; name: string; slug: string };

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

export default function MenuEditorPage() {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [restaurants, setRestaurants] = useState<R[]>([]);
  const [rid, setRid] = useState("");
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  // WhatsApp ordering options for the selected restaurant
  type OType = "dinein" | "takeaway" | "delivery";
  const [ordEnabled, setOrdEnabled] = useState(false);
  const [ordTypes, setOrdTypes] = useState<OType[]>([]);
  const [ordSaving, setOrdSaving] = useState(false);
  const [ordMsg, setOrdMsg] = useState("");

  useEffect(() => {
    if (!admin) return;
    getDocs(collection(db, "restaurants")).then((snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, name: String(d.get("name") ?? d.id), slug: String(d.get("slug") ?? d.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setRestaurants(rows);
      if (rows.length) setRid(rows[0].id);
    });
  }, [admin]);

  useEffect(() => {
    if (!rid) return;
    setLoading(true);
    setMsg("");
    setDirty(new Set());
    (async () => {
      try {
        const rDoc = await getDoc(doc(db, "restaurants", rid));
        const ord = rDoc.get("ordering") as { enabled?: boolean; types?: OType[] } | undefined;
        setOrdEnabled(!!ord?.enabled);
        setOrdTypes(Array.isArray(ord?.types) && ord!.types!.length ? ord!.types! : ["dinein", "takeaway"]);
        setOrdMsg("");
        const rawCats = (rDoc?.get("menuCategories") as unknown[]) ?? [];
        const c: Cat[] = Array.isArray(rawCats)
          ? rawCats
              .map((x: any, i: number) => ({ id: String(x?.id ?? ""), name: String(x?.name ?? ""), sort: num(x?.sort) ?? i * 10 }))
              .filter((x) => x.id)
              .sort((a, b) => a.sort - b.sort)
          : [];
        const snap = await getDocs(collection(db, "restaurants", rid, "menuItems"));
        const it: Item[] = snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            categoryId: String(x.categoryId ?? ""),
            sort: num(x.sort) ?? 0,
            name: String(x.name ?? d.id),
            nameAr: x.nameAr ?? undefined,
            prices: Array.isArray(x.prices)
              ? x.prices.map((p: any) => ({ amount: num(p?.amount) ?? "", label: p?.label ?? undefined, cal: num(p?.cal) ?? "" }))
              : [],
            isAvailable: x.isAvailable !== false,
          };
        });
        setCats(c);
        setItems(it);
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Could not load the menu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [rid]);

  const change = (id: string, fn: (it: Item) => Item) => {
    setItems((all) => all.map((it) => (it.id === id ? fn(it) : it)));
    setDirty((d) => new Set(d).add(id));
    setMsg("");
  };

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const shown = items.filter((it) => !term || it.name.toLowerCase().includes(term) || (it.nameAr ?? "").includes(term));
    const known = new Set(cats.map((c) => c.id));
    const out = cats
      .map((c) => ({ cat: c, items: shown.filter((it) => it.categoryId === c.id).sort((a, b) => a.sort - b.sort) }))
      .filter((g) => g.items.length);
    const orphans = shown.filter((it) => !known.has(it.categoryId));
    if (orphans.length) out.push({ cat: { id: "other", name: "Other", sort: 99999 }, items: orphans });
    return out;
  }, [items, cats, q]);

  async function saveOrdering(enabled: boolean, types: OType[]) {
    if (enabled && !types.length) return setOrdMsg("Pick at least one order type.");
    setOrdSaving(true);
    setOrdMsg("");
    try {
      await updateDoc(doc(db, "restaurants", rid), { ordering: { enabled, types } });
      setOrdEnabled(enabled);
      setOrdTypes(types);
      setOrdMsg("✅ Saved — live menu updates within ~5 minutes.");
    } catch (e) {
      setOrdMsg(e instanceof Error ? `Save failed: ${e.message}` : "Save failed.");
    } finally {
      setOrdSaving(false);
    }
  }

  async function save() {
    if (!dirty.size) return;
    // validate
    for (const id of dirty) {
      const it = items.find((x) => x.id === id)!;
      if (!it.name.trim()) return setMsg("A dish name can't be empty.");
      if (it.prices.some((p) => p.amount === "" || Number(p.amount) < 0)) return setMsg(`Check the price of "${it.name}".`);
    }
    setSaving(true);
    setMsg("");
    try {
      const ids = Array.from(dirty);
      for (let i = 0; i < ids.length; i += 400) {
        const batch = writeBatch(db);
        for (const id of ids.slice(i, i + 400)) {
          const it = items.find((x) => x.id === id)!;
          batch.update(doc(db, "restaurants", rid, "menuItems", id), {
            name: it.name.trim(),
            prices: it.prices.map((p) => ({
              amount: Number(p.amount),
              ...(p.label ? { label: p.label } : {}),
              ...(p.cal !== "" && p.cal !== undefined ? { cal: Number(p.cal) } : {}),
            })),
            isAvailable: it.isAvailable,
          });
        }
        await batch.commit();
      }
      setDirty(new Set());
      setMsg(`✅ Saved ${ids.length} dish${ids.length === 1 ? "" : "es"}. The live menu updates within ~5 minutes.`);
    } catch (e) {
      setMsg(e instanceof Error ? `Save failed: ${e.message}` : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}><h1>Menu editor</h1><p>Please sign in as admin.</p></main>;
  if (!admin) return <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}><h1>Menu editor</h1><p>Admins only.</p></main>;

  const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd8d3", fontSize: 14 } as const;
  const restaurant = restaurants.find((r) => r.id === rid);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 14px 120px", color: "#0c1730" }}>
      <a href="/ksa-connect/admin/qr" style={{ color: "#005744", fontWeight: 700, fontSize: 14 }}>← Restaurant QR</a>
      <h1 style={{ margin: "8px 0 4px" }}>Menu editor</h1>
      <p style={{ marginTop: 0, color: "#52615e" }}>Change prices, calories and names, or mark a dish as sold out. Then press <b>Save changes</b>.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <select value={rid} onChange={(e) => { if (!dirty.size || confirm("Discard unsaved changes?")) setRid(e.target.value); }} style={{ ...input, minWidth: 220 }}>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dish…" style={{ ...input, flex: 1, minWidth: 180 }} />
        {restaurant && <a href={`/${restaurant.slug}`} target="_blank" rel="noreferrer" style={{ color: "#005744", fontWeight: 700 }}>View live menu ↗</a>}
      </div>

      {rid && !loading && (
        <div style={{ marginBottom: 16, padding: 14, borderRadius: 14, border: "1px solid #d9e6e0", background: "#f7faf8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <strong>🛒 WhatsApp ordering</strong>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={ordEnabled}
                disabled={ordSaving}
                onChange={(e) => saveOrdering(e.target.checked, ordTypes)}
                style={{ width: "auto", padding: 0, border: 0 }}
              />
              {ordEnabled ? "On" : "Off"}
            </label>
          </div>
          {ordEnabled && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              {([
                ["dinein", "🍽️ Dine-in"],
                ["takeaway", "🥡 Takeaway"],
                ["delivery", "🛵 Delivery"],
              ] as [OType, string][]).map(([t, label]) => {
                const on = ordTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={ordSaving}
                    onClick={() => {
                      const order: OType[] = ["dinein", "takeaway", "delivery"];
                      const next = on ? ordTypes.filter((x) => x !== t) : order.filter((x) => x === t || ordTypes.includes(x));
                      saveOrdering(true, next);
                    }}
                    style={{
                      padding: "8px 14px", borderRadius: 999, fontWeight: 800, cursor: "pointer",
                      border: on ? "2px solid #005744" : "1px solid #cbd8d3",
                      background: on ? "#005744" : "#fff", color: on ? "#fff" : "#31403d",
                    }}
                  >
                    {on ? "✓ " : ""}{label}
                  </button>
                );
              })}
            </div>
          )}
          {ordMsg && <p style={{ margin: "8px 0 0", fontSize: 13, color: ordMsg.startsWith("✅") ? "#005744" : "#9a4d00" }}>{ordMsg}</p>}
        </div>
      )}

      {loading && <p>Loading menu…</p>}
      {!loading && !items.length && rid && <p style={{ color: "#52615e" }}>This restaurant has no dishes yet.</p>}

      {groups.map((g) => (
        <section key={g.cat.id} style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, margin: "14px 0 8px", color: "#005744" }}>{g.cat.name} <span style={{ color: "#8a9692", fontWeight: 500 }}>({g.items.length})</span></h2>
          <div style={{ display: "grid", gap: 8 }}>
            {g.items.map((it) => (
              <div key={it.id} style={{ padding: 12, borderRadius: 12, border: `1px solid ${dirty.has(it.id) ? "#f6b91f" : "#e2ebe7"}`, background: it.isAvailable ? "#fff" : "#f6f6f6" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <input value={it.name} onChange={(e) => change(it.id, (x) => ({ ...x, name: e.target.value }))} style={{ ...input, flex: 1, minWidth: 200, fontWeight: 700 }} />
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: it.isAvailable ? "#005744" : "#b91c1c" }}>
                    <input type="checkbox" checked={!it.isAvailable} onChange={(e) => change(it.id, (x) => ({ ...x, isAvailable: !e.target.checked }))} style={{ width: "auto", padding: 0, border: 0 }} />
                    Sold out
                  </label>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                  {it.prices.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 8px", borderRadius: 10, background: "#f7faf8" }}>
                      {p.label && <span style={{ fontSize: 12, fontWeight: 700, color: "#52615e" }}>{p.label}</span>}
                      <span style={{ fontSize: 12, color: "#52615e" }}>SAR</span>
                      <input
                        type="number" inputMode="decimal" min={0} step="0.5" value={p.amount}
                        onChange={(e) => change(it.id, (x) => ({ ...x, prices: x.prices.map((pp, j) => (j === i ? { ...pp, amount: e.target.value === "" ? "" : Number(e.target.value) } : pp)) }))}
                        style={{ ...input, width: 90 }}
                      />
                      <span style={{ fontSize: 12, color: "#52615e" }}>Cal</span>
                      <input
                        type="number" inputMode="numeric" min={0} value={p.cal ?? ""}
                        onChange={(e) => change(it.id, (x) => ({ ...x, prices: x.prices.map((pp, j) => (j === i ? { ...pp, cal: e.target.value === "" ? "" : Number(e.target.value) } : pp)) }))}
                        style={{ ...input, width: 80 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* sticky save bar */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))", background: "#0c1730", color: "#fff", display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap", zIndex: 50 }}>
        <span style={{ fontSize: 14 }}>{msg || (dirty.size ? `${dirty.size} unsaved change${dirty.size === 1 ? "" : "s"}` : "No changes")}</span>
        <button type="button" onClick={save} disabled={!dirty.size || saving} style={{ border: 0, borderRadius: 10, padding: "10px 18px", fontWeight: 900, background: dirty.size ? "#f6b91f" : "#5b6578", color: "#0c1730", cursor: dirty.size ? "pointer" : "default" }}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}
