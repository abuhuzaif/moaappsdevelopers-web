"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Playfair_Display, Noto_Naskh_Arabic, Great_Vibes, Cinzel } from "next/font/google";
import type { MenuItem, MenuPrice, MenuRestaurantInfo, MenuSection, OrderType } from "@/lib/restaurant-menu";
import { AddControl, CartBar, CartProvider, CartSheet, useCartState } from "./cart";
import "./restaurant-menu.css";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "700"], variable: "--rm-font-display" });
const arabic = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400", "600", "700"], variable: "--rm-font-arabic" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--rm-font-script" });
const caps = Cinzel({ subsets: ["latin"], weight: ["400", "600"], variable: "--rm-font-caps" });

type Lang = "en" | "ar";
type T = { en: string; ar: string };
const LANG_KEY = "rm-lang";

// ── Fixed UI text ─────────────────────────────────────────────
const ui = {
  priceLabel: {
    single: { en: "Single", ar: "فردي" },
    full: { en: "Full", ar: "كامل" },
    half: { en: "Half", ar: "نصف" },
    small: { en: "Small", ar: "صغير" },
    medium: { en: "Medium", ar: "وسط" },
    large: { en: "Large", ar: "كبير" },
    breast: { en: "Breast", ar: "صدر" },
    leg: { en: "Leg", ar: "فخذ" },
  } as Record<string, T>,
  allergen: {
    gluten: { en: "Gluten", ar: "جلوتين" },
    milk: { en: "Milk", ar: "حليب" },
    egg: { en: "Egg", ar: "بيض" },
    fish: { en: "Fish", ar: "سمك" },
    soy: { en: "Soy", ar: "صويا" },
    sesame: { en: "Sesame", ar: "سمسم" },
    nuts: { en: "Nuts", ar: "مكسرات" },
    peanuts: { en: "Peanuts", ar: "فول سوداني" },
    shellfish: { en: "Shellfish", ar: "قشريات" },
    mustard: { en: "Mustard", ar: "خردل" },
    celery: { en: "Celery", ar: "كرفس" },
  } as Record<string, T>,
  tag: {
    new: { en: "New", ar: "جديد" },
    signature: { en: "House favourite", ar: "طبق مميز" },
  } as Record<string, T>,
  menu: { en: "Menu", ar: "القائمة" },
  kcal: { en: "kcal", ar: "سعرة" },
  contains: { en: "Contains", ar: "يحتوي على" },
  search: { en: "Search the menu", ar: "ابحث في القائمة" },
  clear: { en: "Clear", ar: "مسح" },
  noResults: { en: "No dishes match that search. Try a shorter word.", ar: "لا توجد أطباق مطابقة. جرّب كلمة أقصر." },
  orderWhatsapp: { en: "Order on WhatsApp", ar: "اطلب عبر واتساب" },
  whatsappGreeting: { en: "Hello, I'd like to order:", ar: "مرحباً، أرغب في طلب:" },
  cateringTitle: { en: "Catering & events", ar: "التموين والمناسبات" },
  cateringCta: { en: "Ask about catering", ar: "استفسر عن التموين" },
  cateringGreeting: { en: "Hello, I'd like to ask about catering for an event.", ar: "مرحباً، أرغب في الاستفسار عن التموين لمناسبة." },
  vat: { en: "All prices in SAR and include 15% VAT.", ar: "جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة 15%." },
  dailyIntake: {
    en: "Recommended daily intake for an adult is around 2,000–2,500 calories.",
    ar: "الاحتياج اليومي الموصى به للشخص البالغ حوالي 2000–2500 سعرة حرارية.",
  },
  allergyNote: {
    en: "Dishes may contain allergens. Please ask our staff about ingredients.",
    ar: "قد تحتوي الأطباق على مسببات حساسية. يرجى سؤال الموظفين عن المكونات.",
  },
  langSwitch: { en: "عربي", ar: "English" },
  timings: { en: "Timings", ar: "أوقات العمل" },
};

const pick = (lang: Lang, en?: string, ar?: string) => (lang === "ar" && ar ? ar : en ?? "");
const sep = (lang: Lang) => (lang === "ar" ? "، " : ", ");

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u0652]/g, "");
}

