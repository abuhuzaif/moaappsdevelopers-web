import { notFound } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import ListingDetailClient from "./ListingDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const serverDb = getFirestore(app);

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id.length > 200) notFound();

  try {
    const snap = await getDoc(doc(serverDb, "listings", id));
    if (!snap.exists()) notFound();
  } catch {
    // Keep the client fallback if Firestore is temporarily unavailable.
  }

  return <ListingDetailClient />;
}
