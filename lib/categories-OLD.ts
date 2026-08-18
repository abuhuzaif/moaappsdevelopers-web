export const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Jubail", "Yanbu", "Madinah"];

export const CATEGORIES = [
  { key: "Housing", label: "Housing", emoji: "🏠" },
  { key: "Car", label: "Car", emoji: "🚗" },
  { key: "Household", label: "Household", emoji: "🛋️" },
  { key: "Buy & Sell", label: "Buy & Sell", emoji: "🛍️" },
  { key: "Services", label: "Services", emoji: "🔧" },
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
  Classifieds: [
    "Jobs",
    "Electronics & Mobiles",
    "Fashion & Accessories",
    "Pets & Animals",
    "Books & Hobbies",
    "Sports & Fitness",
    "Miscellaneous",
  ],
};
