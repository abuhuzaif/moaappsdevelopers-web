import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ListingDetailClient from "./ListingDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id.length > 200) notFound();

  try {
    const snap = await getDoc(doc(db, "listings", id));
    if (!snap.exists()) notFound();
  } catch {
    // Preserve the existing client-side fallback if Firestore is temporarily unavailable.
  }

  return <ListingDetailClient />;
}
