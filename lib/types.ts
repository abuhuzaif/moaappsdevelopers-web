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

type PriceInfo = { category?: string; subCategory?: string; price?: number | null; negotiable?: boolean };

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

/** "1,500 SAR", "2,000 SAR/month" (rent, salary) — or the category's no-price label. */
export function priceTag(l: PriceInfo): string {
  const n = typeof l.price === "number" ? l.price : 0;
  if (!(n > 0)) return noPriceLabel(l);
  const monthly = l.category === "Housing" || isJob(l) ? "/month" : "";
  return `${Math.round(n).toLocaleString("en-US")} SAR${monthly}`;
}

/** Price on cards and the ad page ("" for a Community ad without a price). */
export function formattedPrice(l: Listing): string {
  return l.negotiable ? noPriceLabel(l) : priceTag(l);
}