// ── Riyal sign: /public/riyal.png (white symbol), else "SAR" / "ر.س" ──
let riyalProbe: Promise<boolean> | null = null;
function useRiyalSvg() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    riyalProbe ??= new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = "/riyal.png";
    });
    let alive = true;
    riyalProbe.then((v) => alive && setOk(v));
    return () => {
      alive = false;
    };
  }, []);
  return ok;
}

function Riyal({ lang }: { lang: Lang }) {
  const ok = useRiyalSvg();
  if (!ok) return <span className="rm-riyal-text">{lang === "ar" ? "ر.س" : "SAR"}</span>;
  // drawn with a CSS mask so it takes the price colour
  return <span className="rm-riyal" role="img" aria-label={lang === "ar" ? "ريال" : "SAR"} />;
}

function Amount({ p, lang }: { p: MenuPrice; lang: Lang }) {
  return (
    <span className="rm-amount">
      <Riyal lang={lang} />
      <span>{p.amount}</span>
    </span>
  );
}

function Cal({ p, lang, inline }: { p: MenuPrice; lang: Lang; inline?: boolean }) {
  if (p.cal == null) return null;
  return (
    <span className={inline ? "rm-cal rm-cal-inline" : "rm-cal"}>
      {p.cal} {ui.kcal[lang]}
    </span>
  );
}

function Thumb({ item, lang, reserve }: { item: MenuItem; lang: Lang; reserve: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!item.imageUrl || failed) return reserve ? <div className="rm-thumb rm-thumb-empty" aria-hidden /> : null;
  return (
    <div className="rm-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.imageUrl} alt={pick(lang, item.name, item.nameAr)} loading="lazy" width={280} height={280} onError={() => setFailed(true)} />
    </div>
  );
}

function Dish({ item, lang, reserve }: { item: MenuItem; lang: Lang; reserve: boolean }) {
  const single = item.prices.length === 1 && !item.prices[0].label ? item.prices[0] : null;
  const label = (l?: string) => (l ? ui.priceLabel[l]?.[lang] ?? l : "");

  return (
    <article className="rm-dish">
      <Thumb item={item} lang={lang} reserve={reserve} />
      <div className="rm-dish-body">
        <div className="rm-dish-head">
          <h3 className="rm-dish-name">
            {pick(lang, item.name, item.nameAr)}
            {item.tags?.map((tag) =>
              ui.tag[tag] ? (
                <span key={tag} className={`rm-tag rm-tag-${tag}`}>
                  {ui.tag[tag][lang]}
                </span>
              ) : null
            )}
          </h3>
          {single && (
            <>
              <span className="rm-leader" aria-hidden />
              <Amount p={single} lang={lang} />
              <AddControl item={item} p={single} lang={lang} />
            </>
          )}
        </div>

        {single && <Cal p={single} lang={lang} />}

        {item.desc && <p className="rm-desc">{pick(lang, item.desc, item.descAr)}</p>}

        {item.includes && <p className="rm-includes">{item.includes.map((x) => pick(lang, x.en, x.ar)).join(sep(lang))}</p>}

        {!single && item.prices.length > 0 && (
          <div className="rm-price-lines">
            {item.prices.map((p, i) => (
              <div className="rm-price-line" key={i}>
                <span className="rm-price-label">{label(p.label)}</span>
                <span className="rm-leader" aria-hidden />
                <Cal p={p} lang={lang} inline />
                <Amount p={p} lang={lang} />
                <AddControl item={item} p={p} lang={lang} />
              </div>
            ))}
          </div>
        )}

        {item.allergens && item.allergens.length > 0 && (
          <p className="rm-allergens">
            {ui.contains[lang]}: {item.allergens.map((a) => ui.allergen[a]?.[lang] ?? a).join(sep(lang))}
          </p>
        )}
      </div>
    </article>
  );
}

