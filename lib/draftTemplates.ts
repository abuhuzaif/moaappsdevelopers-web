// Mirrors the Flutter app's _draftTemplates in post_listing_screen.dart —
// auto-fills Title + Description when a sub-category is selected, so
// users don't have to write from scratch.
export const DRAFT_TEMPLATES: Record<string, Record<string, { title: string; description: string }>> = {
  Housing: {
    Studio: {
      title: "Studio flat is available for rent",
      description:
        "Studio apartment available for rent, prime location, neat & clean building, all essential services nearby.",
    },
    "1BHK": {
      title: "1BHK flat is available for rent",
      description:
        "1BHK flat is available for rent, very good location, neat & clean building, all basic facilities available.",
    },
    "2BHK": {
      title: "2BHK flat is available for rent",
      description:
        "2BHK flat is available for rent, neat and clean building, all essential services available, good neighborhood.",
    },
    "3BHK": {
      title: "3BHK flat is available for rent",
      description:
        "3BHK flat is available for rent, spacious rooms, well-maintained building, family-friendly neighborhood.",
    },
    "4BHK+": {
      title: "4BHK+ flat is available for rent",
      description:
        "Spacious 4BHK+ flat available for rent, ideal for large families, quiet and safe neighborhood.",
    },
    Villa: {
      title: "Villa is available for rent",
      description: "Well-maintained villa available for rent, private parking, spacious rooms, good location.",
    },
    Room: {
      title: "Room is available for rent",
      description: "Single room available for rent, shared/private facilities, close to essential services.",
    },
    Office: {
      title: "Office space is available for rent",
      description: "Office space available for rent, well-located, suitable for small to medium businesses.",
    },
  },
  Car: {
    Sedan: {
      title: "Sedan car is available for sale",
      description: "Well-maintained sedan for sale, good condition, regular service history, ready to drive.",
    },
    SUV: {
      title: "SUV is available for sale",
      description: "SUV in good condition for sale, spacious interior, well-maintained, ready to drive.",
    },
    Pickup: {
      title: "Pickup truck is available for sale",
      description: "Pickup truck in good working condition, ideal for transport/work use.",
    },
    Van: {
      title: "Van is available for sale",
      description: "Van available for sale, good condition, suitable for family or commercial use.",
    },
    "Lease Transfer": {
      title: "Car lease transfer available",
      description: "Car lease transfer available, remaining lease period and terms negotiable.",
    },
  },
  Household: {
    Furniture: {
      title: "Furniture for sale",
      description: "Good condition furniture for sale, moving out sale, price negotiable.",
    },
    Electronics: {
      title: "Home electronics for sale",
      description: "Home electronics in working condition, available at a good price.",
    },
    Kitchen: {
      title: "Kitchen items for sale",
      description: "Kitchen appliances/items for sale, good condition, moving out sale.",
    },
    Other: {
      title: "Household item for sale",
      description: "Household item in good condition available for sale.",
    },
  },
  "Buy & Sell": {
    Electronics: {
      title: "Electronics item for sale",
      description: "Electronics item in good working condition, available for sale at a reasonable price.",
    },
    "Clothes & Fashion": {
      title: "Clothing items for sale",
      description: "Branded/quality clothing items for sale, good condition, reasonable price.",
    },
    "Kids & Baby": {
      title: "Kids/Baby items for sale",
      description: "Kids or baby items in good condition, gently used, available for sale.",
    },
    Books: {
      title: "Books for sale",
      description: "Books in good condition available for sale, great for students/readers.",
    },
    "Sports & Fitness": {
      title: "Sports/Fitness item for sale",
      description: "Sports or fitness equipment in good condition, available for sale.",
    },
    Gaming: {
      title: "Gaming item for sale",
      description: "Gaming console/accessories in good working condition, available for sale.",
    },
    "Tools & Equipment": {
      title: "Tools/Equipment for sale",
      description: "Tools or equipment in working condition, available for sale.",
    },
    Other: {
      title: "Item for sale",
      description: "Item in good condition available for sale, price negotiable.",
    },
  },
  Services: {
    "AC Repair": {
      title: "AC Repair service available",
      description: "Professional AC repair and maintenance service, quick response, reasonable pricing.",
    },
    Cleaning: {
      title: "Cleaning service available",
      description: "Professional home/office cleaning service, reliable and affordable.",
    },
    "Appliance Repair": {
      title: "Appliance repair service available",
      description: "Expert appliance repair service for all major brands, quick and reliable.",
    },
    Technical: {
      title: "Technical service available",
      description: "Professional technical support service, experienced and reliable.",
    },
    "Interior Design": {
      title: "Interior design service available",
      description: "Professional interior design service, creative solutions for your space.",
    },
    Automotive: {
      title: "Automotive service available",
      description: "Reliable automotive repair/maintenance service, experienced technicians.",
    },
    Delivery: {
      title: "Delivery service available",
      description: "Fast and reliable delivery service, available for various needs.",
    },
    Relocation: {
      title: "Relocation service available",
      description: "Professional relocation/moving service, safe and timely handling.",
    },
    Cargo: {
      title: "Cargo service available",
      description: "Reliable cargo shipping service, competitive rates.",
    },
  },
  Classifieds: {
    Jobs: {
      title: "Job opportunity available",
      description: "Job opening available, please contact for more details and requirements.",
    },
    "Electronics & Mobiles": {
      title: "Electronics/Mobile for sale",
      description: "Electronics or mobile device in good condition, available for sale.",
    },
    "Fashion & Accessories": {
      title: "Fashion/Accessories for sale",
      description: "Fashion item or accessory in good condition, available for sale.",
    },
    "Pets & Animals": {
      title: "Pet available",
      description: "Pet available, healthy and well cared for, please contact for details.",
    },
    "Books & Hobbies": {
      title: "Books/Hobby item for sale",
      description: "Books or hobby item in good condition, available for sale.",
    },
    "Sports & Fitness": {
      title: "Sports/Fitness item for sale",
      description: "Sports or fitness item in good condition, available for sale.",
    },
    Miscellaneous: {
      title: "Item available",
      description: "Item available, please contact for more details.",
    },
  },
};
