"use client";

// Urban Red Chillies on myksaconnect.com: MYKSA standard menu look (as The Lunch Box) in Red Chillies
// colours. Menu comes live from Red Chillies' Supabase; orders go into its `orders` table, so they
// arrive in the Red Chillies owner app (kitchen alert + printer), exactly like the restaurant's QR menu.

import { useEffect, useMemo, useRef, useState } from "react";
import { RC_SUPABASE_KEY, RC_SUPABASE_URL, type RcAnnouncement, type RcItem, type RcSection } from "@/lib/redchillies-menu";
import s from "./RedChilliesMenu.module.css";

const AR = "٠١٢٣٤٥٦٧٨٩";
const arNum = (n: number) => String(n).replace(/\d/g, (d) => AR[Number(d)]).replace(".", "٫");
const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(2));
const norm = (t: string) => t.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[ً-ْ]/g, "");
const secId = (id: string) => `rc-sec-${id}`;
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

type Row = { key: string; label: string | null; price: number | null; was: number | null; cal: string | null };
type Line = { key: string; name: string; category: string; variant: string | null; unitPrice: number; quantity: number };
type OrderType = "dine_in" | "takeaway" | "cod";
const TYPES: Record<OrderType, string> = { dine_in: "Dine-In", takeaway: "Takeaway", cod: "Delivery (Cash)" };

function rowsFor(it: RcItem): Row[] {
  const cals = (it.calories ?? "").split("/").map((c) => c.trim()).filter(Boolean);
  if (it.variants.length > 0) {
    const many = it.variants.length > 1;
    return it.variants.map((v, i) => ({
      key: many ? `${it.id}__${v.label}` : `${it.id}__default`,
      label: many ? v.label : null,
      price: v.price,
      was: null,
      cal: cals.length === it.variants.length ? cals[i] : !many && cals.length === 1 ? cals[0] : null,
    }));
  }
  const offer = it.isTodayOffer && it.offerPrice != null;
  return [{ key: it.id, label: null, price: offer ? it.offerPrice : it.price, was: offer && it.price != null ? it.price : null, cal: cals.join(" / ") || null }];
}

