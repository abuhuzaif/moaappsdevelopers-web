// Imports the Khana Khazana menu (taken from their PlumQR page) into Firestore.
//
//   restaurants/khana-khazana                 â†’ restaurant doc (draft: isActive false, hidden true)
//   restaurants/khana-khazana/menuItems/{id}  â†’ one doc per dish (106 dishes)
//   Storage: restaurants/khana-khazana/menu/  â†’ dish photos, copied from PlumQR
//
// Run from the repo root:
//   npm i -D firebase-admin
//   node scripts/seed-khana-khazana.mjs --dry      (only prints, writes nothing)
//   node scripts/seed-khana-khazana.mjs            (writes to Firestore + Storage)
//
// Needs scripts/serviceAccount.json (Firebase Console â†’ Project settings â†’
// Service accounts â†’ Generate new private key). Never commit that file.

import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const DRY = process.argv.includes("--dry");
const BUCKET = process.env.BUCKET || "riyadhconnect-9520a.firebasestorage.app"; // or riyadhconnect-9520a.firebasestorage.app
const DOC_ID = "khana-khazana";

const data = JSON.parse(readFileSync(new URL("./khana-khazana-menu.json", import.meta.url), "utf8"));
const keyPath = new URL("./serviceAccount.json", import.meta.url);
if (!DRY && !existsSync(keyPath)) {
  console.error("scripts/serviceAccount.json not found. See the comment at the top of this file.");
  process.exit(1);
}

let db, bucket;
if (!DRY) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))),
    storageBucket: BUCKET,
  });
  db = getFirestore();
  bucket = getStorage().bucket();
}

/** Downloads a PlumQR photo and re-uploads it to our Storage; returns a public download URL. */
async function copyImage(srcUrl, destPath) {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`${res.status} for ${srcUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const token = randomUUID();
  await bucket.file(destPath).save(buf, {
    contentType: res.headers.get("content-type") || "image/jpeg",
    metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media&token=${token}`;
}

const r = data.restaurant;
console.log(`${r.name}: ${r.menuCategories.length} categories, ${data.menuItems.length} dishes${DRY ? " (dry run)" : ""}`);

// â”€â”€ Restaurant doc (merge, so fields you already filled in by hand are kept) â”€â”€
let logoUrl;
if (!DRY && r.logoSource) {
  try { logoUrl = await copyImage(r.logoSource, `restaurants/${DOC_ID}/logo.jpg`); }
  catch (e) { console.warn("logo:", e.message); }
}
const { logoSource, ...restaurantFields } = r;
if (!DRY) {
  await db.collection("restaurants").doc(DOC_ID).set(
    { ...restaurantFields, ...(logoUrl ? { logoUrl } : {}), updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// â”€â”€ Dishes â”€â”€
let ok = 0, noPhoto = 0;
for (const item of data.menuItems) {
  const { sourceImage, plumqrIds, ...fields } = item;
  let imageUrl;
  if (sourceImage && !DRY) {
    try { imageUrl = await copyImage(sourceImage, `restaurants/${DOC_ID}/menu/${item.id}.jpg`); }
    catch (e) { console.warn(`photo ${item.id}:`, e.message); }
  }
  if (!sourceImage) noPhoto++;
  if (DRY) {
    const price = item.prices.map((p) => (p.label ? `${p.label} ${p.amount}` : p.amount)).join(" / ");
    console.log(`  [${item.categoryId}] ${item.name} â€” SAR ${price}${sourceImage ? "" : "  (no photo)"}`);
    continue;
  }
  await db.collection("restaurants").doc(DOC_ID).collection("menuItems").doc(item.id).set(
    { ...fields, ...(imageUrl ? { imageUrl } : {}), source: "plumqr", plumqrIds },
    { merge: true }
  );
  ok++;
  process.stdout.write(`\r  ${ok}/${data.menuItems.length} dishes saved`);
}
console.log(`\nDone. Dishes without a photo: ${noPhoto}.`);
console.log(`Preview: http://localhost:3000/${r.slug}  (live site shows "Coming soon" until isActive = true)`);
process.exit(0);
