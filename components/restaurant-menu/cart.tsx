"use client";

// WhatsApp ordering: customers build a cart from the menu and send it as a
// ready-made WhatsApp message to the restaurant. No backend, no payment.
// Enabled per restaurant with restaurants/{id}.ordering = { enabled: true, types: ["dinein","takeaway"] }

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MenuItem, MenuPrice, MenuSection, OrderType } from "@/lib/restaurant-menu";

type Lang = "en" | "ar";
type T = { en: string; ar: string };

export interface CartLine {
  key: string; // itemId|label
  itemId: string;
  name: string;
  nameAr?: string;
  label?: string;
  price: number;
  qty: number;
}

const t = {
  add: { en: "Add", ar: "أضف" },
  yourOrder: { en: "Your order", ar: "طلبك" },
  viewOrder: { en: "View order", ar: "عرض الطلب" },
  items: { en: "items", ar: "أصناف" },
  item: { en: "item", ar: "صنف" },
  total: { en: "Total", ar: "المجموع" },
  orderType: { en: "Order type", ar: "نوع الطلب" },
  dinein: { en: "Dine-in", ar: "داخل المطعم" },
  takeaway: { en: "Takeaway", ar: "سفري" },
  delivery: { en: "Delivery", ar: "توصيل" },
  table: { en: "Table number", ar: "رقم الطاولة" },
  name: { en: "Your name", ar: "اسمك" },
  nameOptional: { en: "Your name (optional)", ar: "اسمك (اختياري)" },
  note: { en: "Notes (e.g. less spicy)", ar: "ملاحظات (مثلاً: حار أقل)" },
  send: { en: "Send order on WhatsApp", ar: "أرسل الطلب عبر واتساب" },
  close: { en: "Close", ar: "إغلاق" },
  clear: { en: "Clear order", ar: "مسح الطلب" },
  remove: { en: "Remove", ar: "حذف" },
  needTable: { en: "Please enter your table number.", ar: "يرجى إدخال رقم الطاولة." },
  needName: { en: "Please enter your name for takeaway.", ar: "يرجى إدخال اسمك للطلب السفري." },
  sentTitle: { en: "Did your order go through on WhatsApp?", ar: "هل تم إرسال طلبك عبر واتساب؟" },
  sentYes: { en: "Yes, clear my order", ar: "نعم، امسح الطلب" },
  sentNo: { en: "No, keep it", ar: "لا، احتفظ به" },
  confirmNote: {
    en: "The restaurant will confirm your order on WhatsApp. Pay at the restaurant.",
    ar: "سيؤكد المطعم طلبك عبر واتساب. الدفع في المطعم.",
  },
  more: { en: "Add more", ar: "أضف المزيد" },
} satisfies Record<string, T>;

const priceLabel: Record<string, T> = {
  single: { en: "Single", ar: "فردي" },
  full: { en: "Full", ar: "كامل" },
  half: { en: "Half", ar: "نصف" },
  small: { en: "Small", ar: "صغير" },
  medium: { en: "Medium", ar: "وسط" },
  large: { en: "Large", ar: "كبير" },
  breast: { en: "Breast", ar: "صدر" },
  leg: { en: "Leg", ar: "فخذ" },
};
const labelText = (l: string | undefined, lang: Lang) => (l ? priceLabel[l]?.[lang] ?? l : "");
const lineName = (c: CartLine, lang: Lang) => (lang === "ar" && c.nameAr ? c.nameAr : c.name);

// ── Context ──────────────────────────────────────────────────
interface CartApi {
  enabled: boolean;
  qty: (key: string) => number;
  add: (item: MenuItem, p: MenuPrice) => void;
  dec: (key: string) => void;
}
const CartCtx = createContext<CartApi>({ enabled: false, qty: () => 0, add: () => {}, dec: () => {} });
export const useCart = () => useContext(CartCtx);
export const lineKey = (itemId: string, label?: string) => `${itemId}|${label ?? ""}`;