function Card({ item, lang }: { item: MenuItem; lang: Lang }) {
  const label = (l?: string) => (l ? ui.priceLabel[l]?.[lang] ?? l : "");
  const single = item.prices.length === 1 && !item.prices[0].label ? item.prices[0] : null;
  return (
    <article className="rm-card">
      {item.imageUrl && (
        <div className="rm-card-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={pick(lang, item.name, item.nameAr)} loading="lazy" width={280} height={280} />
        </div>
      )}
      <h3 className="rm-card-name">
        {pick(lang, item.name, item.nameAr)}
        {item.tags?.map((tag) =>
          ui.tag[tag] ? (
            <span key={tag} className={`rm-tag rm-tag-${tag}`}>
              {ui.tag[tag][lang]}
            </span>
          ) : null
        )}
      </h3>
      {item.desc && <p className="rm-card-desc">{pick(lang, item.desc, item.descAr)}</p>}
      {single ? (
        <div className="rm-card-price">
          <div className="rm-card-price-line">
            <Amount p={single} lang={lang} />
            <AddControl item={item} p={single} lang={lang} />
          </div>
          <Cal p={single} lang={lang} />
        </div>
      ) : (
        <div className="rm-card-prices">
          {item.prices.map((p, i) => (
            <div key={i} className="rm-card-price-line">
              <span className="rm-price-label">{label(p.label)}</span>
              <Amount p={p} lang={lang} />
              <AddControl item={item} p={p} lang={lang} />
              <Cal p={p} lang={lang} inline />
            </div>
          ))}
        </div>
      )}
      {item.allergens && item.allergens.length > 0 && (
        <p className="rm-allergens">
          {ui.contains[lang]}: {item.allergens.map((a) => ui.allergen[a]?.[lang] ?? a).join(sep(lang))}
        </p>
      )}
    </article>
  );
}

/* Leather plaque header cut from the printed menu; the title is real text on top of it. */
function Plaque({ title, id }: { title: string; id?: string }) {
  return (
    <header className="rm-plaque">
      <h2 id={id}>
        <span>{title}</span>
      </h2>
    </header>
  );
}

