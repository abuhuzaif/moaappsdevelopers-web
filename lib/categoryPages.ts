// City × category landing pages: /ksa-connect/city/<city>/<category>
// e.g. /ksa-connect/city/riyadh/jobs → "Jobs in Riyadh".
// Each category gets its own SEO title, heading and intro text, so every page
// is unique for Google (not the same text with a different city name).

export type CategoryPage = {
  slug: string; // URL part
  key: string; // value stored on listings (CATEGORIES key)
  emoji: string;
  title: (city: string) => string; // <title> and H1
  intro: (city: string) => string; // short paragraph under the H1
  // Ads filed somewhere else that also belong here (e.g. Classifieds › Jobs → Jobs page)
  extra?: { category: string; subCategory: string }[];
};

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    slug: "housing",
    key: "Housing",
    emoji: "🏠",
    title: (c) => `Flats & Rooms for Rent in ${c}`,
    intro: (c) =>
      `Latest flats, rooms, studios and villas for rent in ${c}, posted by owners and tenants. Family and bachelor options, furnished and unfurnished. Contact the poster directly on call or WhatsApp. Always pay rent through Ejar.`,
  },
  {
    slug: "jobs",
    key: "Jobs",
    emoji: "💼",
    extra: [{ category: "Classifieds", subCategory: "Jobs" }],
    title: (c) => `Jobs in ${c}`,
    intro: (c) =>
      `New job openings in ${c}: drivers, technicians, engineers, nurses, office staff, sales and more. Contact employers directly. Never pay any fee for a job or visa.`,
  },
  {
    slug: "cars",
    key: "Car",
    emoji: "🚗",
    title: (c) => `Used Cars for Sale in ${c}`,
    intro: (c) =>
      `Used sedans, SUVs, pickups and vans for sale in ${c}, plus car lease transfers. Check the car in person and pay only after the ownership transfer on Absher.`,
  },
  {
    slug: "services",
    key: "Services",
    emoji: "🛠️",
    title: (c) => `AC Repair, Cleaning, Movers & Services in ${c}`,
    intro: (c) =>
      `Find local services in ${c}: AC repair, cleaning, appliance repair, movers and packers, cargo, delivery and technical work. Pay after the work is done.`,
  },
  {
    slug: "household",
    key: "Household",
    emoji: "🛋️",
    title: (c) => `Used Furniture & Household Items in ${c}`,
    intro: (c) =>
      `Second-hand furniture, kitchen items and home appliances for sale in ${c}, often from expats moving out. Check the item before you pay.`,
  },
  {
    slug: "buy-sell",
    key: "Buy & Sell",
    emoji: "🛍️",
    title: (c) => `Buy & Sell in ${c}`,
    intro: (c) =>
      `Buy and sell clothes, kids items, books, sports gear, gaming and tools in ${c}. Meet in person and check the item before paying.`,
  },
  {
    slug: "electronics",
    key: "Electronics",
    emoji: "💻",
    title: (c) => `Mobiles, Laptops & Electronics for Sale in ${c}`,
    intro: (c) =>
      `Used and new mobiles, laptops, TVs, cameras and accessories for sale in ${c}. Test the device before you pay.`,
  },
  {
    slug: "community",
    key: "Community",
    emoji: "👥",
    title: (c) => `Community Events & Announcements in ${c}`,
    intro: (c) => `Events, groups, lost & found and announcements for the expat community in ${c}.`,
  },
  {
    slug: "classifieds",
    key: "Classifieds",
    emoji: "📋",
    title: (c) => `Classifieds in ${c}`,
    intro: (c) =>
      `Free classified ads in ${c}: mobiles, fashion, pets, hobbies, Umrah packages, restaurants and more.`,
  },
];

export function categoryPageBySlug(slug: string): CategoryPage | undefined {
  return CATEGORY_PAGES.find((p) => p.slug === slug.toLowerCase());
}

export function categoryPageByKey(key: string): CategoryPage | undefined {
  return CATEGORY_PAGES.find((p) => p.key === key);
}

/** Every landing page an ad belongs to (its own category, plus e.g. Jobs for Classifieds › Jobs). */
export function categoryPagesForAd(category?: string, subCategory?: string): CategoryPage[] {
  return CATEGORY_PAGES.filter(
    (p) => p.key === category || (p.extra ?? []).some((e) => e.category === category && e.subCategory === subCategory),
  );
}
