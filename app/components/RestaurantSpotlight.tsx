"use client";

// Homepage "Restaurant Digital Menus" splash banner.
// Pulls the public restaurants (isActive && !hidden) and a few real dishes from
// their menus, so the banner always shows live photos/prices and new restaurants
// appear here automatically.

import { useEffect, useMemo, useState } from "react";
import { collection, getCountFromServer, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Spot = {
  id: string;
  slug: string;
  name: string;
  cuisine?: string;
  city?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  dishCount: number;
};

type Dish = { name: string; price?: number; imageUrl: string; restaurant: string };

const FEATURES = [
  ["📱", "Scan the QR"],
  ["💬", "Order on WhatsApp"],
  ["🌐", "Arabic + English"],
  ["🔥", "Calories shown"],
] as const;

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RestaurantSpotlight() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "restaurants"), where("isActive", "==", true)));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((r) => !r.hidden && r.slug && r.name)
          .slice(0, 8);

        const allDishes: Dish[] = [];
        const result: Spot[] = await Promise.all(
          list.map(async (r) => {
            let dishCount = 0;
            try {
              const itemsRef = collection(db, "restaurants", r.id, "menuItems");
              const [count, sample] = await Promise.all([
                getCountFromServer(itemsRef),
                getDocs(query(itemsRef, limit(24))),
              ]);
              dishCount = count.data().count;
              sample.forEach((doc) => {
                const it = doc.data() as any;
                if (it.imageUrl && it.isAvailable !== false) {
                  allDishes.push({
                    name: it.name,
                    price: Array.isArray(it.prices) ? it.prices[0]?.amount : undefined,
                    imageUrl: it.imageUrl,
                    restaurant: r.name,
                  });
                }
              });
            } catch {
              /* restaurants without an inline menu (menuUrl only) just show their card */
            }
            if (!allDishes.some((d) => d.restaurant === r.name) && r.coverImageUrl) {
              allDishes.push({ name: r.name, imageUrl: r.coverImageUrl, restaurant: r.name });
            }
            return {
              id: r.id,
              slug: r.slug,
              name: r.name,
              cuisine: r.cuisine,
              city: r.city,
              logoUrl: r.logoUrl,
              coverImageUrl: r.coverImageUrl,
              dishCount,
            };
          })
        );
        if (!alive) return;
        setSpots(result);
        setDishes(shuffle(allDishes).slice(0, 12));
      } catch {
        /* banner still works with its static content */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalDishes = useMemo(() => spots.reduce((s, r) => s + r.dishCount, 0), [spots]);
  const plates = dishes.slice(0, 4);
  const screenRows = dishes.length ? [...dishes, ...dishes] : []; // doubled for a seamless scroll loop

  return (
    <section className="rs" aria-labelledby="rs-title">
      <style>{CSS}</style>

      {/* blurred food collage in the background */}
      <div className="rs-bg" aria-hidden>
        {dishes.slice(0, 6).map((d, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={d.imageUrl} alt="" />
        ))}
      </div>

      <div className="rs-inner">
        <div className="rs-copy">
          <p className="rs-kicker">🍽️ Restaurant Digital Menus</p>
          <h2 id="rs-title">
            Scan. Order. <span>Enjoy.</span>
          </h2>
          <p className="rs-lead">
            Browse real menus from restaurants across Saudi Arabia — photos, prices and calories —
            and send your order straight to the restaurant on WhatsApp.
          </p>

          <ul className="rs-features">
            {FEATURES.map(([icon, label]) => (
              <li key={label}>
                <span aria-hidden>{icon}</span>
                {label}
              </li>
            ))}
          </ul>

          {spots.length > 0 && (
            <p className="rs-stats">
              <strong>{spots.length}</strong> restaurant{spots.length === 1 ? "" : "s"}
              {totalDishes > 0 && (
                <>
                  {" "}· <strong>{totalDishes}+</strong> dishes
                </>
              )}{" "}
              · more joining every week
            </p>
          )}

          <div className="rs-actions">
            <a href="/restaurants" className="rs-btn rs-btn-gold">
              Browse Digital Menus →
            </a>
            <a href="/restaurants/create" className="rs-btn rs-btn-ghost">
              Own a restaurant? Get your menu
            </a>
          </div>
        </div>

        {/* phone mockup with a live, auto-scrolling menu */}
        <div className="rs-stage" aria-hidden>
          {plates.map((d, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} className={`rs-plate rs-plate-${i}`} src={d.imageUrl} alt="" />
          ))}
          <div className="rs-phone">
            <div className="rs-notch" />
            <div className="rs-screen">
              <div className="rs-screen-head">
                <span>🍽️ Digital Menu</span>
                <b>🛒</b>
              </div>
              <div className="rs-scroll">
                <div className={`rs-scroll-track${screenRows.length ? " is-moving" : ""}`}>
                  {(screenRows.length ? screenRows : PLACEHOLDER_ROWS).map((d, i) => (
                    <div className="rs-row" key={i}>
                      {d.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.imageUrl} alt="" />
                      ) : (
                        <span className="rs-row-ph" />
                      )}
                      <div>
                        <strong>{d.name}</strong>
                        <small>{d.restaurant}</small>
                      </div>
                      {d.price != null && <em>{d.price} SAR</em>}
                      <i>+</i>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rs-screen-bar">💬 Send order on WhatsApp</div>
            </div>
          </div>
        </div>
      </div>

      {spots.length > 0 && (
        <div className="rs-cards">
          {spots.map((r) => (
            <a key={r.id} href={`/${r.slug}`} className="rs-card">
              {r.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.logoUrl} alt="" className="rs-card-logo" />
              ) : (
                <span className="rs-card-logo rs-card-logo-ph">🍽️</span>
              )}
              <span className="rs-card-text">
                <strong>{r.name}</strong>
                <small>
                  {[r.cuisine, r.city].filter(Boolean).join(" · ")}
                  {r.dishCount > 0 ? ` · ${r.dishCount} dishes` : ""}
                </small>
              </span>
              <b aria-hidden>→</b>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

const PLACEHOLDER_ROWS: Dish[] = [
  { name: "Mutton Karahi", price: 60, imageUrl: "", restaurant: "Pakistani" },
  { name: "Chicken Biryani", price: 25, imageUrl: "", restaurant: "Rice" },
  { name: "BBQ Platter", price: 58, imageUrl: "", restaurant: "Grill" },
  { name: "Mango Lassi", price: 14, imageUrl: "", restaurant: "Drinks" },
];

const CSS = `
.rs {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  margin: 28px 0;
  padding: clamp(22px, 4vw, 44px);
  color: #fff;
  background:
    radial-gradient(120% 90% at 85% 10%, rgba(246,185,31,.20), transparent 55%),
    radial-gradient(90% 80% at 0% 100%, rgba(0,135,104,.35), transparent 60%),
    linear-gradient(135deg, #04160f 0%, #0a2a1f 55%, #051b14 100%);
  box-shadow: 0 22px 50px rgba(0,40,30,.28);
  isolation: isolate;
}
.rs-bg {
  position: absolute; inset: 0; z-index: -1;
  display: grid; grid-template-columns: repeat(3, 1fr);
  opacity: .16; filter: blur(2px) saturate(1.2);
}
.rs-bg img { width: 100%; height: 100%; object-fit: cover; }
.rs-bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #04160f 30%, rgba(4,22,15,.55)); }

.rs-inner { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(20px, 4vw, 48px); align-items: center; }

.rs-kicker { margin: 0 0 8px; color: #f6b91f; font-weight: 900; font-size: 12.5px; letter-spacing: .9px; text-transform: uppercase; }
.rs h2 { margin: 0; font-size: clamp(2.1rem, 5.4vw, 3.6rem); line-height: 1.02; font-weight: 900; letter-spacing: -.5px; }
.rs h2 span { color: #f6b91f; }
.rs-lead { margin: 14px 0 0; max-width: 520px; color: #cfe3dc; font-size: clamp(.95rem, 1.6vw, 1.08rem); line-height: 1.6; }

.rs-features { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 0; padding: 0; }
.rs-features li {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 999px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16);
  font-size: 12.5px; font-weight: 700;
}
.rs-stats { margin: 16px 0 0; color: #b7d3ca; font-size: 13.5px; }
.rs-stats strong { color: #fff; font-size: 15px; }

.rs-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.rs-btn { display: inline-flex; align-items: center; justify-content: center; padding: 13px 22px; border-radius: 12px; font-weight: 800; font-size: 15px; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.rs-btn-gold { background: #f6b91f; color: #0c1730; box-shadow: 0 10px 24px rgba(246,185,31,.35); }
.rs-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(246,185,31,.45); }
.rs-btn-ghost { color: #fff; border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.04); }
.rs-btn-ghost:hover { background: rgba(255,255,255,.12); }

/* phone + floating plates */
.rs-stage { position: relative; height: 430px; display: grid; place-items: center; }
.rs-phone {
  position: relative; width: 230px; height: 420px; border-radius: 34px; padding: 10px;
  background: #0b0f0d; border: 2px solid #2b3a35;
  box-shadow: 0 30px 60px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.06);
  transform: rotate(-4deg); z-index: 2;
}
.rs-notch { position: absolute; top: 14px; left: 50%; width: 70px; height: 16px; margin-left: -35px; border-radius: 10px; background: #0b0f0d; z-index: 3; }
.rs-screen { position: relative; height: 100%; border-radius: 26px; overflow: hidden; background: #fbf6df; color: #1a1a18; display: flex; flex-direction: column; }
.rs-screen-head { display: flex; justify-content: space-between; align-items: center; padding: 30px 14px 8px; font-weight: 900; font-size: 13px; color: #4e2a29; border-bottom: 2px dotted #b37540; }
.rs-scroll { position: relative; flex: 1; overflow: hidden; }
.rs-scroll::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 30px; background: linear-gradient(transparent, #fbf6df); }
.rs-scroll-track.is-moving { animation: rs-scroll 26s linear infinite; }
.rs-row { display: grid; grid-template-columns: 44px 1fr auto 22px; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px dashed rgba(179,117,64,.35); }
.rs-row img, .rs-row-ph { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: #ead9b8; }
.rs-row strong { display: block; font-size: 11.5px; line-height: 1.2; text-transform: uppercase; }
.rs-row small { display: block; font-size: 9.5px; color: #7a6f68; }
.rs-row em { font-style: normal; font-weight: 900; font-size: 11px; color: #fff; background: #b37540; padding: 2px 6px; border-radius: 5px; white-space: nowrap; }
.rs-row i { font-style: normal; width: 22px; height: 22px; border-radius: 50%; background: #4e2a29; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 14px; }
.rs-screen-bar { margin: 8px; padding: 9px; border-radius: 12px; background: #1f9d55; color: #fff; font-weight: 800; font-size: 11.5px; text-align: center; }

.rs-plate { position: absolute; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,.9); box-shadow: 0 16px 34px rgba(0,0,0,.45); z-index: 3; animation: rs-float 6s ease-in-out infinite; }
.rs-plate-0 { width: 120px; height: 120px; top: 6%; left: 2%; }
.rs-plate-1 { width: 96px; height: 96px; top: 14%; right: 0; animation-delay: -1.5s; }
.rs-plate-2 { width: 108px; height: 108px; bottom: 6%; left: 6%; animation-delay: -3s; }
.rs-plate-3 { width: 84px; height: 84px; bottom: 12%; right: 6%; animation-delay: -4.5s; }

@keyframes rs-float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(4deg); } }
@keyframes rs-scroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }

/* restaurant cards */
.rs-cards { display: flex; gap: 12px; overflow-x: auto; margin-top: 26px; padding-bottom: 4px; scrollbar-width: none; }
.rs-cards::-webkit-scrollbar { display: none; }
.rs-card {
  flex: 0 0 auto; min-width: 230px; display: flex; align-items: center; gap: 12px;
  padding: 10px 14px 10px 10px; border-radius: 16px; text-decoration: none; color: #fff;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
  transition: background .18s ease, transform .18s ease, border-color .18s ease;
}
.rs-card:hover { background: rgba(255,255,255,.13); border-color: #f6b91f; transform: translateY(-2px); }
.rs-card-logo { width: 46px; height: 46px; border-radius: 12px; object-fit: cover; background: #fff; flex: none; }
.rs-card-logo-ph { display: grid; place-items: center; font-size: 22px; }
.rs-card-text { flex: 1; min-width: 0; }
.rs-card-text strong { display: block; font-size: 15px; }
.rs-card-text small { display: block; color: #b7d3ca; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rs-card b { color: #f6b91f; font-size: 20px; }

@media (max-width: 860px) {
  .rs-inner { grid-template-columns: 1fr; }
  .rs-stage { height: 380px; }
  .rs-phone { width: 200px; height: 370px; }
  .rs-plate-0 { width: 92px; height: 92px; left: 4%; }
  .rs-plate-1 { width: 76px; height: 76px; right: 4%; }
  .rs-plate-2 { width: 84px; height: 84px; }
  .rs-plate-3 { width: 70px; height: 70px; }
  .rs-actions .rs-btn { flex: 1 1 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .rs-plate, .rs-scroll-track.is-moving { animation: none; }
}
`;
