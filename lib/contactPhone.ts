// Ad phone numbers are stored as "5XXXXXXXX" (Saudi, we add +966).
// Special case (admin only): a full international number stored with "+" or "00",
// e.g. "+91 7013470254" for an India-based agency — shown and dialled as-is.

function isInternational(phone: string): boolean {
  const p = phone.trim();
  return p.startsWith("+") || p.startsWith("00");
}

/** What people see: "+966549013636" or "+91 7013470254". */
export function phoneDisplay(phone: string): string {
  const p = (phone ?? "").trim();
  if (!p) return "";
  return isInternational(p) ? `+${p.replace(/^\+|^00/, "")}` : `+966${p}`;
}

/** Digits with country code, for tel: and wa.me links: "966549013636" / "917013470254". */
export function phoneDigits(phone: string): string {
  const p = (phone ?? "").trim();
  const d = p.replace(/\D/g, "");
  if (isInternational(p)) return d.replace(/^00/, "");
  return `966${d}`;
}
