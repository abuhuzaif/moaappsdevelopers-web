// Uploads a logo or cover photo for any restaurant and saves its link on the restaurant doc.
//
//   node scripts/set-image.mjs kings logo  scripts/kings-images/logo.jpg
//   node scripts/set-image.mjs kings cover scripts/kings-images/cover.jpg top
//
// cover: optional 4th value = which part the 220px header shows (top | center | bottom).

import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const [slug, kind, file, position] = process.argv.slice(2);
if (!slug || !["logo", "cover"].includes(kind) || !file || !existsSync(file)) {
  console.error("Usage: node scripts/set-image.mjs <slug> <logo|cover> <image file> [top|center|bottom]");
  process.exit(1);
}
initializeApp({
  credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))),
  storageBucket: process.env.BUCKET || "riyadhconnect-9520a.firebasestorage.app",
});
const db = getFirestore();
const bucket = getStorage().bucket();

const snap = await db.collection("restaurants").where("slug", "==", slug).limit(1).get();
const ref = snap.empty ? db.collection("restaurants").doc(slug) : snap.docs[0].ref;
if (!(await ref.get()).exists) { console.error(`Restaurant "${slug}" not found — import the menu first.`); process.exit(1); }

const ext = file.toLowerCase().endsWith(".png") ? "png" : "jpg";
const dest = `restaurants/${ref.id}/${kind}-${Date.now()}.${ext}`;
const token = randomUUID();
await bucket.file(dest).save(readFileSync(file), {
  contentType: ext === "png" ? "image/png" : "image/jpeg",
  metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } },
});
const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(dest)}?alt=media&token=${token}`;

const update = { updatedAt: FieldValue.serverTimestamp() };
if (kind === "logo") update.logoUrl = url;
else {
  update.coverImageUrl = url;
  if (position) update.coverPosition = position === "top" ? "50% 0%" : position === "bottom" ? "50% 100%" : position === "center" ? FieldValue.delete() : position;
}
await ref.update(update);
console.log(`${kind} set for ${slug}`);
process.exit(0);
