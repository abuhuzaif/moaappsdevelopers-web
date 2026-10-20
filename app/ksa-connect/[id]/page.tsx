import { notFound } from "next/navigation";
import ListingDetailClient from "./ListingDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/**
 * Checks on the server whether the listing still exists, using Firestore's
 * REST API (more reliable on the server than the browser SDK).
 * Returns true = exists, false = missing, null = couldn't tell.
 */
async function listingExists(id: string): Promise<boolean | null> {
  if (!PROJECT_ID) return null;
  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/listings/` +
      `${encodeURIComponent(id)}?mask.fieldPaths=title${API_KEY ? `&key=${API_KEY}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return false;
    if (res.ok) return true;
    // 403: security rules hide missing/private docs from anonymous reads —
    // let the client page decide (it shows <ExpiredAd /> when the ad is gone).
    if (res.status === 403) return null;
    console.warn(`listingExists(${id}): Firestore replied ${res.status}`);
    return null;
  } catch (err) {
    console.warn(`listingExists(${id}) failed`, err);
    return null;
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id.length > 200) notFound();

  // notFound() must be called outside any try/catch (it works by throwing).
  // A missing (expired/deleted) ad shows ./not-found.tsx with a 404 status.
  const exists = await listingExists(id);
  if (exists === false) notFound();

  return <ListingDetailClient />;
}
