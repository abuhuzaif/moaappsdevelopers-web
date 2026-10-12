"use client";

// Homepage "Restaurant Digital Menus" banner — compact strip with moving rows of
// real dish photos. Public restaurants (isActive && !hidden) and their dish photos
// come from Firestore; a small built-in set of dish photos keeps it full even when
// only a few restaurants are live.

import { useEffect, useMemo, useState } from "react";
import { collection, getCountFromServer, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Spot = { id: string; slug: string; name: string; logoUrl?: string; dishCount: number };

const FALLBACK_DISHES = Array.from({ length: 12 }, (_, i) => `/images/menu-banner/dish-${String(i + 1).padStart(2, "0")}.webp`);

const FEATURES = ["📱 QR menu", "💬 WhatsApp orders", "🌐 Arabic + English", "🔥 Calories"] as const;

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
  const [photos, setPhotos] = useState<string[]>(FALLBACK_DISHES);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "restaurants"), where("isActive", "==", true)));
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((r) => !r.hidden && r.slug && r.name)
          .slice(0, 8);

        const live: string[] = [];
        const result = await Promise.all(
          list.map(async (r): Promise<Spot> => {
            let dishCount = 0;
            try {
              const ref = collection(db, "restaurants", r.id, "menuItems");
              const [count, sample] = await Promise.all([getCountFromServer(ref), getDocs(query(ref, limit(16)))]);
              dishCount = count.data().count;
              sample.forEach((d) => {
                const it = d.data() as any;
                if (it.imageUrl && it.isAvailable !== false) live.push(it.imageUrl);
              });
            } catch {
              /* restaurant without an inline menu */
            }
            return { id: r.id, slug: r.slug, name: r.name, logoUrl: r.logoUrl, dishCount };
          })
        );
        if (!alive) return;
        setSpots(result);
        // live photos first, topped up with the built-in set so the rows always look full
        setPhotos(shuffle([...shuffle(live).slice(0, 14), ...FALLBACK_DISHES]).slice(0, 16));
      } catch {
        if (alive) setPhotos(shuffle(FALLBACK_DISHES));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalDishes = useMemo(() => spots.reduce((s, r) => s + r.dishCount, 0), [spots]);
  const half = Math.ceil(photos.length / 2);
  const rowA = photos.slice(0, half);
  const rowB = photos.slice(half).length ? photos.slice(half) : photos;

  return (
    <section className="rs" aria-labelledby="rs-title">
      <style>{CSS}</style>

      <div className="rs-copy">
        <p className="rs-kicker">🍽️ Restaurant Digital Menus</p>
        <h2 id="rs-title">
          Scan. Order. <span>Enjoy.</span>
        </h2>
        <p className="rs-lead">Real menus with photos, prices &amp; calories — order straight on WhatsApp.</p>
        <ul className="rs-features">
          {FEATURES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="rs-actions">
          <a href="/restaurants" className="rs-btn rs-btn-gold">
            Browse Menus →
          </a>
          <a href="/restaurants/create" className="rs-btn rs-btn-ghost">
            List your restaurant
          </a>
          {spots.length > 0 && (
            <a href="/restaurants" className="rs-live" aria-label={`${spots.length} restaurants live`}>
              <span className="rs-avatars">
                {spots.slice(0, 4).map((r) =>
                  r.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={r.id} src={r.logoUrl} alt="" />
                  ) : (
                    <i key={r.id}>🍽️</i>
                  )
                )}
              </span>
              <span>
                <b>{spots.length}</b> live{totalDishes > 0 ? <> · <b>{totalDishes}+</b> dishes</> : null}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* two rows of dish photos drifting in opposite directions */}
      <div className="rs-reel" aria-hidden>
        {[rowA, rowB].map((row, r) => (
          <div key={r} className={`rs-row rs-row-${r}`}>
            <div className="rs-track">
              {[...row, ...row].map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" loading="lazy" width={120} height={120} />
              ))}
            </div>
          </div>
        ))}
        <span className="rs-chip rs-chip-wa">💬 Order sent!</span>
        <span className="rs-chip rs-chip-cal">🔥 450 kcal</span>
      </div>
    </section>
  );
}

