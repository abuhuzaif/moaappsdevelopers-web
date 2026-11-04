// Sets (or replaces) the photo of one menu category.
//   node scripts/set-category-image.mjs kings rice scripts/kings-images/rice.jpg
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
const [slug, catId, file] = process.argv.slice(2);
if (!slug || !catId || !file || !existsSync(file)) { console.error("Usage: node scripts/set-category-image.mjs <slug> <categoryId> <image>"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))), storageBucket: process.env.BUCKET || "riyadhconnect-9520a.firebasestorage.app" });
const ref = getFirestore().collection("restaurants").doc(slug);
const doc = await ref.get();
if (!doc.exists) { console.error(`Restaurant "${slug}" not found`); process.exit(1); }
const cats = doc.get("menuCategories") || [];
const i = cats.findIndex((c) => c.id === catId);
if (i < 0) { console.error(`Category "${catId}" not found. Ids: ${cats.map((c) => c.id).join(", ")}`); process.exit(1); }
const bucket = getStorage().bucket();
const dest = `restaurants/${slug}/categories/${catId}-${Date.now()}.jpg`;
const token = randomUUID();
await bucket.file(dest).save(readFileSync(file), { contentType: "image/jpeg", metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } } });
cats[i] = { ...cats[i], image: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media&token=${token}` };
await ref.update({ menuCategories: cats, updatedAt: FieldValue.serverTimestamp() });
console.log(`${slug}: photo set for "${cats[i].name}"`);
process.exit(0);
