// Uploads a cover photo for a restaurant and sets `coverImageUrl` on its Firestore doc.
//
//   node scripts/set-cover.mjs khana-khazana scripts/khana-khazana-cover.jpg top
//
// Optional 3rd value = which part of the photo the 220px header shows:
// top | center | bottom (or any CSS object-position like "50% 20%"). Default: center.

import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const [slug, file, position] = process.argv.slice(2);
if (!slug || !file || !existsSync(file)) {
  console.error("Usage: node scripts/set-cover.mjs <slug> <image file>");
  process.exit(1);
}
const BUCKET = process.env.BUCKET || "riyadhconnect-9520a.appspot.com";

initializeApp({
  credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))),
  storageBucket: BUCKET,
});
const db = getFirestore();
const bucket = getStorage().bucket();

const snap = await db.collection("restaurants").where("slug", "==", slug).limit(1).get();
const ref = snap.empty ? db.collection("restaurants").doc(slug) : snap.docs[0].ref;
if (!(await ref.get()).exists) {
  console.error(`Restaurant "${slug}" not found.`);
  process.exit(1);
}

const ext = file.toLowerCase().endsWith(".png") ? "png" : "jpg";
const path = `restaurants/${ref.id}/cover-${Date.now()}.${ext}`;
const token = randomUUID();
await bucket.file(path).save(readFileSync(file), {
  contentType: ext === "png" ? "image/png" : "image/jpeg",
  metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } },
});
const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

const coverPosition = !position || position === "center" ? FieldValue.delete() : position === "top" ? "50% 0%" : position === "bottom" ? "50% 100%" : position;
await ref.update({ coverImageUrl: url, coverPosition, updatedAt: FieldValue.serverTimestamp() });
console.log(`Cover set for ${slug} (doc ${ref.id})`);
console.log(url);
process.exit(0);