export default function RestaurantMenu({
  restaurant,
  sections,
}: {
  restaurant: MenuRestaurantInfo;
  sections: MenuSection[];
}) {
  const [lang, setLang] = useState<Lang>("en");
  const [q, setQ] = useState("");
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const chipsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const wa = restaurant.whatsapp?.replace(/[^0-9]/g, "");

  // ── WhatsApp ordering ──
  const orderingOn = !!restaurant.ordering?.enabled && !!wa;
  const orderTypes: OrderType[] = restaurant.ordering?.types?.length ? restaurant.ordering.types : ["dinein", "takeaway"];
  const cart = useCartState(restaurant.slug ?? restaurant.name, sections, orderingOn);
  const [cartOpen, setCartOpen] = useState(false);
  const itemsById = useMemo(() => new Map(sections.flatMap((s) => s.items).map((i) => [i.id, i])), [sections]);
  const RiyalAmount = ({ amount }: { amount: number }) => <Amount p={{ amount }} lang={lang} />;
  const waLink = (text: string) => (wa ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}` : undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "ar") setLang(saved);
      else if (navigator.language?.toLowerCase().startsWith("ar")) setLang("ar");
    } catch {}
  }, []);

  const switchLang = () => {
    const next: Lang = lang === "en" ? "ar" : "en";
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  };

  const filtered = useMemo(() => {
    const n = normalize(q.trim());
    if (!n) return sections;
    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter((it) =>
          normalize(
            [it.name, it.nameAr, it.desc, it.descAr, ...(it.includes?.flatMap((x) => [x.en, x.ar]) ?? [])]
              .filter(Boolean)
              .join(" ")
          ).includes(n)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [q, sections]);

  // highlight the category in view
  useEffect(() => {
    if (q || !rootRef.current) return;
    const els = Array.from(rootRef.current.querySelectorAll<HTMLElement>("section.rm-cat"));
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting);
        if (vis.length) {
          const top = vis.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          const id = (top.target as HTMLElement).dataset.cat;
          if (id) setActive(id);
        }
      },
      { rootMargin: "-140px 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [q, lang]);

  // keep the active chip visible
  useEffect(() => {
    const bar = chipsRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip) return;
    bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const goTo = (id: string) => {
    setActive(id);
    document.getElementById(`rm-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const th = restaurant.theme ?? {};
  const fr = restaurant.frame ?? {};
  const ornate = th.style === "ornate" && !!fr.top;
  const css = (u?: string) => (u ? `url("${u}")` : undefined);
  const style = {
    "--rm-frame-top": css(fr.top),
    "--rm-frame-bottom": css(fr.bottom),
    "--rm-frame-side": css(fr.side),
    "--rm-frame-side-r": css(fr.sideR ?? fr.side),
    "--rm-bg": th.bg,
    "--rm-surface": th.surface,
    "--rm-text": th.text,
    "--rm-muted": th.muted,
    "--rm-accent": th.accent,
    "--rm-accent-soft": th.accentSoft,
    "--rm-highlight": th.highlight,
    "--rm-line": th.line,
  } as CSSProperties;

  const hours = pick(lang, restaurant.hours, restaurant.hoursAr);
  const catering = restaurant.cateringText ? pick(lang, restaurant.cateringText.en, restaurant.cateringText.ar) : "";

  return (
    <CartProvider value={cart.api}>
    <div
      ref={rootRef}
      id="menu"
      className={`rm ${display.variable} ${arabic.variable} ${script.variable} ${caps.variable}${ornate ? " rm-ornate" : ""}${lang === "ar" ? " rm-ar" : ""}`}
      style={style}
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {ornate ? (
        <section className="rm-page rm-intro">
          <Plaque title={ui.menu[lang]} />
          <div className="rm-page-body">
            {restaurant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="rm-intro-logo" src={restaurant.logoUrl} alt="" width={400} height={400} />
            )}
            <p className="rm-intro-name" lang="en" dir="ltr">
              {restaurant.name}
            </p>
            {lang === "ar" && restaurant.nameAr && <p className="rm-intro-name-ar">{restaurant.nameAr}</p>}
            {(restaurant.tagline || restaurant.taglineAr) && (
              <p className="rm-intro-tagline">{pick(lang, restaurant.tagline, restaurant.taglineAr)}</p>
            )}
            {fr.divider && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="rm-divider" src={fr.divider} alt="" />
            )}
            {restaurant.footerNotes?.[0] && (
              <p className="rm-intro-story">{pick(lang, restaurant.footerNotes[0].en, restaurant.footerNotes[0].ar)}</p>
            )}
            {(restaurant.address || restaurant.addressAr) && (
              <p className="rm-intro-story">{pick(lang, restaurant.address, restaurant.addressAr)}</p>
            )}
            {hours && (
              <div className="rm-intro-hours">
                <p>{ui.timings[lang]}</p>
                <p>{hours}</p>
              </div>
            )}
          </div>
          <p className="rm-intro-band">{ui.dailyIntake[lang]}</p>
        </section>
      ) : (
        <div className="rm-top">
          <div className="rm-title">
            <h2>{ui.menu[lang]}</h2>
            {lang === "ar" && restaurant.nameAr && <p>{restaurant.nameAr}</p>}
            {hours && <p className="rm-hours">{hours}</p>}
          </div>
        </div>
      )}

      <nav className="rm-bar" aria-label={lang === "ar" ? "أقسام القائمة" : "Menu sections"}>
        <div className="rm-search-row">
          <div className="rm-search">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ui.search[lang]} aria-label={ui.search[lang]} />
            {q && (
              <button type="button" className="rm-clear" onClick={() => setQ("")}>
                {ui.clear[lang]}
              </button>
            )}
          </div>
          <button type="button" className="rm-lang" onClick={switchLang} lang={lang === "en" ? "ar" : "en"}>
            {ui.langSwitch[lang]}
          </button>
        </div>
        {!q && (
          <div className="rm-chips" ref={chipsRef}>
            {sections.map((s) => (
              <button
                type="button"
                key={s.id}
                data-chip={s.id}
                className={`rm-chip${active === s.id ? " is-active" : ""}`}
                aria-current={active === s.id ? "true" : undefined}
                onClick={() => goTo(s.id)}
              >
                {pick(lang, s.name, s.nameAr)}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="rm-list">
        {filtered.length === 0 ? (
          <p className="rm-empty">{ui.noResults[lang]}</p>
        ) : (
          filtered.map((s) => {
            const reserve = s.items.some((it) => it.imageUrl);
            const title = pick(lang, s.name, s.nameAr);
            const note = s.note ? <p className="rm-cat-note">{pick(lang, s.note, s.noteAr)}</p> : null;

            if (ornate) {
              const allPhotos = s.items.every((it) => it.imageUrl);
              return (
                <section key={s.id} className="rm-cat rm-page" id={`rm-cat-${s.id}`} data-cat={s.id} aria-labelledby={`rm-h-${s.id}`}>
                  <Plaque title={title} id={`rm-h-${s.id}`} />
                  <div className="rm-page-body">
                    {note}
                    {allPhotos ? (
                      <div className="rm-grid">
                        {s.items.map((it) => (
                          <Card key={it.id} item={it} lang={lang} />
                        ))}
                      </div>
                    ) : (
                      s.items.map((it) => <Dish key={it.id} item={it} lang={lang} reserve={reserve} />)
                    )}
                  </div>
                  {fr.divider && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="rm-divider rm-page-end" src={fr.divider} alt="" />
                  )}
                </section>
              );
            }

            return (
              <section key={s.id} className="rm-cat" id={`rm-cat-${s.id}`} data-cat={s.id} aria-labelledby={`rm-h-${s.id}`}>
                <header className="rm-cat-head">
                  <h2 id={`rm-h-${s.id}`}>{title}</h2>
                  {note}
                </header>
                {s.items.map((it) => (
                  <Dish key={it.id} item={it} lang={lang} reserve={reserve} />
                ))}
              </section>
            );
          })
        )}
      </div>

      {catering &&
        (ornate ? (
          <section className="rm-page rm-catering-page">
            <Plaque title={ui.cateringTitle[lang]} />
            <div className="rm-page-body">
              <p className="rm-catering-text">{catering}</p>
              {wa && (
                <a className="rm-btn" href={waLink(ui.cateringGreeting[lang])} target="_blank" rel="noreferrer">
                  {ui.cateringCta[lang]}
                </a>
              )}
            </div>
          </section>
        ) : (
          <section className="rm-catering">
            <h2>{ui.cateringTitle[lang]}</h2>
            <p>{catering}</p>
            {wa && (
              <a className="rm-btn" href={waLink(ui.cateringGreeting[lang])} target="_blank" rel="noreferrer">
                {ui.cateringCta[lang]}
              </a>
            )}
          </section>
        ))}

      <footer className="rm-foot">
        {restaurant.footerNotes?.slice(ornate ? 1 : 0).map((n, i) => (
          <p key={i} className={i === 0 && !ornate ? "rm-foot-lead" : undefined}>
            {pick(lang, n.en, n.ar)}
          </p>
        ))}
        {!ornate && (restaurant.address || restaurant.addressAr) && <p>{pick(lang, restaurant.address, restaurant.addressAr)}</p>}
        <p>{ui.vat[lang]}</p>
        {!ornate && <p>{ui.dailyIntake[lang]}</p>}
        <p>{ui.allergyNote[lang]}</p>
      </footer>

      {ornate && fr.bottom && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rm-frame-bottom" src={fr.bottom} alt="" />
      )}

      {orderingOn && (
        <>
          <CartBar lines={cart.lines} lang={lang} onOpen={() => setCartOpen(true)} RiyalAmount={RiyalAmount} />
          <CartSheet
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            lines={cart.lines}
            lang={lang}
            types={orderTypes}
            restaurantName={restaurant.name}
            whatsapp={wa!}
            add={cart.add}
            dec={cart.dec}
            removeLine={cart.removeLine}
            clear={cart.clear}
            itemsById={itemsById}
            RiyalAmount={RiyalAmount}
          />
        </>
      )}

      {wa && !(orderingOn && cart.lines.length > 0) && (
        <a className="rm-fab" href={waLink(ui.whatsappGreeting[lang])} target="_blank" rel="noreferrer" aria-label={ui.orderWhatsapp[lang]}>
          <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
            <path
              fill="currentColor"
              d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.7 12.7-12.6C28.8 8.6 23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.1 1.2-4.2-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.6C5.2 9.8 10 5.1 16 5.1s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8 0 1.6 1.2 3.2 1.4 3.4.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"
            />
          </svg>
        </a>
      )}
    </div>
    </CartProvider>
  );
}
