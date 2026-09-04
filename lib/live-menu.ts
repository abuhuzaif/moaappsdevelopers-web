import { supabase } from "./supabase";

export type LiveVariant = { id: string; label: string; price: number };

export type LiveItem = {
  id: string;
  name: string;
  nameAr: string | null;
  price: number | null;
  imageUrl: string | null;
  hasVariants: boolean;
  variants: LiveVariant[];
  isTodayOffer: boolean;
  offerPrice: number | null;
  isBestSeller: boolean;
};

export type LiveSection = {
  cat: string;
  icon: string;
  items: LiveItem[];
};

export type Announcement = {
  message: string;
  textColor: string;
  fontStyle: string;
  isActive: boolean;
};

// Fallback emoji icons per category name, used until categories have their
// own icon column in Supabase (matches the icons the app previously used).
const CATEGORY_ICONS: Record<string, string> = {
  Appetizers: "🍟",
  Barbeque: "🔥",
  "Shinwari Karahi": "🍲",
  Nihari: "🥘",
  Curries: "🍛",
  "Biryani & Rice": "🍚",
  Rolls: "🌯",
  "Burgers & Sandwiches": "🍔",
  "Sandwiches (Grilled)": "🥪",
  Breakfast: "🍳",
  "Tandoori Bread": "🫓",
  Drinks: "🥤",
  Tacos: "🌮",
  Pizzas: "🍕",
  Fries: "🍟",
};

// Today's date as 'YYYY-MM-DD' in local time (matches Postgres `date` columns,
// which supabase-js returns as plain date strings — safe to compare lexically).
function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isWithinSchedule(
  startDate: string | null,
  endDate: string | null
): boolean {
  const today = todayLocalISO();
  if (startDate && today < startDate) return false;
  if (endDate && today > endDate) return false;
  return true;
}

export async function getLiveMenu(): Promise<LiveSection[]> {
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });

  if (catErr || !categories) {
    console.error("Failed to load categories:", catErr);
    return [];
  }

  const { data: items, error: itemsErr } = await supabase
    .from("menu_items")
    .select(
      "id, category_id, name, name_ar, price, image_url, has_variants, is_available, is_today_offer, offer_price, offer_start_date, offer_end_date, is_best_seller"
    )
    .eq("is_available", true)
    .order("name", { ascending: true });

  if (itemsErr || !items) {
    console.error("Failed to load menu items:", itemsErr);
    return [];
  }

  const itemIds = items.map((i) => i.id);
  let variants: any[] = [];
  if (itemIds.length > 0) {
    const { data: variantRows, error: varErr } = await supabase
      .from("item_variants")
      .select("id, menu_item_id, label, price, sort_order")
      .in("menu_item_id", itemIds)
      .order("sort_order", { ascending: true });
    if (varErr) {
      console.error("Failed to load variants:", varErr);
    } else {
      variants = variantRows ?? [];
    }
  }

  const variantsByItem = new Map<string, LiveVariant[]>();
  for (const v of variants) {
    const list = variantsByItem.get(v.menu_item_id) ?? [];
    list.push({ id: v.id, label: v.label, price: Number(v.price) });
    variantsByItem.set(v.menu_item_id, list);
  }

  const sections: LiveSection[] = categories.map((cat) => {
    const catItems: LiveItem[] = items
      .filter((i) => i.category_id === cat.id)
      .map((i) => {
        const itemVariants = variantsByItem.get(i.id) ?? [];
        const rawIsTodayOffer = (i.is_today_offer as boolean) ?? false;
        const effectiveIsTodayOffer =
          rawIsTodayOffer &&
          isWithinSchedule(
            i.offer_start_date as string | null,
            i.offer_end_date as string | null
          );

        return {
          id: i.id,
          name: i.name,
          nameAr: (i.name_ar as string) ?? null,
          price: i.price != null ? Number(i.price) : null,
          imageUrl: i.image_url ?? null,
          hasVariants: (i.has_variants as boolean) ?? itemVariants.length > 0,
          variants: itemVariants,
          isTodayOffer: effectiveIsTodayOffer,
          offerPrice: i.offer_price != null ? Number(i.offer_price) : null,
          isBestSeller: (i.is_best_seller as boolean) ?? false,
        };
      });

    return {
      cat: cat.name as string,
      icon: CATEGORY_ICONS[cat.name as string] ?? "🍽️",
      items: catItems,
    };
  });

  // Only keep categories that have at least one visible (available) item
  return sections.filter((s) => s.items.length > 0);
}

export async function getAnnouncement(): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from("app_announcements")
    .select("message, text_color, font_style, is_active, start_date, end_date")
    .eq("id", "main")
    .maybeSingle();

  if (error || !data) return null;

  const rawIsActive = (data.is_active as boolean) ?? false;
  const effectiveIsActive =
    rawIsActive &&
    isWithinSchedule(
      data.start_date as string | null,
      data.end_date as string | null
    );

  return {
    message: (data.message as string) ?? "",
    textColor: (data.text_color as string) ?? "#FFD700",
    fontStyle: (data.font_style as string) ?? "bold",
    isActive: effectiveIsActive,
  };
}