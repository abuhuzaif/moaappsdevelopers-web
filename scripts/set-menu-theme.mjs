// Switch a restaurant to the MYKSA standard menu with its own colours (or undo it).
//
//   node scripts/set-menu-theme.mjs biryani-nation          → standard menu, black & gold
//   node scripts/set-menu-theme.mjs khana-khazana           → standard menu, red
//   node scripts/set-menu-theme.mjs biryani-nation --undo   → back to the old design
//
// The old menuTheme is saved once in `menuThemeBackup`, so --undo always restores the original.

import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Colours per restaurant. accent = app bar, headings, + buttons; highlight = second colour
// (pill stripe, SAR/ريال/CAL titles, size labels, active category); onAccent = text on accent.
const PRESETS = {
  "khana-khazana": {
    style: "standard",
    accent: "#b1331c", highlight: "#7a2012", onAccent: "#ffffff",
    bg: "#fafafa", surface: "#ffffff", text: "#000000", muted: "#5f5f5f", line: "#e6e6e6", accentSoft: "#fbeae6",
  },
  "biryani-nation": {
    style: "standard",
    accent: "#151515", highlight: "#c9a227", onAccent: "#f3d27a",
    bg: "#fbf7ee", surface: "#ffffff", text: "#1a1a1a", muted: "#6b6457", line: "#ece3cf", accentSoft: "#f6ecd2",
  },
};

const slug = process.argv[2];
const undo = process.argv.includes("--undo");
if (!slug || (!undo && !PRESETS[slug])) {
  console.error(`Usage: node scripts/set-menu-theme.mjs <${Object.keys(PRESETS).join(" | ")}> [--undo]`);
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(new URL("./serviceAccount.json", import.meta.url), "utf8"))) });
const db = getFirestore();

// find the restaurant by its slug (falls back to a doc with that id)
let snap = await db.collection("restaurants").where("slug", "==", slug).limit(1).get();
let ref = snap.empty ? db.collection("restaurants").doc(slug) : snap.docs[0].ref;
const doc = await ref.get();
if (!doc.exists) {
  console.error(`Restaurant "${slug}" not found in Firestore.`);
  process.exit(1);
}
const data = doc.data();
console.log(`${data.name} (doc ${ref.id})`);
console.log("  current style:", data.menuTheme?.style ?? "(none)");

if (undo) {
  if (!data.menuThemeBackup) {
    console.error("  No backup found, nothing to undo.");
    process.exit(1);
  }
  await ref.update({ menuTheme: data.menuThemeBackup, menuThemeBackup: FieldValue.delete() });
  console.log("  Restored old design:", data.menuThemeBackup.style ?? "(default)");
} else {
  const update = { menuTheme: PRESETS[slug], updatedAt: FieldValue.serverTimestamp() };
  if (!data.menuThemeBackup && data.menuTheme && data.menuTheme.style !== "standard") update.menuThemeBackup = data.menuTheme;
  await ref.update(update);
  console.log("  Now:", PRESETS[slug].style, PRESETS[slug].accent, "/", PRESETS[slug].highlight, update.menuThemeBackup ? "(old design backed up)" : "");
}
console.log(`  Check: http://localhost:3000/${data.slug ?? slug}  (pages refresh within 5 min, restart npm run dev to see it at once)`);
process.exit(0);
