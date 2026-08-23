import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — KSA-Connect",
  description:
    "Common questions about posting ads, browsing listings, matrimonial matching, and staying safe on KSA-Connect — the free classifieds platform for expats in Saudi Arabia.",
  alternates: {
    canonical: "https://www.myksaconnect.com/ksa-connect/faq",
  },
};

const FAQS = [
  {
    q: "Is KSA-Connect free to use?",
    a: "Yes. Browsing listings and posting ads on KSA-Connect is completely free. There are no listing fees or subscription charges for buyers or sellers.",
  },
  {
    q: "Which cities does KSA-Connect cover?",
    a: "KSA-Connect currently serves 7 major cities in Saudi Arabia: Riyadh, Jeddah, Dammam, Khobar, Jubail, Yanbu, and Madinah. Each city has its own dedicated listings page.",
  },
  {
    q: "How do I post an ad on KSA-Connect?",
    a: "Sign in with your Google account, then go to \"Post an Ad.\" Choose your city, category, and sub-category, add up to 3 photos, write a title and description, set a price (or mark it negotiable), and add your location and contact number.",
  },
  {
    q: "How long does a listing stay active?",
    a: "Listings automatically expire and are removed 8 days after posting, keeping the marketplace fresh with current ads. You can post a new ad anytime.",
  },
  {
    q: "How do I contact a seller?",
    a: "Open any listing and use the Call or WhatsApp buttons to reach the seller directly using the phone number they provided.",
  },
  {
    q: "Is the matrimonial feature available on the website?",
    a: "No, matrimonial matching is available exclusively in the KSA-Connect mobile app, with a private Wali-approved, respectful matching flow. The website covers classifieds (housing, cars, jobs, and more) only.",
  },
  {
    q: "How do I stay safe from fraud on KSA-Connect?",
    a: "Always verify the other party's identity and the item or property before paying anything. Never share your OTP, password, or bank details. See our full Safety & Fraud Prevention guide for details.",
  },
  {
    q: "How do I edit or delete my listing?",
    a: "Open your listing's detail page while signed in — if you're the owner, you'll see Edit and Delete buttons at the top of the page.",
  },
  {
    q: "Is there a mobile app for KSA-Connect?",
    a: "Yes, the KSA-Connect app is available on the Google Play Store and includes in-app chat and matrimonial matching in addition to classifieds.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function FaqPage() {
  return (
    <div className="mk-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          KSA-Connect
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>
            Frequently Asked <span className="gold">Questions</span>
          </h1>
          <p>Everything you need to know about buying, selling, and staying safe on KSA-Connect.</p>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        {FAQS.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "20px 0",
              borderBottom: i < FAQS.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <h2 style={{ fontSize: 17, marginBottom: 8 }}>{item.q}</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{item.a}</p>
          </div>
        ))}

        <p style={{ marginTop: 32 }}>
          <a href="/ksa-connect">← Back to listings</a>
        </p>
      </main>

      <footer className="footer">
        <p>
          <a href="/ksa-connect/privacy">Privacy Policy</a> ·{" "}
          <a href="/ksa-connect/safety">Safety &amp; Fraud Prevention</a>
        </p>
      </footer>
    </div>
  );
}