export function useCartState(slug: string, sections: MenuSection[], enabled: boolean) {
  const storeKey = `rm-cart-${slug}`;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  // restore, re-checking each line against today's menu (drops removed dishes, refreshes prices)
  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const saved = JSON.parse(raw) as CartLine[];
        const byId = new Map(sections.flatMap((s) => s.items).map((i) => [i.id, i]));
        const fresh: CartLine[] = [];
        for (const l of saved) {
          const it = byId.get(l.itemId);
          const p = it?.prices.find((x) => (x.label ?? "") === (l.label ?? ""));
          if (it && p && l.qty > 0) fresh.push({ ...l, name: it.name, nameAr: it.nameAr, price: p.amount });
        }
        setLines(fresh);
      }
    } catch {}
    setLoaded(true);
  }, [enabled, storeKey, sections]);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (lines.length) localStorage.setItem(storeKey, JSON.stringify(lines));
      else localStorage.removeItem(storeKey);
    } catch {}
  }, [lines, loaded, storeKey]);

  const add = useCallback((item: MenuItem, p: MenuPrice) => {
    const key = lineKey(item.id, p.label);
    setLines((ls) => {
      const found = ls.find((l) => l.key === key);
      if (found) return ls.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      return [...ls, { key, itemId: item.id, name: item.name, nameAr: item.nameAr, label: p.label, price: p.amount, qty: 1 }];
    });
  }, []);
  const dec = useCallback((key: string) => {
    setLines((ls) => ls.flatMap((l) => (l.key !== key ? [l] : l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [])));
  }, []);
  const removeLine = useCallback((key: string) => setLines((ls) => ls.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const api = useMemo<CartApi>(
    () => ({ enabled, qty: (k) => lines.find((l) => l.key === k)?.qty ?? 0, add, dec }),
    [enabled, lines, add, dec]
  );
  return { lines, api, add, dec, removeLine, clear };
}

export function CartProvider({ value, children }: { value: CartApi; children: ReactNode }) {
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

// ── "+ Add" / stepper next to a price ───────────────────────
export function AddControl({ item, p, lang }: { item: MenuItem; p: MenuPrice; lang: Lang }) {
  const cart = useCart();
  if (!cart.enabled) return null;
  const key = lineKey(item.id, p.label);
  const n = cart.qty(key);
  const what = `${lang === "ar" && item.nameAr ? item.nameAr : item.name}${p.label ? ` (${labelText(p.label, lang)})` : ""}`;
  if (n === 0) {
    return (
      <button type="button" className="rm-add" onClick={() => cart.add(item, p)} aria-label={`${t.add[lang]}: ${what}`}>
        <span aria-hidden>+</span>
      </button>
    );
  }
  return (
    <span className="rm-stepper" role="group" aria-label={what}>
      <button type="button" onClick={() => cart.dec(key)} aria-label="−1">
        −
      </button>
      <span aria-live="polite">{n}</span>
      <button type="button" onClick={() => cart.add(item, p)} aria-label="+1">
        +
      </button>
    </span>
  );
}

// ── WhatsApp message ────────────────────────────────────────
function buildMessage(opts: {
  restaurantName: string;
  lines: CartLine[];
  type: OrderType;
  table: string;
  name: string;
  note: string;
  pageUrl: string;
}) {
  const { restaurantName, lines, type, table, name, note, pageUrl } = opts;
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const typeText = type === "dinein" ? `Dine-in · Table ${table}` : type === "takeaway" ? "Takeaway" : "Delivery";
  const rows = lines.map((l) => {
    const label = l.label ? ` (${labelText(l.label, "en")})` : "";
    const ar = l.nameAr ? ` / ${l.nameAr}` : "";
    return `${l.qty} × ${l.name}${label}${ar} — SAR ${l.price * l.qty}`;
  });
  return [
    `🧾 *New order – ${restaurantName}*`,
    typeText,
    name ? `Name: ${name}` : "",
    "",
    ...rows,
    "",
    `*Total: SAR ${total}*`,
    note ? `Note: ${note}` : "",
    "",
    pageUrl,
  ]
    .filter((x, i, a) => !(x === "" && a[i - 1] === ""))
    .join("\n")
    .trim();
}

// ── Bottom bar ──────────────────────────────────────────────
export function CartBar({
  lines,
  lang,
  onOpen,
  RiyalAmount,
}: {
  lines: CartLine[];
  lang: Lang;
  onOpen: () => void;
  RiyalAmount: (props: { amount: number }) => ReactNode;
}) {
  const count = lines.reduce((s, l) => s + l.qty, 0);
  if (!count) return null;
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return (
    <button type="button" className="rm-cartbar" onClick={onOpen}>
      <span className="rm-cartbar-count">{count}</span>
      <span className="rm-cartbar-text">
        {t.viewOrder[lang]} · {count} {count === 1 ? t.item[lang] : t.items[lang]}
      </span>
      <span className="rm-cartbar-total">{RiyalAmount({ amount: total })}</span>
    </button>
  );
}

// ── Order sheet ─────────────────────────────────────────────
export function CartSheet({
  open,
  onClose,
  lines,
  lang,
  types,
  restaurantName,
  whatsapp,
  add,
  dec,
  removeLine,
  clear,
  itemsById,
  RiyalAmount,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  lang: Lang;
  types: OrderType[];
  restaurantName: string;
  whatsapp: string;
  add: (item: MenuItem, p: MenuPrice) => void;
  dec: (key: string) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  itemsById: Map<string, MenuItem>;
  RiyalAmount: (props: { amount: number }) => ReactNode;
}) {
  const [type, setType] = useState<OrderType>(types[0] ?? "dinein");
  const [table, setTable] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // ?table=5 in the QR link fills the table number
  useEffect(() => {
    try {
      const tb = new URLSearchParams(window.location.search).get("table");
      if (tb) {
        setTable(tb.slice(0, 10));
        if (types.includes("dinein")) setType("dinein");
      }
      const saved = localStorage.getItem("rm-customer-name");
      if (saved) setName(saved);
    } catch {}
  }, [types]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setSent(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  const send = () => {
    if (type === "dinein" && !table.trim()) return setError(t.needTable[lang]);
    if (type === "takeaway" && !name.trim()) return setError(t.needName[lang]);
    setError("");
    try {
      if (name.trim()) localStorage.setItem("rm-customer-name", name.trim());
    } catch {}
    const msg = buildMessage({
      restaurantName,
      lines,
      type,
      table: table.trim(),
      name: name.trim(),
      note: note.trim(),
      pageUrl: window.location.origin + window.location.pathname,
    });
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    setSent(true);
  };

  return (
    <div className="rm-sheet-backdrop" onClick={onClose}>
      <div
        className="rm-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rm-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rm-sheet-head">
          <h2 id="rm-sheet-title">{t.yourOrder[lang]}</h2>
          <button type="button" className="rm-sheet-close" onClick={onClose}>
            {t.close[lang]}
          </button>
        </div>

        {sent ? (
          <div className="rm-sent">
            <p>{t.sentTitle[lang]}</p>
            <div className="rm-sent-actions">
              <button
                type="button"
                className="rm-btn-solid"
                onClick={() => {
                  clear();
                  setNote("");
                  onClose();
                }}
              >
                {t.sentYes[lang]}
              </button>
              <button type="button" className="rm-btn-ghost" onClick={() => setSent(false)}>
                {t.sentNo[lang]}
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="rm-lines">
              {lines.map((l) => {
                const item = itemsById.get(l.itemId);
                const p = item?.prices.find((x) => (x.label ?? "") === (l.label ?? ""));
                return (
                  <li key={l.key} className="rm-line">
                    <div className="rm-line-info">
                      <span className="rm-line-name">{lineName(l, lang)}</span>
                      {l.label && <span className="rm-line-label">{labelText(l.label, lang)}</span>}
                      <button type="button" className="rm-line-remove" onClick={() => removeLine(l.key)}>
                        {t.remove[lang]}
                      </button>
                    </div>
                    <span className="rm-stepper">
                      <button type="button" onClick={() => dec(l.key)} aria-label="−1">
                        −
                      </button>
                      <span>{l.qty}</span>
                      <button type="button" onClick={() => item && p && add(item, p)} aria-label="+1" disabled={!item || !p}>
                        +
                      </button>
                    </span>
                    <span className="rm-line-total">{RiyalAmount({ amount: l.price * l.qty })}</span>
                  </li>
                );
              })}
            </ul>

            <div className="rm-sheet-total">
              <span>{t.total[lang]}</span>
              {RiyalAmount({ amount: total })}
            </div>

            {types.length > 1 && (
              <fieldset className="rm-types">
                <legend>{t.orderType[lang]}</legend>
                {types.map((ty) => (
                  <label key={ty} className={type === ty ? "is-on" : undefined}>
                    <input type="radio" name="rm-type" value={ty} checked={type === ty} onChange={() => setType(ty)} />
                    {t[ty][lang]}
                  </label>
                ))}
              </fieldset>
            )}

            {type === "dinein" && (
              <label className="rm-field">
                <span>{t.table[lang]}</span>
                <input inputMode="numeric" value={table} onChange={(e) => setTable(e.target.value.slice(0, 10))} />
              </label>
            )}
            <label className="rm-field">
              <span>{type === "takeaway" ? t.name[lang] : t.nameOptional[lang]}</span>
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} autoComplete="name" />
            </label>
            <label className="rm-field">
              <span>{t.note[lang]}</span>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} />
            </label>

            {error && (
              <p className="rm-error" role="alert">
                {error}
              </p>
            )}

            <button type="button" className="rm-send" onClick={send} disabled={!lines.length}>
              {t.send[lang]}
            </button>
            <p className="rm-sheet-note">{t.confirmNote[lang]}</p>
            <button type="button" className="rm-btn-ghost rm-more" onClick={onClose}>
              {t.more[lang]}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
