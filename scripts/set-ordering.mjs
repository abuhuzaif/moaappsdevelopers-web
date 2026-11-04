import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
const [slug, arg] = process.argv.slice(2);
if (!slug || !arg) { console.error("Usage: node scripts/set-ordering.mjs <slug> <whatsapp | off>"); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))) });
const db = getFirestore();
const snap = await db.collection("restaurants").where("slug", "==", slug).limit(1).get();
const ref = snap.empty ? db.collection("restaurants").doc(slug) : snap.docs[0].ref;
const doc = await ref.get();
if (!doc.exists) { console.error(`Restaurant "${slug}" not found`); process.exit(1); }
const data = doc.data();
if (arg.toLowerCase() === "off") { await ref.update({ "ordering.enabled": false }); console.log(`${data.name}: ordering OFF`); process.exit(0); }
let n = arg.replace(/\D/g, "");
if (n.startsWith("00")) n = n.slice(2);
if (n.startsWith("05")) n = "966" + n.slice(1);
if (n.startsWith("5") && n.length === 9) n = "966" + n;
if (!/^9665\d{8}$/.test(n)) { console.error(`"${arg}" is not a Saudi mobile number`); process.exit(1); }
const update = { whatsapp: n, ordering: { enabled: true, types: data.ordering?.types?.length ? data.ordering.types : ["takeaway", "dinein"] }, updatedAt: FieldValue.serverTimestamp() };
if (!data.phone) update.phone = "0" + n.slice(3);
await ref.update(update);
console.log(`${data.name}: ordering ON -> WhatsApp +${n}`);
process.exit(0);
