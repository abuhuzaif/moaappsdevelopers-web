// Imports a restaurant menu (JSON) into Firestore, with category photos from a local folder.
// Works for any new restaurant â€” the JSON decides the slug, colours and dishes.
//
//   node scripts/seed-restaurant.mjs scripts/kings-menu.json scripts/kings-images --dry
//   node scripts/seed-restaurant.mjs scripts/kings-menu.json scripts/kings-images
//
// restaurants/{slug}                  â†’ restaurant doc (merge, so later hand edits are kept)
// restaurants/{slug}/menuItems/{id}   â†’ one doc per dish
// Storage restaurants/{slug}/categories/*.jpg â†’ category photos

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const [jsonPath, imgDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const DRY = process.argv.includes("--dry");
if (!jsonPath || !existsSync(jsonPath)) {
  console.error("Usage: node scripts/seed-restaurant.mjs <menu.json> [images folder] [--dry]");
  process.exit(1);
}
const data = JSON.parse(readFileSync(jsonPath, "utf8"));
const r = data.restaurant;
const DOC_ID = r.slug;
console.log(`${r.name} (${DOC_ID}): ${r.menuCategories.length} categories, ${data.menuItems.length} dishes${DRY ? " (dry run)" : ""}`);

let db, bucket;
if (!DRY) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))),
    storageBucket: process.env.BUCKET || "riyadhconnect-9520a.firebasestorage.app",
  });
  db = getFirestore();
  bucket = getStorage().bucket();
}

async function upload(file, dest) {
  const token = randomUUID();
  await bucket.file(dest).save(readFileSync(file), {
    contentType: "image/jpeg",
    metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media&token=${token}`;
}

// categories (+ photos)
const menuCategories = [];
for (const c of r.menuCategories) {
  const { imageFile, ...cat } = c;
  if (imageFile && imgDir) {
    const file = join(imgDir, imageFile);
    if (!existsSync(file)) console.warn(`  missing photo ${file}`);
    else if (!DRY) cat.image = await upload(file, `restaurants/${DOC_ID}/categories/${imageFile}`);
  }
  menuCategories.push(cat);
  console.log(`  [${c.id}] ${c.name}${imageFile ? "  ðŸ“·" : ""}`);
}

if (DRY) {
  for (const it of data.menuItems) {
    const p = it.prices.map((x) => (x.label ? `${x.label} ${x.amount}` : x.amount)).join(" / ");
    console.log(`    ${it.categoryId.padEnd(8)} ${it.name} â€” SAR ${p}`);
  }
  console.log("Dry run only, nothing written.");
  process.exit(0);
}

await db.collection("restaurants").doc(DOC_ID).set(
  { ...r, menuCategories, updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() },
  { merge: true }
);
let n = 0;
for (const it of data.menuItems) {
  await db.collection("restaurants").doc(DOC_ID).collection("menuItems").doc(it.id).set(it, { merge: true });
  process.stdout.write(`\r  ${++n}/${data.menuItems.length} dishes saved`);
}
console.log(`\nDone. Preview: http://localhost:3000/${r.slug}  (draft: live site shows "Coming soon" until isActive = true)`);
process.exit(0);
