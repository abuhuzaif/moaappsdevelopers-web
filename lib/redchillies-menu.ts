// Urban Red Chillies — live menu from the restaurant's own Supabase (the same data the
// Red Chillies owner app manages). Used by myksaconnect.com/redchillies.
// Read with the public (publishable) key; Row Level Security on Supabase decides access.

export const RC_SUPABASE_URL = "https://fnrgsthkoackburjudsz.supabase.co";
export const RC_SUPABASE_KEY = "sb_publishable_HfiaYa-LUC4cSECUmrTiZg_0WZnyju2";

export type RcVariant = { id: string; label: string; price: number };
export type RcItem = {
  id: string;
  name: string;
  nameAr: string | null;
  price: number | null;
  imageUrl: string | null;
  variants: RcVariant[];
  isTodayOffer: boolean;
  offerPrice: number | null;
  isBestSeller: boolean;
  calories: string | null; // "450", "450 / 760" (one per size)
};
export type RcSection = { id: string; cat: string; icon: string; items: RcItem[] };
export type RcAnnouncement = { message: string; textColor: string; bold: boolean } | null;

const ICONS: Record<string, string> = {
  Appetizers: "🍟", Barbeque: "🔥", "Shinwari Karahi": "🍲", Nihari: "🥘", Curries: "🍛",
  "Biryani & Rice": "🍚", Rolls: "🌯", "Burgers & Sandwiches": "🍔", "Sandwiches (Grilled)": "🥪",
  Breakfast: "🍳", "Tandoori Bread": "🫓", Drinks: "🥤", Tacos: "🌮", Pizzas: "🍕", Fries: "🍟",
  "Dum Biryani": "🍚", "Mutton Curries": "🍖", "Chicken Curries": "🍗", "Weekend Special": "⭐",
  Vegetarian: "🥗", "Rice & Noodles": "🍜",
};

async function rest<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${RC_SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: RC_SUPABASE_KEY, Accept: "application/json" },
      next: { revalidate: 60 }, // owner-app changes show within a minute
    });
    if (!res.ok) {
      console.warn(`Red Chillies menu: ${path} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.warn("Red Chillies menu fetch failed", e);
    return null;
  }
}

/** Riyadh date "YYYY-MM-DD" (offer start/end dates are plain dates). */
function todayRiyadh() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
}
const inWindow = (start: string | null, end: string | null) => {
  const t = todayRiyadh();
  return !(start && t < start) && !(end && t > end);
};

export async function getRedChilliesMenu(): Promise<RcSection[]> {
  type Cat = { id: string; name: string; sort_order: number };
  type Item = {
    id: string; category_id: string; name: string; name_ar: string | null; price: number | null;
    image_url: string | null; has_variants: boolean | null; is_today_offer: boolean | null; offer_price: number | null;
    offer_start_date: string | null; offer_end_date: string | null; is_best_seller: boolean | null; calories: string | null;
  };
  type Var = { id: string; menu_item_id: string; label: string; price: number; sort_order: number | null };

  const [cats, items] = await Promise.all([
    rest<Cat[]>("categories?select=id,name,sort_order&order=sort_order.asc"),
    rest<Item[]>(
      "menu_items?select=id,category_id,name,name_ar,price,image_url,has_variants,is_today_offer,offer_price,offer_start_date,offer_end_date,is_best_seller,calories&is_available=eq.true&order=name.asc"
    ),
  ]);
  if (!cats || !items) return [];

  const vars = (await rest<Var[]>("item_variants?select=id,menu_item_id,label,price,sort_order&order=sort_order.asc")) ?? [];
  const byItem = new Map<string, RcVariant[]>();
  for (const v of vars) {
    const list = byItem.get(v.menu_item_id) ?? [];
    list.push({ id: v.id, label: v.label, price: Number(v.price) });
    byItem.set(v.menu_item_id, list);
  }

  return cats
    .map((c) => ({
      id: c.id,
      cat: c.name,
      icon: ICONS[c.name] ?? "🍽️",
      items: items
        .filter((i) => i.category_id === c.id)
        .map((i) => ({
          id: i.id,
          name: i.name,
          nameAr: i.name_ar ?? null,
          price: i.price != null ? Number(i.price) : null,
          imageUrl: i.image_url ?? null,
          variants: byItem.get(i.id) ?? [],
          isTodayOffer: !!i.is_today_offer && inWindow(i.offer_start_date, i.offer_end_date),
          offerPrice: i.offer_price != null ? Number(i.offer_price) : null,
          isBestSeller: !!i.is_best_seller,
          calories: i.calories != null && String(i.calories).trim() ? String(i.calories).trim() : null,
        })),
    }))
    .filter((s) => s.items.length > 0);
}

export async function getRedChilliesAnnouncement(): Promise<RcAnnouncement> {
  type A = { message: string | null; text_color: string | null; font_style: string | null; is_active: boolean; start_date: string | null; end_date: string | null };
  const rows = await rest<A[]>("app_announcements?select=message,text_color,font_style,is_active,start_date,end_date&id=eq.main");
  const a = rows?.[0];
  if (!a || !a.is_active || !a.message || !inWindow(a.start_date, a.end_date)) return null;
  return { message: a.message, textColor: a.text_color ?? "#FFD700", bold: (a.font_style ?? "bold").includes("bold") };
}
