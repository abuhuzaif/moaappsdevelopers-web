// Puts a restaurant's menu live (or back to draft).
//   node scripts/set-live.mjs kings        → live: listed on /restaurants, menu open to everyone
//   node scripts/set-live.mjs kings off    → draft again ("Coming soon" on the live site)
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
const [slug, arg] = process.argv.slice(2);
if (!slug) { console.error("Usage: node scripts/set-live.mjs <slug> [off]"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))) });
const db = getFirestore();
const snap = await db.collection("restaurants").where("slug", "==", slug).limit(1).get();
const ref = snap.empty ? db.collection("restaurants").doc(slug) : snap.docs[0].ref;
const doc = await ref.get();
if (!doc.exists) { console.error(`Restaurant "${slug}" not found.`); process.exit(1); }
const live = arg !== "off";
await ref.update({ isActive: live, hidden: !live, updatedAt: FieldValue.serverTimestamp() });
const d = (await ref.get()).data();
console.log(`${d.name}: ${live ? "LIVE" : "draft"}  | whatsapp: ${d.whatsapp ?? "(none — run set-ordering first)"} | logo: ${d.logoUrl ? "yes" : "no"} | cover: ${d.coverImageUrl ? "yes" : "no"}`);
process.exit(0);
