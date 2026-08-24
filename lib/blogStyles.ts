export type FontStyleKey = "classic" | "elegant" | "modern" | "warm";

export const FONT_STYLES: Record<
  FontStyleKey,
  { label: string; heading: string; body: string; googleFontsHref?: string }
> = {
  classic: {
    label: "Classic (Site Default)",
    heading: "'Plus Jakarta Sans', sans-serif",
    body: "'Inter', sans-serif",
  },
  elegant: {
    label: "Elegant Serif",
    heading: "'Playfair Display', serif",
    body: "'Lora', serif",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Lora:wght@400;500&display=swap",
  },
  modern: {
    label: "Modern Sans",
    heading: "'Poppins', sans-serif",
    body: "'Work Sans', sans-serif",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Work+Sans:wght@400;500&display=swap",
  },
  warm: {
    label: "Warm Editorial",
    heading: "'Merriweather', serif",
    body: "'Nunito Sans', sans-serif",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Nunito+Sans:wght@400;600&display=swap",
  },
};

export const ACCENT_COLORS = [
  { label: "Default (Navy)", value: "" },
  { label: "Gold", value: "#b45309" },
  { label: "Green", value: "#16a34a" },
  { label: "Red", value: "#dc2626" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Blue", value: "#2563eb" },
];
