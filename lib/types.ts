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

export function formattedPrice(l: Listing): string {
  if (l.negotiable || !l.price) return "Price on request";
  if (l.category === 'Housing') return `${Math.round(l.price).toLocaleString('en-US')} SAR/month`;
  return `${Math.round(l.price).toLocaleString('en-US')} SAR`;
}