const CSS = `
.rs {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(14px, 2.5vw, 30px);
  max-width: 1040px;
  margin: 22px auto;
  padding: clamp(18px, 2.4vw, 26px) clamp(18px, 2.8vw, 32px);
  border-radius: 22px;
  color: #fff;
  background:
    radial-gradient(70% 120% at 100% 0%, rgba(246,185,31,.22), transparent 60%),
    radial-gradient(60% 120% at 0% 100%, rgba(0,150,110,.35), transparent 65%),
    linear-gradient(120deg, #03140d 0%, #0a2a1f 60%, #06231a 100%);
  border: 1px solid rgba(246,185,31,.35);
  box-shadow: 0 18px 40px rgba(0,40,30,.25);
  isolation: isolate;
}
.rs::before { /* soft gold shine sweeping across */
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(105deg, transparent 40%, rgba(246,185,31,.10) 50%, transparent 60%);
  background-size: 250% 100%;
  animation: rs-shine 7s ease-in-out infinite;
}

.rs-copy { min-width: 0; position: relative; z-index: 2; }
.rs-kicker { margin: 0 0 6px; color: #f6b91f; font-weight: 900; font-size: 11.5px; letter-spacing: .9px; text-transform: uppercase; }
.rs h2 { margin: 0; font-size: clamp(1.6rem, 3.3vw, 2.4rem); line-height: 1.05; font-weight: 900; letter-spacing: -.4px; }
.rs h2 span {
  background: linear-gradient(90deg, #f6b91f, #ffe08a, #f6b91f);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.rs-lead { margin: 6px 0 0; color: #cfe3dc; font-size: .95rem; line-height: 1.5; }
.rs-features { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 0; padding: 0; }
.rs-features li { padding: 4px 9px; border-radius: 999px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); font-size: 11.5px; font-weight: 700; }

.rs-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; }
.rs-btn { display: inline-flex; align-items: center; padding: 9px 16px; border-radius: 10px; font-weight: 800; font-size: 13.5px; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.rs-btn-gold { background: #f6b91f; color: #0c1730; box-shadow: 0 8px 20px rgba(246,185,31,.35); }
.rs-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(246,185,31,.45); }
.rs-btn-ghost { color: #fff; border: 1px solid rgba(255,255,255,.35); }
.rs-btn-ghost:hover { background: rgba(255,255,255,.1); }

.rs-live { display: inline-flex; align-items: center; gap: 8px; margin-left: 4px; color: #cfe3dc; font-size: 12.5px; text-decoration: none; }
.rs-live b { color: #fff; }
.rs-avatars { display: inline-flex; }
.rs-avatars img, .rs-avatars i {
  width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: #fff;
  border: 2px solid #0a2a1f; margin-left: -8px; display: grid; place-items: center; font-style: normal; font-size: 13px;
}
.rs-avatars > :first-child { margin-left: 0; }

/* dish reel */
.rs-reel { position: relative; display: flex; flex-direction: column; gap: 10px; transform: rotate(-4deg); margin: -10px -40px -10px 0; }
.rs-row { overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.rs-track { display: flex; gap: 10px; width: max-content; animation: rs-left 40s linear infinite; }
.rs-row-1 .rs-track { animation-name: rs-right; animation-duration: 46s; }
.rs-track img {
  width: 92px; height: 92px; border-radius: 50%; object-fit: cover; flex: none;
  border: 3px solid rgba(255,255,255,.85); box-shadow: 0 8px 18px rgba(0,0,0,.4);
}
.rs-reel:hover .rs-track { animation-play-state: paused; }

.rs-chip {
  position: absolute; z-index: 3; padding: 6px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 800;
  box-shadow: 0 8px 18px rgba(0,0,0,.35); animation: rs-bob 4s ease-in-out infinite; transform: rotate(4deg);
}
.rs-chip-wa { top: 38%; left: 8%; background: #1f9d55; color: #fff; }
.rs-chip-cal { bottom: -2px; right: 18%; background: #fff; color: #b3401e; animation-delay: -2s; }

@keyframes rs-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes rs-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
@keyframes rs-bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
@keyframes rs-shine { 0%, 100% { background-position: 120% 0; } 50% { background-position: -20% 0; } }

@media (max-width: 760px) {
  .rs { grid-template-columns: minmax(0, 1fr); }
  .rs-reel { margin: 0 -18px; transform: rotate(-3deg); }
  .rs-row-1 { display: none; }
  .rs-track img { width: 72px; height: 72px; }
  .rs-chip-wa { top: auto; bottom: -4px; left: 10%; }
  .rs-chip-cal { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .rs::before, .rs-track, .rs-chip { animation: none; }
}
`;
