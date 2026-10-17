// ── Cities grouped by region ─────────────────────────────────
// Ads store just the city name, so adding a city here makes it available
// everywhere (post form, filters, city pages). Keep spellings identical in
// the Flutter app (lib/theme/city_manager.dart).
export type Region = { key: string; label: string; labelAr: string; emoji: string; cities: string[] };

export const REGIONS: Region[] = [
  { key: "Central", label: "Central", labelAr: "الوسطى", emoji: "🏙️", cities: ["Riyadh", "Al Kharj", "Buraydah"] },
  { key: "Eastern", label: "Eastern", labelAr: "الشرقية", emoji: "🌊", cities: ["Dammam", "Khobar", "Jubail", "Dhahran", "Al Ahsa"] },
  { key: "Western", label: "Western", labelAr: "الغربية", emoji: "🕋", cities: ["Jeddah", "Makkah", "Madinah", "Yanbu", "Taif"] },
  { key: "Southern", label: "Southern", labelAr: "الجنوبية", emoji: "⛰️", cities: ["Abha", "Khamis Mushait", "Jazan", "Najran"] },
  { key: "Northern", label: "Northern", labelAr: "الشمالية", emoji: "🏜️", cities: ["Tabuk", "Hail"] },
];

export const CITIES: string[] = REGIONS.flatMap((r) => r.cities);

export function regionOfCity(city: string | null | undefined): Region | undefined {
  if (!city) return undefined;
  return REGIONS.find((r) => r.cities.includes(city));
}

/** URL slug for a city: "Al Kharj" → "al-kharj", "Riyadh" → "riyadh". */
export function citySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export const CATEGORIES = [
  { key: "Housing", label: "Housing", emoji: "🏠" },
  { key: "Car", label: "Car", emoji: "🚗" },
  { key: "Household", label: "Household", emoji: "🛋️" },
  { key: "Buy & Sell", label: "Buy & Sell", emoji: "🛍️" },
  { key: "Electronics", label: "Electronics", emoji: "💻" },
  { key: "Services", label: "Services", emoji: "🔧" },
  { key: "Jobs", label: "Jobs", emoji: "💼" },
  { key: "Community", label: "Community", emoji: "👥" },
  { key: "Classifieds", label: "Classifieds", emoji: "📋" },
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  Housing: [
    "Studio",
    "1BHK",
    "2BHK",
    "3BHK",
    "4BHK+",
    "Villa",
    "Room",
    "Furnished Apartment",
    "Furnished Room",
    "Office",
  ],
  Car: ["Sedan", "SUV", "Pickup", "Van", "Lease Transfer"],
  Household: ["Furniture", "Electronics", "Kitchen", "Other"],
  "Buy & Sell": [
    "Electronics",
    "Clothes & Fashion",
    "Kids & Baby",
    "Books",
    "Sports & Fitness",
    "Gaming",
    "Tools & Equipment",
    "Other",
  ],
  Electronics: [
    "Mobiles",
    "Laptops",
    "TVs",
    "Cameras",
    "Accessories",
    "Home Appliances",
    "Other",
  ],
  Services: [
    "AC Repair",
    "Cleaning",
    "Appliance Repair",
    "Technical",
    "Interior Design",
    "Automotive",
    "Delivery",
    "Relocation",
    "Cargo",
  ],
  Jobs: [
    "Driver",
    "Labour",
    "Domestic Help",
    "Office Staff",
    "Delivery Rider",
    "Technician",
    "Other",
  ],
  Community: [
    "Events",
    "Groups",
    "Lost & Found",
    "Announcements",
    "Volunteering",
    "Other",
  ],
  Classifieds: [
    "Jobs",
    "Electronics & Mobiles",
    "Fashion & Accessories",
    "Pets & Animals",
    "Books & Hobbies",
    "Sports & Fitness",
    "Restaurants",
    "Umrah Packages",
    "Miscellaneous",
  ],
};