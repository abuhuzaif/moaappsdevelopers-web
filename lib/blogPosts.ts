export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedDate: string; // ISO format
  city?: string;
  content: { heading?: string; paragraphs: string[] }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "moving-to-riyadh-expat-guide",
    title: "Moving to Riyadh: A Complete Guide for Expats",
    description:
      "Everything expats need to know before moving to Riyadh — housing, neighborhoods, cost of living, and how to settle in quickly.",
    publishedDate: "2026-08-23",
    city: "Riyadh",
    content: [
      {
        paragraphs: [
          "Moving to Riyadh as an expat can feel overwhelming at first — a new city, a new pace of life, and dozens of small decisions to make before you even unpack your bags. This guide walks through the essentials: where to live, what to expect, and how to get set up quickly.",
        ],
      },
      {
        heading: "Choosing a Neighborhood",
        paragraphs: [
          "Riyadh is spread across several distinct districts, each with a different feel. Al Olaya and Al Malqa are popular with expat families for their compounds, international schools, and shopping access. Al Nakheel and Al Sulimaniyah offer a more central, walkable feel closer to business districts. Budget-conscious renters often look toward Al Aqiq or Al Rabwah for lower rents with easy commutes.",
          "Before committing to a lease, it's worth spending a weekend visiting a few neighborhoods in person — traffic patterns and noise levels can vary a lot street to street.",
        ],
      },
      {
        heading: "Finding Housing",
        paragraphs: [
          "Apartments, villas, and furnished rooms in Riyadh are commonly listed by individual landlords rather than large agencies, so classifieds platforms are often faster than going through a broker. You can browse live housing listings in Riyadh, filtered by budget and area, directly on KSA-Connect.",
          "When viewing a place, always confirm the deposit amount, whether utilities are included, and get the agreement in writing before transferring any money — see our full safety guide for more on avoiding rental scams.",
        ],
      },
      {
        heading: "Cost of Living Basics",
        paragraphs: [
          "Riyadh's cost of living varies widely by district. A furnished studio in a central compound can run significantly higher than a similar unit further out. Groceries, transport, and dining are generally affordable compared to Western capitals, though imported goods carry a premium.",
        ],
      },
      {
        heading: "Getting Settled",
        paragraphs: [
          "Once you've found a place, the next few weeks usually involve furnishing your home, finding a reliable driver or navigating ride-hailing apps, and connecting with the local expat community. Secondhand furniture and household items are widely available through local classifieds — often at a fraction of retail price, and a practical way to furnish quickly without waiting for shipments.",
          "Joining local expat groups (in person or online) is one of the fastest ways to get answers to the small, practical questions that come up in your first month — from which supermarket has the best selection to which clinics take your insurance.",
        ],
      },
      {
        heading: "Quick Checklist for Your First Month",
        paragraphs: [
          "Register your residence with your employer or sponsor as required, set up a local bank account, get a local SIM card, and take time to explore your neighborhood on foot before relying entirely on taxis. Keep copies of your Iqama and passport in a safe, accessible place.",
        ],
      },
    ],
  },
];
