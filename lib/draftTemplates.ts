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
    "Movers & Packers": {
      title: "Movers & packers service available",
      description:
        "Professional packing and moving service for houses and offices, careful handling of furniture, fair rates.",
    },
    Cargo: {
      title: "Cargo service available",
      description: "Reliable cargo shipping service, competitive rates.",
    },
  },
  Jobs: {
    Driver: {
      title: "Driver job opportunity available",
      description:
        "Driver position available, valid Saudi driving license required. Please contact for requirements and details.",
    },
    Labour: {
      title: "Labour job opportunity available",
      description:
        "Labour position available, please contact for requirements and details.",
    },
    "Domestic Help": {
      title: "Domestic help needed",
      description:
        "Domestic help position available, please contact for requirements and details.",
    },
    "Office Staff": {
      title: "Office staff job opportunity available",
      description:
        "Office staff position available, please contact for requirements and details.",
    },
    "Delivery Rider": {
      title: "Delivery rider job opportunity available",
      description:
        "Delivery rider position available, please contact for requirements and details.",
    },
    Technician: {
      title: "Technician job opportunity available",
      description:
        "Technician position available, please contact for requirements and details.",
    },
    Engineer: {
      title: "Engineer job opportunity available",
      description:
        "Engineer position available. Saudi Council of Engineers (SCE) membership preferred. Please contact for requirements and details.",
    },
    Doctor: {
      title: "Doctor job opportunity available",
      description:
        "Doctor position available. Valid SCFHS license preferred. Please contact for requirements and details.",
    },
    Nurse: {
      title: "Nurse job opportunity available",
      description:
        "Nurse position available. Valid SCFHS license preferred. Please contact for requirements and details.",
    },
    Pharmacist: {
      title: "Pharmacist job opportunity available",
      description:
        "Pharmacist position available. Valid SCFHS license preferred. Please contact for requirements and details.",
    },
    "Lab Technician": {
      title: "Lab technician job opportunity available",
      description:
        "Lab technician position available. Valid SCFHS license preferred. Please contact for requirements and details.",
    },
    Accountant: {
      title: "Accountant job opportunity available",
      description:
        "Accountant position available, please contact for requirements and details.",
    },
    "IT Professional": {
      title: "IT job opportunity available",
      description:
        "IT position available, please contact for requirements and details.",
    },
    Teacher: {
      title: "Teacher job opportunity available",
      description:
        "Teacher position available, please contact for requirements and details.",
    },
    Sales: {
      title: "Sales job opportunity available",
      description:
        "Sales position available, please contact for requirements and details.",
    },
    Chef: {
      title: "Chef / cook job opportunity available",
      description:
        "Chef / cook position available, please contact for requirements and details.",
    },
    "Security Guard": {
      title: "Security guard job opportunity available",
      description:
        "Security guard position available, please contact for requirements and details.",
    },
    "Multiple Positions": {
      title: "Multiple job positions available",
      description:
        "Hiring for multiple positions. Please see the list of positions, salary and requirements below, and contact us for details.",
    },
    Other: {
      title: "Job opportunity available",
      description:
        "Job opening available, please contact for requirements and details.",
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
    Restaurants: {
      title: "Restaurant – view our digital menu",
      description:
        "Fresh, delicious food at our restaurant. Browse the full menu with prices online, dine-in and takeaway available, order easily on WhatsApp. Please contact for timings and location.",
    },
    "Umrah Packages": {
      title: "Umrah package available",
      description:
        "Umrah package available with transport and hotel stay in Makkah & Madinah. Please contact for dates, prices and package details.",
    },
    Miscellaneous: {
      title: "Item available",
      description: "Item available, please contact for more details.",
    },
  },
};