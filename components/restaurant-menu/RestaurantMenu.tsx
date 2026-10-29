"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Playfair_Display, Noto_Naskh_Arabic, Great_Vibes, Cinzel, Roboto_Condensed, Tajawal, Montserrat, Gochi_Hand } from "next/font/google";
import type { MenuItem, MenuPrice, MenuRestaurantInfo, MenuSection, OrderType } from "@/lib/restaurant-menu";
import { AddControl, CartBar, CartProvider, CartSheet, useCartState } from "./cart";
import "./restaurant-menu.css";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "700", "900"], variable: "--rm-font-display" });
const arabic = Noto_Naskh_Arabic({ subsets: ["arabic"], weight: ["400", "600", "700"], variable: "--rm-font-arabic" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--rm-font-script" });
const caps = Cinzel({ subsets: ["latin"], weight: ["400", "600"], variable: "--rm-font-caps" });
// "classic" style (cream printed menu, e.g. Al Jalsa) — not preloaded, only fetched when used
const condensed = Roboto_Condensed({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--rm-font-condensed", preload: false });
const arabicSans = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], variable: "--rm-font-arabic-sans", preload: false });
const lbSans = Montserrat({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--rm-font-lb", preload: false });
const lbHand = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--rm-font-hand", preload: false });

type Lang = "en" | "ar";
type T = { en: string; ar: string };
const LANG_KEY = "rm-lang";

// ── Fixed UI text ─────────────────────────────────────────────
const ui = {
  categories: { en: "Menu", ar: "القائمة" },
  categoriesHint: { en: "Tap a section to view it", ar: "اضغط على قسم لعرضه" },
  today: { en: "Today", ar: "اليوم" },
  note: { en: "Note", ar: "ملاحظة" },
  orderingFrom: { en: "Ordering from", ar: "الطلب من فرع" },
  chooseBranch: { en: "Choose your branch", ar: "اختر الفرع" },
  chooseBranchText: { en: "Your order will be sent on WhatsApp to the branch you pick.", ar: "سيتم إرسال طلبك عبر واتساب إلى الفرع الذي تختاره." },
  partyTitle: { en: "We accept party orders", ar: "نستقبل طلبات الحفلات" },
  partyText: { en: "Weddings, family gatherings & office events — biryani handi, haleem and more.", ar: "الأعراس والتجمعات العائلية ومناسبات العمل — برياني هاندي وحليم والمزيد." },
  partyBtn: { en: "Order on WhatsApp", ar: "اطلب عبر واتساب" },
  specialsFor: { en: "Daily specials", ar: "أطباق اليوم" },
  allCategories: { en: "All categories", ar: "كل الأقسام" },
  items: { en: "items", ar: "أصناف" },
  priceLabel: {
    single: { en: "Single", ar: "فردي" },
    full: { en: "Full", ar: "كامل" },
    half: { en: "Half", ar: "نصف" },
    small: { en: "Small", ar: "صغير" },
    medium: { en: "Medium", ar: "وسط" },
    large: { en: "Large", ar: "كبير" },
    breast: { en: "Breast", ar: "صدر" },
    leg: { en: "Leg", ar: "فخذ" },
    chicken: { en: "Chicken", ar: "دجاج" },
    paneer: { en: "Paneer", ar: "بانير" },
    veg: { en: "Veg", ar: "نباتي" },
    nonveg: { en: "Non-veg", ar: "غير نباتي" },
    seafood: { en: "Seafood", ar: "بحري" },
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
  kcal: { en: "Cal", ar: "سعرة" },
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
  menuAr: { en: "قائمة الطعام", ar: "قائمة الطعام" },
  followUs: { en: "Follow us on", ar: "تابعونا على" },
  vatIncluded: { en: "VAT included", ar: "شامل ضريبة القيمة المضافة" },
  thankYou: { en: "Thank you", ar: "شكراً لكم" },
  calShort: { en: "CAL", ar: "سعرة" },
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
      <span aria-hidden>🔥</span> {p.cal} {ui.kcal[lang]}
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
/** "tiles" layout dish card: photo on top, name, short description (Read more), price + Add. */
function TileCard({ item, lang }: { item: MenuItem; lang: Lang }) {
  const [failed, setFailed] = useState(false);
  const [more, setMore] = useState(false);
  const label = (l?: string) => (l ? ui.priceLabel[l]?.[lang] ?? l : "");
  const desc = item.desc ? pick(lang, item.desc, item.descAr) : "";
  return (
    <article className={`rm-tcard${item.imageUrl && !failed ? "" : " no-photo"}`} id={`rm-item-${item.id}`}>
      {item.imageUrl && !failed && (
        <div className="rm-tcard-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={pick(lang, item.name, item.nameAr)} loading="lazy" onError={() => setFailed(true)} />
        </div>
      )}
      <div className="rm-tcard-body">
        <h3 className="rm-tcard-name">{pick(lang, item.name, item.nameAr)}</h3>
        {desc && (
          <>
            <p className={`rm-tcard-desc${more ? " is-open" : ""}`}>{desc}</p>
            {desc.length > 70 && (
              <button type="button" className="rm-tcard-more" onClick={() => setMore((m) => !m)}>
                {more ? (lang === "ar" ? "إخفاء" : "Show less") : lang === "ar" ? "اقرأ المزيد" : "Read more"}
              </button>
            )}
          </>
        )}
        <div className="rm-tcard-prices">
          {item.prices.map((p, i) => (
            <div className="rm-tcard-price" key={i}>
              {p.label && <span className="rm-price-label">{label(p.label)}</span>}
              <Amount p={p} lang={lang} />
              <Cal p={p} lang={lang} inline />
              <AddControl item={item} p={p} lang={lang} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

const DAY_NAMES: Record<Lang, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ar: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
};

/** "poster" style: black & gold printed menu — banner headings, dotted price lines, + to add. */
function PosterBody({
  sections, q, lang, today, selDay, setSelDay, restaurant,
}: {
  sections: MenuSection[]; q: string; lang: Lang; today: number | null; selDay: number | null; setSelDay: (d: number) => void;
  restaurant: MenuRestaurantInfo;
}) {
  const wa = (restaurant.whatsapp || "").replace(/[^0-9]/g, "");
  const days = Array.from(new Set(sections.filter((s) => s.day != null).map((s) => s.day as number))).sort((a, b) => a - b);
  const shown = q ? sections : sections.filter((s) => s.day == null || s.day === selDay);
  const label = (l?: string) => (l ? ui.priceLabel[l]?.[lang] ?? l : "");
  return (
    <div className="rm-poster">
      {!q && days.length > 0 && (
        <div className="rm-pdays" role="tablist" aria-label={ui.specialsFor[lang]}>
          <span className="rm-pdays-label">{ui.specialsFor[lang]}</span>
          <div className="rm-pdays-row">
            {days.map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={d === selDay}
                className={`rm-pday${d === selDay ? " is-on" : ""}${d === today ? " is-today" : ""}`}
                onClick={() => setSelDay(d)}
              >
                {DAY_NAMES[lang][d]}
                {d === today && <small>{ui.today[lang]}</small>}
              </button>
            ))}
          </div>
        </div>
      )}
      {shown.length === 0 && <p className="rm-empty">{ui.noResults[lang]}</p>}
      {shown.map((s) => (
        <section key={s.id} className="rm-psec" id={`rm-cat-${s.id}`} data-cat={s.id} aria-labelledby={`rm-ph-${s.id}`}>
          {s.image && (
            <div className="rm-psec-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="rm-psec-img" src={s.image} alt="" loading="lazy" />
              {/* rising steam over the hot dish */}
              <span className="rm-steam" aria-hidden>
                <i /><i /><i /><i />
              </span>
            </div>
          )}
          <h2 className="rm-pbanner" id={`rm-ph-${s.id}`}>
            <span aria-hidden>✦</span> {pick(lang, s.name, s.nameAr)} <span aria-hidden>✦</span>
            {s.day != null && s.day === today && <em className="rm-ptoday">{ui.today[lang]}</em>}
          </h2>
          {(s.note || s.noteAr) && (
            <p className="rm-pnote">
              <b>{ui.note[lang]}:</b> {pick(lang, s.note, s.noteAr)}
            </p>
          )}
          <ul className="rm-plist">
            {s.items.flatMap((it) =>
              it.prices.map((p, i) => (
                <li key={`${it.id}-${i}`} className="rm-prow" id={i === 0 ? `rm-item-${it.id}` : undefined}>
                  <span className="rm-pname">
                    {pick(lang, it.name, it.nameAr)}
                    {p.label && <span className="rm-plabel"> – {label(p.label)}</span>}
                    {p.cal != null && <span className="rm-pcal"> 🔥 {p.cal} {ui.kcal[lang]}</span>}
                  </span>
                  <span className="rm-pdots" aria-hidden />
                  <span className="rm-pprice">
                    <Amount p={p} lang={lang} />
                  </span>
                  <AddControl item={it} p={p} lang={lang} />
                </li>
              ))
            )}
          </ul>
        </section>
      ))}
      {!q && wa && (
        <section className="rm-pparty">
          <p className="rm-pparty-icon" aria-hidden>🎉</p>
          <h2>{ui.partyTitle[lang]}</h2>
          <p>{ui.partyText[lang]}</p>
          <a className="rm-pparty-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
            💬 {ui.partyBtn[lang]} <span dir="ltr">+{wa}</span>
          </a>
        </section>
      )}
      <p className="rm-pfoot">Real Taste • Real Hyderabad</p>
    </div>
  );
}

const arNum = (n: number) => new Intl.NumberFormat("ar-SA").format(n);

/** "lunchbox" style: bright brochure look — yellow/green section pills, SAR | ريال | CAL. columns. */
function LunchBody({ sections, q, lang, tagline, footer }: { sections: MenuSection[]; q: string; lang: Lang; tagline?: string; footer?: string }) {
  const label = (l?: string) => (l ? ui.priceLabel[l]?.[lang] ?? l : "");
  return (
    <div className="rm-lb">
      <div className="rm-lb-band" aria-hidden>
        <span>{tagline || "Eat Good, Feel Good, Do Good"}</span>
      </div>
      {sections.length === 0 && <p className="rm-empty">{ui.noResults[lang]}</p>}
      {sections.map((s) => (
        <section key={s.id} className="rm-lbsec" id={`rm-cat-${s.id}`} data-cat={s.id} aria-labelledby={`rm-lh-${s.id}`}>
          {s.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="rm-lbsec-img" src={s.image} alt="" loading="lazy" />
          )}
          <h2 className="rm-lbpill" id={`rm-lh-${s.id}`}>{pick(lang, s.name, s.nameAr)}</h2>
          {(s.note || s.noteAr) && <p className="rm-lbnote">{pick(lang, s.note, s.noteAr)}</p>}
          <div className="rm-lbtable" role="table">
            <div className="rm-lbrow rm-lbhead" role="row">
              <span role="columnheader" />
              <span role="columnheader" className="rm-lbc-sar">SAR</span>
              <span role="columnheader" className="rm-lbc-sar">ريال</span>
              <span role="columnheader" className="rm-lbc-cal">CAL.</span>
              <span role="columnheader" aria-hidden />
            </div>
            {s.items.flatMap((it) =>
              it.prices.map((p, i) => (
                <div key={`${it.id}-${i}`} className="rm-lbrow" role="row" id={i === 0 ? `rm-item-${it.id}` : undefined}>
                  <span className="rm-lbname" role="cell">
                    {pick(lang, it.name, it.nameAr)}
                    {p.label && <span className="rm-lblabel"> – {label(p.label)}</span>}
                  </span>
                  <span className="rm-lbprice" role="cell">{p.amount}</span>
                  <span className="rm-lbprice-ar" role="cell">{arNum(p.amount)}</span>
                  <span className="rm-lbcal" role="cell">{p.cal ?? ""}</span>
                  <span role="cell"><AddControl item={it} p={p} lang={lang} /></span>
                </div>
              ))
            )}
          </div>
        </section>
      ))}
      {!q && footer ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rm-lb-footimg" src={footer} alt="" loading="lazy" />
      ) : (
        !q && <p className="rm-lb-foot">Essence of Hyderabad Cuisine</p>
      )}
    </div>
  );
}

function Plaque({ title, id }: { title: string; id?: string }) {
  return (
    <header className="rm-plaque">
      <h2 id={id}>
        <span>{title}</span>
      </h2>
    </header>
  );
}

// ── "classic" style (cream printed menu with copper badges) ─────────────
function formatIntlPhone(digits?: string) {
  const d = (digits ?? "").replace(/\D/g, "");
  if (d.startsWith("966") && d.length === 12) return `+966 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return d ? `+${d}` : "";
}

function Corners({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={pos} className={`rm-cl-corner rm-cl-corner-${pos}`} src={src} alt="" aria-hidden />
      ))}
    </>
  );
}

function ClassicBadge({ p, lang }: { p: MenuPrice; lang: Lang }) {
  const lbl = p.label ? ui.priceLabel[p.label]?.[lang] ?? p.label : "";
  return (
    <div className="rm-cl-price">
      <div className="rm-cl-badge">
        {lbl && <span className="rm-cl-badge-label">{lbl}</span>}
        <span className="rm-cl-badge-amount">
          <Riyal lang={lang} />
          <span>{p.amount}</span>
        </span>
      </div>
      {p.cal != null && (
        <span className="rm-cl-cal">
          {ui.calShort[lang]} {p.cal}
        </span>
      )}
    </div>
  );
}

function ClassicDish({ item, lang }: { item: MenuItem; lang: Lang }) {
  return (
    <article className="rm-cl-dish" id={`rm-item-${item.id}`}>
      <div className="rm-cl-dish-text">
        <h3>
          {pick(lang, item.name, item.nameAr)}
          {item.tags?.map((tag) =>
            ui.tag[tag] ? (
              <span key={tag} className={`rm-tag rm-tag-${tag}`}>
                {ui.tag[tag][lang]}
              </span>
            ) : null
          )}
        </h3>
        {item.desc && <p>{pick(lang, item.desc, item.descAr)}</p>}
        {item.allergens && item.allergens.length > 0 && (
          <p className="rm-allergens">
            {ui.contains[lang]}: {item.allergens.map((a) => ui.allergen[a]?.[lang] ?? a).join(sep(lang))}
          </p>
        )}
      </div>
      <div className="rm-cl-prices">
        {item.prices.map((p, i) => (
          <div className="rm-cl-price-row" key={i}>
            <ClassicBadge p={p} lang={lang} />
            <AddControl item={item} p={p} lang={lang} />
          </div>
        ))}
      </div>
    </article>
  );
}

function ClassicSection({ s, lang, corner }: { s: MenuSection; lang: Lang; corner?: string }) {
  const photos = s.items.filter((it) => it.imageUrl);
  const jump = (id: string) =>
    document.getElementById(`rm-item-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  return (
    <section className="rm-cat rm-cl-page" id={`rm-cat-${s.id}`} data-cat={s.id} aria-labelledby={`rm-h-${s.id}`}>
      <Corners src={corner} />
      <header className="rm-cl-head">
        <h2 id={`rm-h-${s.id}`} lang="en" dir="ltr">{s.name}</h2>
        {s.nameAr && <h2 className="rm-cl-head-ar" lang="ar" dir="rtl">{s.nameAr}</h2>}
      </header>
      {photos.length > 0 && (
        <div className="rm-cl-gallery">
          {photos.map((it) => (
            <button type="button" key={it.id} className="rm-cl-photo" onClick={() => jump(it.id)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={pick(lang, it.name, it.nameAr)} loading="lazy" width={260} height={260} />
              {it.nameAr && <span className="rm-cl-photo-ar" lang="ar" dir="rtl">{it.nameAr}</span>}
              <span className="rm-cl-photo-en" lang="en" dir="ltr">{it.name}</span>
            </button>
          ))}
        </div>
      )}
      <div className="rm-cl-list">
        {s.items.map((it) => (
          <ClassicDish key={it.id} item={it} lang={lang} />
        ))}
      </div>
      <footer className="rm-cl-page-foot">
        {s.note && <span className="rm-cl-pill">{pick(lang, s.note, s.noteAr)}</span>}
        <span className="rm-cl-vat">{ui.vatIncluded[lang]}</span>
      </footer>
    </section>
  );
}

function ClassicCover({
  restaurant,
  lang,
  thanks = false,
}: {
  restaurant: MenuRestaurantInfo;
  lang: Lang;
  thanks?: boolean;
}) {
  const fr = restaurant.frame ?? {};
  const phone = formatIntlPhone(restaurant.whatsapp);
  return (
    <section className={`rm-cl-page rm-cl-cover${thanks ? " rm-cl-thanks" : ""}`}>
      <Corners src={fr.corner} />
      {fr.logoFull ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rm-cl-logo" src={fr.logoFull} alt={restaurant.name} />
      ) : (
        <p className="rm-cl-name">{restaurant.name}</p>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {fr.flourish && <img className="rm-cl-flourish" src={fr.flourish} alt="" aria-hidden />}
      {thanks ? (
        <p className="rm-cl-big" lang={lang}>{ui.thankYou[lang]}</p>
      ) : (
        <>
          <p className="rm-cl-menu-ar" lang="ar" dir="rtl">قائمة الطعام</p>
          <p className="rm-cl-big" lang="en">MENU</p>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {fr.flourish && <img className="rm-cl-flourish rm-cl-flourish-flip" src={fr.flourish} alt="" aria-hidden />}
      {restaurant.instagram && (
        <p className="rm-cl-follow">
          <span>{ui.followUs[lang]}</span>
          <strong>{restaurant.instagram}</strong>
        </p>
      )}
      {phone && (
        <a className="rm-cl-phone" href={`https://wa.me/${restaurant.whatsapp?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" dir="ltr">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
            <path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.7 12.7-12.6C28.8 8.6 23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.1 1.2-4.2-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.6C5.2 9.8 10 5.1 16 5.1s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1z" />
          </svg>
          {phone}
        </a>
      )}
      {(restaurant.address || restaurant.addressAr) && (
        <p className="rm-cl-address">
          {restaurant.addressAr && <span lang="ar" dir="rtl">{restaurant.addressAr}</span>}
          {restaurant.address && <span lang="en" dir="ltr">{restaurant.address}</span>}
        </p>
      )}
      {!thanks && restaurant.hours && <p className="rm-cl-address">{pick(lang, restaurant.hours, restaurant.hoursAr)}</p>}
    </section>
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
  // "tiles" layout: null = category grid, otherwise the open category
  const tiles = restaurant.theme?.layout === "tiles";
  const [openCat, setOpenCat] = useState<string | null>(null);
  // day-of-week specials: today's (Riyadh time) goes first — computed on the client only
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const wd = new Date().toLocaleDateString("en-US", { weekday: "short", timeZone: "Asia/Riyadh" });
    setToday(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd));
  }, []);
  const [selDay, setSelDay] = useState<number | null>(null);
  useEffect(() => {
    if (today != null && selDay == null) setSelDay(today);
  }, [today, selDay]);
  const tileOrder = useMemo(() => {
    if (today == null) return sections;
    const t = sections.filter((s) => s.day === today);
    return [...t, ...sections.filter((s) => s.day !== today)];
  }, [sections, today]);
  const chipsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Branches: each branch has its own WhatsApp (customer picks one, remembered on this phone) ──
  const branches = restaurant.branches ?? [];
  const branchKey = `rm-branch-${restaurant.slug ?? restaurant.name}`;
  const [branchId, setBranchId] = useState<string | null>(null);
  const [branchAsk, setBranchAsk] = useState(false);
  useEffect(() => {
    if (!branches.length) return;
    if (branches.length === 1) return setBranchId(branches[0].id);
    let saved: string | null = null;
    try { saved = localStorage.getItem(branchKey); } catch {}
    if (saved && branches.some((b) => b.id === saved)) setBranchId(saved);
    else setBranchAsk(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchKey, branches.length]);
  const chooseBranch = (id: string) => {
    setBranchId(id);
    setBranchAsk(false);
    try { localStorage.setItem(branchKey, id); } catch {}
  };
  const branch = branches.find((b) => b.id === branchId);
  const wa = (branches.length ? branch?.whatsapp : restaurant.whatsapp)?.replace(/[^0-9]/g, "");

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

  // tiles: #category in the URL, so the phone's Back button returns to the grid
  useEffect(() => {
    if (!tiles) return;
    const read = () => {
      const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      setOpenCat(sections.some((s) => s.id === h) ? h : null);
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [tiles, sections]);

  const openCategory = (id: string | null) => {
    setOpenCat(id);
    setQ("");
    if (id) setActive(id);
    try {
      const url = id ? `#${id}` : window.location.pathname + window.location.search;
      if (id && openCat) window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    } catch {}
    requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const goTo = (id: string) => {
    if (tiles) return openCategory(id);
    setActive(id);
    document.getElementById(`rm-cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const th = restaurant.theme ?? {};
  const fr = restaurant.frame ?? {};
  const ornate = th.style === "ornate" && !!fr.top;
  const classic = th.style === "classic";
  const poster = th.style === "poster";
  const lunch = th.style === "lunchbox";
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
      className={`rm ${display.variable} ${arabic.variable} ${script.variable} ${caps.variable}${lunch ? ` ${lbSans.variable} ${lbHand.variable} rm-lunch` : ""}${poster ? " rm-posterstyle" : ""}${classic ? ` ${condensed.variable} ${arabicSans.variable} rm-classic` : ""}${ornate ? " rm-ornate" : ""}${lang === "ar" ? " rm-ar" : ""}`}
      style={style}
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {classic ? (
        <ClassicCover restaurant={restaurant} lang={lang} />
      ) : ornate ? (
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
      ) : poster ? (
        <header className={`rm-phead${fr.top ? " has-banner" : ""}`}>
          {fr.top ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="rm-phead-banner" src={fr.top} alt={restaurant.name} />
          ) : (
            <>
              <p className="rm-phead-crown" aria-hidden>♛</p>
              <h2 className="rm-phead-name" lang="en" dir="ltr">{restaurant.name}</h2>
              {(restaurant.tagline || restaurant.taglineAr) && (
                <p className="rm-phead-tag">{pick(lang, restaurant.tagline, restaurant.taglineAr)}</p>
              )}
            </>
          )}
          {lang === "ar" && restaurant.nameAr && <p className="rm-phead-name-ar">{restaurant.nameAr}</p>}
          <div className="rm-phead-pills">
            {hours && <span>🕒 {hours}</span>}
            {sections
              .filter((x) => x.day == null && (x.note || x.noteAr))
              .slice(0, 2)
              .map((x) => (
                <span key={x.id}>🍲 {pick(lang, x.name, x.nameAr)}: {pick(lang, x.note, x.noteAr)}</span>
              ))}
            {restaurant.whatsapp && <span>🎉 {ui.partyTitle[lang]}</span>}
          </div>
        </header>
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
        {!q && !poster && (!tiles || openCat) && (
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

      {branches.length > 1 && (
        <div className="rm-branchbar">
          <span>📍 {ui.orderingFrom[lang]}:</span>
          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`rm-branchbtn${b.id === branchId ? " is-on" : ""}`}
              aria-pressed={b.id === branchId}
              onClick={() => chooseBranch(b.id)}
            >
              {pick(lang, b.name, b.nameAr)}
            </button>
          ))}
          {branch && (
            <span className="rm-branchcontact">
              {branch.phone && (
                <a href={`tel:+${branch.whatsapp.replace(/[^0-9]/g, "")}`} dir="ltr">📞 {branch.phone}</a>
              )}
              <a
                className="rm-branchwa"
                href={`https://wa.me/${branch.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                💬 WhatsApp
              </a>
            </span>
          )}
        </div>
      )}

      {branchAsk && (
        <div className="rm-branchmodal" role="dialog" aria-modal="true" aria-label={ui.chooseBranch[lang]}>
          <div className="rm-branchcard">
            <h3>📍 {ui.chooseBranch[lang]}</h3>
            <p>{ui.chooseBranchText[lang]}</p>
            <div className="rm-branchopts">
              {branches.map((b) => (
                <button key={b.id} type="button" onClick={() => chooseBranch(b.id)}>
                  <b>{pick(lang, b.name, b.nameAr)}</b>
                  {b.phone && <small dir="ltr">{b.phone}</small>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lunch ? (
        <LunchBody sections={filtered} q={q} lang={lang} tagline={undefined} footer={fr.bottom} />
      ) : poster ? (
        <PosterBody sections={filtered} q={q} lang={lang} today={today} selDay={selDay ?? today ?? 0} setSelDay={setSelDay} restaurant={restaurant} />
      ) : tiles && !q && !openCat ? (
        <section className="rm-tiles-wrap" aria-labelledby="rm-tiles-h">
          <h2 id="rm-tiles-h" className="rm-tiles-title">{ui.categories[lang]}</h2>
          <p className="rm-tiles-hint">☝ {ui.categoriesHint[lang]}</p>
          <div className="rm-tiles">
            {tileOrder.map((s) => (
              <button type="button" key={s.id} className={`rm-tile${s.day != null && s.day === today ? " is-today" : ""}`} onClick={() => openCategory(s.id)}>
                {s.day != null && s.day === today && <span className="rm-tile-today">{ui.today[lang]}</span>}
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt="" loading="lazy" />
                )}
                <span className="rm-tile-name">{pick(lang, s.name, s.nameAr)}</span>
                <span className="rm-tile-count">{s.items.length} {ui.items[lang]}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
      <div className="rm-list">
        {tiles && !q && openCat && (
          <button type="button" className="rm-back" onClick={() => openCategory(null)}>
            {lang === "ar" ? "→" : "←"} {ui.allCategories[lang]}
          </button>
        )}
        {filtered.length === 0 ? (
          <p className="rm-empty">{ui.noResults[lang]}</p>
        ) : (
          (tiles && !q && openCat ? filtered.filter((x) => x.id === openCat) : filtered).map((s) => {
            const reserve = s.items.some((it) => it.imageUrl);
            const title = pick(lang, s.name, s.nameAr);
            const note = s.note ? <p className="rm-cat-note">{pick(lang, s.note, s.noteAr)}</p> : null;

            if (tiles) {
              return (
                <section key={s.id} className="rm-cat" id={`rm-cat-${s.id}`} data-cat={s.id} aria-labelledby={`rm-h-${s.id}`}>
                  <header className="rm-cat-head">
                    <h2 id={`rm-h-${s.id}`}>{title}</h2>
                    {note}
                  </header>
                  <div className="rm-tgrid">
                    {s.items.map((it) => (
                      <TileCard key={it.id} item={it} lang={lang} />
                    ))}
                  </div>
                </section>
              );
            }

            if (classic) {
              return <ClassicSection key={s.id} s={s} lang={lang} corner={fr.corner} />;
            }

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
      )}

      {classic && <ClassicCover restaurant={restaurant} lang={lang} thanks />}

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
        {restaurant.footerNotes?.slice(ornate ? 1 : classic ? restaurant.footerNotes.length : 0).map((n, i) => (
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
        <a className={`rm-fab${orderingOn ? " rm-fab-start" : ""}`} href={waLink(ui.whatsappGreeting[lang])} target="_blank" rel="noreferrer" aria-label={ui.orderWhatsapp[lang]}>
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