export default function RedChilliesMenu({ sections, announcement }: { sections: RcSection[]; announcement: RcAnnouncement }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [zoom, setZoom] = useState<RcItem | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const shown = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return sections;
    return sections.map((x) => ({ ...x, items: x.items.filter((it) => norm(`${it.name} ${it.nameAr ?? ""}`).includes(n)) })).filter((x) => x.items.length);
  }, [q, sections]);

  useEffect(() => {
    if (q || !listRef.current) return;
    const els = Array.from(listRef.current.querySelectorAll<HTMLElement>("section[data-cat]"));
    const io = new IntersectionObserver(
      (es) => {
        const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = (v[0]?.target as HTMLElement | undefined)?.dataset.cat;
        if (id) setActive(id);
      },
      { rootMargin: "-170px 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [q, shown]);

  useEffect(() => {
    const bar = navRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (bar && chip) bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [zoom]);

  const goTo = (id: string) => {
    setQ("");
    setActive(id);
    requestAnimationFrame(() => document.getElementById(secId(id))?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // ── cart (prices already include 15% VAT) ──
  const add = (l: Omit<Line, "quantity">) =>
    setLines((p) => (p.some((x) => x.key === l.key) ? p.map((x) => (x.key === l.key ? { ...x, quantity: x.quantity + 1 } : x)) : [...p, { ...l, quantity: 1 }]));
  const setQty = (key: string, qty: number) => setLines((p) => (qty <= 0 ? p.filter((x) => x.key !== key) : p.map((x) => (x.key === key ? { ...x, quantity: qty } : x))));
  const qtyOf = (key: string) => lines.find((l) => l.key === key)?.quantity ?? 0;
  const total = round2(lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0));
  const count = lines.reduce((a, l) => a + l.quantity, 0);

  return (
    <div className={s.root}>
      {announcement && (
        <div className={s.announce} style={{ color: announcement.textColor, fontWeight: announcement.bold ? 800 : 500 }}>
          📢 {announcement.message}
        </div>
      )}

      <div className={s.top}>
        <div className={s.search}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes… ابحث" aria-label="Search dishes" />
          {q && <button type="button" className={s.clear} onClick={() => setQ("")} aria-label="Clear search">✕</button>}
        </div>
        <nav className={s.cats} ref={navRef} aria-label="Menu sections">
          {sections.map((x) => {
            const img = x.items.find((it) => it.imageUrl)?.imageUrl;
            const on = !q && active === x.id;
            return (
              <button key={x.id} type="button" data-chip={x.id} className={`${s.catBtn} ${on ? s.catOn : ""}`} onClick={() => goTo(x.id)} aria-current={on ? "true" : undefined}>
                <span className={s.catImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? <img src={img} alt="" loading="lazy" width={112} height={112} /> : <span aria-hidden>{x.icon}</span>}
                </span>
                <span className={s.catName}>{x.cat}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className={s.list} ref={listRef}>
        {shown.length === 0 && <p className={s.empty}>{sections.length ? "No dishes found. لا توجد نتائج" : "Menu is loading… please refresh in a moment."}</p>}
        {shown.map((x) => {
          const photos = x.items.some((it) => it.imageUrl);
          return (
            <section key={x.id} id={secId(x.id)} data-cat={x.id} className={`${s.sec} ${photos ? "" : s.noPhotos}`}>
              <h2 className={s.pill}><span aria-hidden>{x.icon}</span> {x.cat}</h2>
              <div className={s.table} role="table">
                <div className={`${s.row} ${s.head}`} role="row">
                  <span role="columnheader" />
                  <span role="columnheader" className={s.colHead}>SAR</span>
                  <span role="columnheader" className={`${s.colHead} ${s.colAr}`}>ريال</span>
                  <span role="columnheader" className={`${s.colHead} ${s.colCal}`}>CAL.</span>
                  <span role="columnheader" aria-hidden />
                </div>
                {x.items.map((it) =>
                  rowsFor(it).map((r, i) => {
                    const first = i === 0;
                    const n = qtyOf(r.key);
                    return (
                      <div key={r.key} role="row" className={`${s.row} ${first ? s.first : s.more}`}>
                        <span className={s.name} role="cell">
                          {photos &&
                            (!first ? (
                              <span className={`${s.thumb} ${s.spacer}`} aria-hidden />
                            ) : it.imageUrl ? (
                              <button type="button" className={s.thumb} onClick={() => setZoom(it)} aria-label={`Photo: ${it.name}`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={it.imageUrl} alt="" loading="lazy" width={88} height={88} />
                              </button>
                            ) : (
                              <span className={`${s.thumb} ${s.noImg}`} aria-hidden />
                            ))}
                          <span className={s.nameText}>
                            {first ? (
                              <>
                                <span className={s.en}>
                                  {it.name}
                                  {r.label && <span className={s.label}> – {r.label}</span>}
                                </span>
                                {it.nameAr && <span className={s.ar} dir="rtl">{it.nameAr}</span>}
                                {(it.isTodayOffer || it.isBestSeller) && (
                                  <span className={s.badges}>
                                    {it.isTodayOffer && <span className={s.badge}>Offer</span>}
                                    {it.isBestSeller && <span className={`${s.badge} ${s.best}`}>Best seller</span>}
                                  </span>
                                )}
                              </>
                            ) : (
                              r.label && <span className={`${s.label} ${s.alone}`}>{r.label}</span>
                            )}
                            {r.was != null && <span className={s.was}>SAR {fmt(r.was)}</span>}
                          </span>
                        </span>
                        <span className={s.price} role="cell">{r.price != null ? fmt(r.price) : "—"}</span>
                        <span className={s.priceAr} role="cell">{r.price != null ? arNum(r.price) : ""}</span>
                        <span className={s.cal} role="cell">{r.cal ?? ""}</span>
                        <span role="cell" className={s.addCell}>
                          {r.price != null && (
                            <button
                              type="button"
                              className={s.add}
                              aria-label={`Add ${it.name}${r.label ? ` (${r.label})` : ""}`}
                              onClick={() => add({ key: r.key, name: it.name, category: x.cat, variant: r.label, unitPrice: r.price as number })}
                            >
                              {n > 0 ? n : "+"}
                            </button>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
        <p className={s.vat}>All prices include 15% VAT · الأسعار شاملة ضريبة القيمة المضافة</p>
      </div>

      {count > 0 && !open && (
        <button type="button" className={s.fab} onClick={() => setOpen(true)}>
          🛒 View order · {count} · SAR {total.toFixed(2)}
        </button>
      )}

      {open && <Checkout lines={lines} total={total} setQty={setQty} onClose={() => setOpen(false)} onDone={() => setLines([])} />}

      {zoom && (
        <div className={s.zoom} role="dialog" aria-modal="true" aria-label={zoom.name} onClick={() => setZoom(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom.imageUrl ?? ""} alt={zoom.name} />
            <figcaption>
              <b>{zoom.name}</b>
              {zoom.nameAr && <span dir="rtl">{zoom.nameAr}</span>}
            </figcaption>
            <button type="button" className={s.zoomClose} onClick={() => setZoom(null)} aria-label="Close">✕</button>
          </figure>
        </div>
      )}
    </div>
  );
}

// ── Checkout: same order format as the Red Chillies QR menu → owner app ──
function Checkout({ lines, total, setQty, onClose, onDone }: { lines: Line[]; total: number; setQty: (k: string, q: number) => void; onClose: () => void; onDone: () => void }) {
  const [type, setType] = useState<OrderType>("dine_in");
  const [table, setTable] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string; total: number; type: OrderType; table: string } | null>(null);

  const vat = round2((total * 0.15) / 1.15);
  const subtotal = round2(total - vat);

  function locate() {
    if (!navigator.geolocation) return setErr("Location isn't supported on this phone. Please type your address.");
    setLocating(true);
    setErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`, { headers: { Accept: "application/json" } });
          const d = await r.json();
          if (d?.display_name) setAddress(d.display_name);
        } catch {
          /* the map pin is still sent */
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setErr("Couldn't get your location. Please type your address.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function place() {
    if (type === "dine_in" && !table) return setErr("Please select your table number.");
    if (type !== "dine_in" && !name.trim()) return setErr("Please enter your name.");
    if (type !== "dine_in" && !phone.trim()) return setErr("Please enter your phone number.");
    if (type === "cod" && !address.trim()) return setErr("Please enter your delivery address.");
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`${RC_SUPABASE_URL}/rest/v1/orders?select=id`, {
        method: "POST",
        headers: { apikey: RC_SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({
          customer_name: name.trim() || (type === "dine_in" ? `Table ${table}` : TYPES[type]),
          customer_phone: phone.trim() || null,
          customer_address: type === "cod" ? address.trim() : null,
          delivery_lat: type === "cod" ? lat : null,
          delivery_lng: type === "cod" ? lng : null,
          order_type: type,
          order_source: "qr_menu", // same source as the restaurant's own QR menu, so the owner app shows it
          notes: "Order via MYKSA Connect",
          table_number: type === "dine_in" ? table : null,
          items: lines.map((l) => ({
            name: l.name,
            category: l.category,
            variant: l.variant,
            quantity: l.quantity,
            unit_price: l.unitPrice,
            total_price: round2(l.unitPrice * l.quantity),
          })),
          subtotal,
          vat_amount: vat,
          total_amount: total,
          status: "pending",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const rows = (await res.json()) as { id: string }[];
      setDone({ id: rows[0]?.id ?? "", total, type, table });
      onDone();
    } catch {
      setErr("Something went wrong placing your order. Please try again or tell the staff.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.sheetWrap} onClick={onClose}>
      <div className={s.sheet} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Your order">
        {done ? (
          <div className={s.done}>
            <div className={s.doneIcon}>✅</div>
            <h3>Order sent to the kitchen!</h3>
            <p className={s.doneTag}>{done.type === "dine_in" ? `Table ${done.table}` : TYPES[done.type]}</p>
            <p>Order #{done.id.slice(0, 8).toUpperCase()} · SAR {done.total.toFixed(2)}</p>
            <p className={s.payNote}>{done.type === "cod" ? "Please pay cash on delivery" : "Please pay at the counter"}<br />{done.type === "cod" ? "الدفع نقداً عند الاستلام" : "يرجى الدفع عند الكاشير"}</p>
            <button type="button" className={s.placeBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className={s.sheetHead}>
              <h3>Your order</h3>
              <button type="button" className={s.x} onClick={onClose} aria-label="Close">✕</button>
            </div>
            {lines.length === 0 ? (
              <p className={s.emptyCart}>Your order is empty.</p>
            ) : (
              <>
                <div className={s.lines}>
                  {lines.map((l) => (
                    <div key={l.key} className={s.line}>
                      <div>
                        <b>{l.name}</b>
                        {l.variant && <span className={s.lineVar}> ({l.variant})</span>}
                        <div className={s.lineEach}>SAR {l.unitPrice.toFixed(2)} each</div>
                      </div>
                      <div className={s.qty}>
                        <button type="button" onClick={() => setQty(l.key, l.quantity - 1)} aria-label="Less">−</button>
                        <span>{l.quantity}</span>
                        <button type="button" onClick={() => setQty(l.key, l.quantity + 1)} aria-label="More">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={s.totals}>
                  <div><span>Subtotal</span><span>SAR {subtotal.toFixed(2)}</span></div>
                  <div><span>VAT (15%)</span><span>SAR {vat.toFixed(2)}</span></div>
                  <div className={s.grand}><span>Total</span><span>SAR {total.toFixed(2)}</span></div>
                </div>
                <div className={s.types}>
                  {(Object.keys(TYPES) as OrderType[]).map((t) => (
                    <button key={t} type="button" className={`${s.type} ${type === t ? s.typeOn : ""}`} onClick={() => { setType(t); setErr(""); }}>
                      {TYPES[t]}
                    </button>
                  ))}
                </div>
                <div className={s.form}>
                  {type === "dine_in" && (
                    <label>
                      Table number *
                      <select value={table} onChange={(e) => setTable(e.target.value)}>
                        <option value="" disabled>Select your table</option>
                        {Array.from({ length: 25 }, (_, i) => `RC-${i + 1}`).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                  )}
                  <label>
                    Name {type === "dine_in" ? "(optional)" : "*"}
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                  </label>
                  <label>
                    Phone {type === "dine_in" ? "(optional)" : "*"}
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" inputMode="tel" autoComplete="tel" />
                  </label>
                  {type === "cod" && (
                    <label>
                      Delivery address *
                      <button type="button" className={s.locate} onClick={locate} disabled={locating}>{locating ? "Locating…" : "📍 Use my location"}</button>
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Building, street, area — or tap 'Use my location'" />
                    </label>
                  )}
                </div>
                {err && <div className={s.err}>{err}</div>}
                <button type="button" className={s.placeBtn} onClick={place} disabled={busy}>
                  {busy ? "Placing order…" : `Place order — SAR ${total.toFixed(2)}`}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
