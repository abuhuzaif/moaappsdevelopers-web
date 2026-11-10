// One short safety line shown at the top of every ad, picked by category
// (and sub-category for Classifieds). `href` only where a warning page exists.

export type SafetyTip = { text: string; href?: string };

const HOUSING: SafetyTip = {
  text: "Pay rent only through Ejar. Never pay a deposit before seeing the flat.",
  href: "/ksa-connect/rental-scam-warning",
};
const JOBS: SafetyTip = { text: "Never pay any fee for a job or visa. Real employers don't charge you." };
const CAR: SafetyTip = { text: "Pay only after the ownership transfer is done on Absher." };
const ITEMS: SafetyTip = { text: "Meet in person and check the item before paying. No advance transfers." };
const SERVICES: SafetyTip = { text: "Pay after the work is done, not in advance." };
const PEOPLE: SafetyTip = { text: "Never send money to someone you haven't met." };
const UMRAH: SafetyTip = { text: "Book only with licensed Umrah agencies. Get a receipt for every payment." };
const DEFAULT: SafetyTip = { text: "Verify everything in person before you pay. No advance transfers." };

export function safetyTipFor(category?: string, subCategory?: string): SafetyTip {
  switch (category) {
    case "Housing":
      return HOUSING;
    case "Jobs":
      return JOBS;
    case "Car":
      return CAR;
    case "Household":
    case "Buy & Sell":
    case "Electronics":
      return ITEMS;
    case "Services":
      return SERVICES;
    case "Community":
    case "Matrimonial":
      return PEOPLE;
    case "Classifieds":
      if (subCategory === "Jobs") return JOBS;
      if (subCategory === "Umrah Packages") return UMRAH;
      if (subCategory === "Restaurants") return DEFAULT;
      return ITEMS;
    default:
      return DEFAULT;
  }
}
