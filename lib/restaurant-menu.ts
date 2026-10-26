import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Inline digital menu (Firestore) ─────────────────────────────
//  restaurants/{id}                 → menuCategories, menuTheme, ... (on the restaurant doc)
//  restaurants/{id}/menuItems/{id}  → one doc per dish
// Restaurants without menuItems keep the old menuUrl / "coming soon" behaviour.

export type L10n = { en: string; ar?: string };

export interface MenuPrice {
  amount: number;
  label?: string; // "single" | "full" | "breast" | "leg" | any custom text
  cal?: number; // kcal (SFDA)
}

export interface MenuCategory {
  id: string;
  name: string;
  nameAr?: string;
  note?: string;
  noteAr?: string;
  sort: number;
  image?: string; // category tile photo ("tiles" layout)
  day?: number; // day-of-week special (0 = Sunday … 6 = Saturday): shown first as "Today" on that day
}

export interface MenuItem {
  id: string;
  categoryId: string;
  sort: number;
  name: string;
  nameAr?: string;
  desc?: string;
  descAr?: string;
  includes?: L10n[];
  prices: MenuPrice[];
  imageUrl?: string;
  tags?: string[]; // "new" | "signature"
  allergens?: string[]; // "gluten" | "milk" | "egg" | "fish" | "soy" | "sesame" | ...
}

export interface MenuSection extends MenuCategory {
  items: MenuItem[];
}

export interface MenuTheme {
  style?: "default" | "ornate" | "classic" | "poster"; // poster = black & gold printed-poster look with dotted price lines (Biryani Nation) // ornate = dark printed look (Quetta Grill), classic = cream printed look (Al Jalsa)
  layout?: "tiles"; // tiles = opens on a grid of category photos (Nawaab's); tap a tile to see its dishes
  bg?: string;
  surface?: string;
  text?: string;
  muted?: string;
  accent?: string;
  accentSoft?: string;
  highlight?: string;
  line?: string;
}

/** Images cut from the restaurant's printed menu, used by the "ornate" style. */
export interface MenuFrame {
  top?: string; // header band with blank plaque (category title is drawn on it)
  bottom?: string; // closing band (logo emblem)
  side?: string; // left border strip (tiles vertically)
  sideR?: string; // right border strip
  divider?: string; // ornament line between pages (PNG)
  corner?: string; // "classic": corner ornament (PNG, top-left orientation)
  flourish?: string; // "classic": ornament divider under the logo (PNG)
  logoFull?: string; // "classic": logo with restaurant name (PNG)
}

export type OrderType = "dinein" | "takeaway" | "delivery";

/** WhatsApp ordering (cart → WhatsApp message). Off unless enabled. */
export interface MenuOrdering {
  enabled?: boolean;
  types?: OrderType[]; // order of buttons; first is the default
}

/** Restaurant info the menu component needs (plain, serialisable). */
export interface MenuRestaurantInfo {
  name: string;
  slug?: string;
  ordering?: MenuOrdering;
  instagram?: string; // handle without @
  logoUrl?: string;
  frame?: MenuFrame;
  nameAr?: string;
  tagline?: string;
  taglineAr?: string;
  address?: string;
  addressAr?: string;
  hours?: string;
  hoursAr?: string;
  phone?: string;
  whatsapp?: string;
  theme?: MenuTheme;
  footerNotes?: L10n[];
  cateringText?: L10n;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

function toL10nList(v: unknown): L10n[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: L10n[] = [];
  for (const x of v) {
    const en = str((x as any)?.en);
    if (en) out.push({ en, ar: str((x as any)?.ar) });
  }
  return out.length ? out : undefined;
}

export function parseCategories(raw: unknown): MenuCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((c: any, i: number) => ({
      id: String(c?.id ?? ""),
      name: str(c?.name) ?? "",
      nameAr: str(c?.nameAr),
      note: str(c?.note),
      noteAr: str(c?.noteAr),
      sort: num(c?.sort) ?? i * 10,
      image: str(c?.image),
      day: typeof c?.day === "number" && c.day >= 0 && c.day <= 6 ? c.day : undefined,
    }))
    .filter((c) => c.id && c.name)
    .sort((a, b) => a.sort - b.sort);
}

/** Loads menuItems and groups them by the restaurant's menuCategories. */
export async function getMenuSections(restaurantId: string, categories: MenuCategory[]): Promise<MenuSection[]> {
  const snap = await getDocs(collection(db, "restaurants", restaurantId, "menuItems"));
  if (snap.empty) return [];

  const items: MenuItem[] = [];
  snap.forEach((d) => {
    const x = d.data();
    if (x.isAvailable === false) return;
    const prices: MenuPrice[] = [];
    if (Array.isArray(x.prices)) {
      for (const p of x.prices) {
        const amount = num(p?.amount);
        if (amount != null) prices.push({ amount, label: str(p?.label), cal: num(p?.cal) });
      }
    }
    items.push({
      id: d.id,
      categoryId: String(x.categoryId ?? ""),
      sort: num(x.sort) ?? 0,
      name: str(x.name) ?? d.id,
      nameAr: str(x.nameAr),
      desc: str(x.desc),
      descAr: str(x.descAr),
      includes: toL10nList(x.includes),
      prices,
      imageUrl: str(x.imageUrl),
      tags: Array.isArray(x.tags) ? x.tags.filter((t: unknown) => typeof t === "string") : undefined,
      allergens: Array.isArray(x.allergens) ? x.allergens.filter((t: unknown) => typeof t === "string") : undefined,
    });
  });

  const known = new Set(categories.map((c) => c.id));
  const sections: MenuSection[] = categories.map((c) => ({
    ...c,
    items: items.filter((i) => i.categoryId === c.id).sort((a, b) => a.sort - b.sort),
  }));

  // Items whose category is missing still show, at the end
  const orphans = items.filter((i) => !known.has(i.categoryId)).sort((a, b) => a.sort - b.sort);
  if (orphans.length) sections.push({ id: "other", name: "More", nameAr: "المزيد", sort: 99999, items: orphans });

  return sections.filter((s) => s.items.length > 0);
}
