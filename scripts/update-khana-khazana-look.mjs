// Khana Khazana: PlumQR-style colours + category photos, and (optionally) WhatsApp ordering.
//
//   node scripts/update-khana-khazana-look.mjs                      â†’ colours + category photos only
//   node scripts/update-khana-khazana-look.mjs --whatsapp 9665...   â†’ also turns on WhatsApp ordering
//
// WhatsApp number: digits only, with 966 in front (05xxxxxxxx â†’ 9665xxxxxxxx).

import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const BUCKET = process.env.BUCKET || "riyadhconnect-9520a.firebasestorage.app";
const DOC_ID = "khana-khazana";
const PQR = "https://pqr-items-images-v2.s3.amazonaws.com/";

const i = process.argv.indexOf("--whatsapp");
let whatsapp = i > -1 ? String(process.argv[i + 1] || "").replace(/\D/g, "") : "";
if (whatsapp.startsWith("05")) whatsapp = "966" + whatsapp.slice(1);
if (i > -1 && !/^9665\d{8}$/.test(whatsapp)) {
  console.error("WhatsApp number galat hai. Misaal: --whatsapp 966512345678");
  process.exit(1);
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))),
  storageBucket: BUCKET,
});
const db = getFirestore();
const bucket = getStorage().bucket();

async function copyImage(srcUrl, destPath) {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`${res.status} for ${srcUrl}`);
  const token = randomUUID();
  await bucket.file(destPath).save(Buffer.from(await res.arrayBuffer()), {
    contentType: res.headers.get("content-type") || "image/jpeg",
    metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destPath)}?alt=media&token=${token}`;
}

// Same names, order and photos as their PlumQR menu
const CATS = [
  ["soup", "SOUP", "Ø´ÙˆØ±Ø¨Ø©", "6a194f1a"],
  ["bbq", "BBQ", "Ø§Ù„Ù…Ø´ÙˆÙŠØ§Øª", "840c4496"],
  ["chicken", "CHICKEN", "Ø£Ø·Ø¨Ø§Ù‚ Ø§Ù„Ø¯Ø¬Ø§Ø¬", "0a2c9538"],
  ["mutton", "MUTTON", "Ø£Ø·Ø¨Ø§Ù‚ Ø§Ù„Ù„Ø­Ù…", "7ec26617"],
  ["rice", "RICE", "Ø£Ø·Ø¨Ø§Ù‚ Ø§Ù„Ø£Ø±Ø²", "06aed35f"],
  ["fish", "FISH", "Ø£Ø·Ø¨Ø§Ù‚ Ø§Ù„Ø³Ù…Ùƒ", "3abe795a"],
  ["prawn", "PRAWN", "Ø£Ø·Ø¨Ø§Ù‚ Ø§Ù„Ø±ÙˆØ¨ÙŠØ§Ù†", "1b1c28bd"],
  ["veg", "VEGETABLE", "Ø£Ø·Ø¨Ø§Ù‚ Ø§Ù„Ø®Ø¶Ø§Ø±", "13744136"],
  ["bread", "BREAD", "Ø®Ø¨Ø²", "7f32f8ab"],
  ["dessert", "DESSERT", "Ø­Ù„ÙˆÙŠØ§Øª", "8d38f93b"],
];

const menuCategories = [];
for (const [n, [id, name, nameAr, img]] of CATS.entries()) {
  const image = await copyImage(`${PQR}${img}.jpeg`, `restaurants/${DOC_ID}/categories/${id}.jpg`);
  menuCategories.push({ id, name, nameAr, sort: (n + 1) * 10, image });
  console.log(`  category ${name} âœ“`);
}

const update = {
  menuCategories,
  // PlumQR colours: red bar #b1331c, white text on it, light grey page, white cards, black text
  menuTheme: {
    style: "plumqr",
    bg: "#fafafa",
    surface: "#ffffff",
    text: "#000000",
    muted: "#5f5f5f",
    accent: "#b1331c",
    accentSoft: "#fbeae6",
    highlight: "#b1331c",
    line: "#e6e6e6",
  },
  updatedAt: FieldValue.serverTimestamp(),
};
if (whatsapp) {
  update.whatsapp = whatsapp;
  update.ordering = { enabled: true, types: ["takeaway", "dinein"] };
}

await db.collection("restaurants").doc(DOC_ID).set(update, { merge: true });
console.log(whatsapp ? `Done. Ordering ON â†’ WhatsApp ${whatsapp}` : "Done. Ordering still OFF (no --whatsapp given).");
process.exit(0);
