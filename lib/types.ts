// Mirrors lib/models/listing_model.dart from the Flutter app, so the
// website reads the exact same Firestore documents the app writes.
export interface Listing {
  id: string;
  category: string;
  subCategory: string;
  city: string;
  title: string;
  description: string;
  price: number;
  negotiable?: boolean;
  /** "per month", "per 3 months", "per 6 months", "per year", "Fixed price" (post form chips) */
  priceNote?: string | null;
  views?: number;
  location: string;
  phone: string;
  imageUrls: string[];
  userId: string;
  userName: string;
  userPhoto?: string | null;
  userEmail?: string | null;
  isFeatured?: boolean;
  status: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

type PriceInfo = {
  category?: string;
  subCategory?: string;
  price?: number | null;
  negotiable?: boolean;
  priceNote?: string | null;
};

const isJob = (l: PriceInfo) => l.category === "Jobs" || (l.category === "Classifieds" && l.subCategory === "Jobs");

/** What to show when an ad has no price — depends on the category ("" = show nothing). */
export function noPriceLabel(l: PriceInfo): string {
  if (isJob(l)) return "Now Hiring";
  if (l.category === "Community") return "";
  if (l.category === "Services") return "Get a Quote";
  if (l.category === "Housing") return "Rent on Request";
  if (l.category === "Classifieds" && l.subCategory === "Restaurants") return "View Menu & Order";
  return "Ask for Price";
}

/** Price period from the ad's priceNote → text after "SAR". null = no period chosen. */
function periodSuffix(note?: string | null): string | null {
  const t = (note ?? "").trim().toLowerCase();
  if (!t) return null;
  if (t === "fixed price") return "";
  if (t === "per month") return "/month";
  if (t === "per year") return "/year";
  const m = t.match(/^per (\d+) months?$/);
  if (m) return ` / ${m[1]} months`;
  return ` ${note!.trim()}`; // anything else the poster typed
}

/**
 * "1,500 SAR", "2,000 SAR/month", "1,800 SAR / 6 months", "24,000 SAR/year".
 * Uses the period the poster chose (priceNote); without one, rent and salaries
 * default to "/month" as before. No price → the category's no-price label.
 */
export function priceTag(l: PriceInfo): string {
  const n = typeof l.price === "number" ? l.price : 0;
  if (!(n > 0)) return noPriceLabel(l);
  const chosen = periodSuffix(l.priceNote);
  const suffix = chosen ?? (l.category === "Housing" || isJob(l) ? "/month" : "");
  return `${Math.round(n).toLocaleString("en-US")} SAR${suffix}`;
}

/** Price on cards and the ad page ("" for a Community ad without a price). */
export function formattedPrice(l: Listing): string {
  return l.negotiable ? noPriceLabel(l) : priceTag(l);
}