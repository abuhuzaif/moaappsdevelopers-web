import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";

const URL = "https://www.myksaconnect.com/ksa-connect/rental-scam-warning";

export const metadata: Metadata = {
  title: "Warning: Fake Apartment Rental Scams in Saudi Arabia | MYKSA CONNECT",
  description:
    "How fake apartment rental scams work in Saudi Arabia (fake agents, fake FAL licences and Ejar invoices, SADAD/IBAN payments) and how to protect yourself before paying rent.",
  alternates: { canonical: URL },
  openGraph: {
    title: "⚠️ Fake Apartment Rental Scams in Saudi Arabia — Protect Yourself",
    description: "Read this before paying rent or a deposit for an apartment you found online.",
    url: URL,
    type: "article",
  },
};

const C = {
  red: "#b91c1c",
  redBg: "#fef2f2",
  navy: "#0c1730",
  green: "#005744",
  muted: "#4b5563",
};

const card: CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: "clamp(16px, 3vw, 24px)",
  margin: "16px 0",
  boxShadow: "0 6px 18px rgba(0,0,0,.04)",
};

const steps = [
  ["Attractive Rental Ads", "Scammers post photos of furnished apartments at low prices to attract people."],
  ["WhatsApp Only", "They avoid phone calls and connect you to another person who claims to be a real estate agent."],
  ["Real Apartment, Fake Agent", "You may visit the actual apartment, but the owner and building guard may know nothing about the scam."],
  ["Fake Documents", "Scammers may show fake FAL licences, rental documents or Ejar invoices to gain your trust."],
  ["Iqama Copy Requested", "They ask for your Iqama copy and send a fake rental invoice."],
  ["Payment Requested", "They may ask you to pay through SADAD or a bank transfer to an IBAN."],
  ["More Money Demanded", "After receiving your payment, they may ask for an extra security deposit and then stop responding."],
];

const protect: [string, ReactNode][] = [
  ["Verify with the owner", "Contact the property owner or building management directly before paying."],
  [
    "Check the FAL licence",
    <>
      Verify the licence and advertisement details yourself through the official{" "}
      <a href="https://rega.gov.sa/" target="_blank" rel="noopener noreferrer">REGA website</a>.
    </>,
  ],
  [
    "Use the official Ejar platform",
    "Check and approve your rental contract through the official platform. Do not trust an invoice sent only through WhatsApp.",
  ],
  ["Avoid suspicious payments", "Do not pay a SADAD bill or transfer money to an IBAN just because someone sends you an invoice."],
  ["Check the recipient's name", "If the payment recipient does not match the verified owner or authorised agency, stop."],
  ["Meet at a real office", "Be cautious if the agent repeatedly avoids meeting you at a legitimate office."],
];

export default function RentalScamWarningPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Warning: Fake Apartment Rental Scams in Saudi Arabia",
    url: URL,
    publisher: { "@type": "Organization", name: "MYKSA Connect", url: "https://www.myksaconnect.com" },
  };

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px 60px", color: C.navy, lineHeight: 1.65 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <a href="/ksa-connect" style={{ display: "inline-block", margin: "6px 0 14px", color: C.green, fontWeight: 700, fontSize: 14 }}>
        ← Back to listings
      </a>

      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${C.redBg}, #fff7ed)`,
          border: `2px solid ${C.red}`,
          borderRadius: 18,
          padding: "clamp(18px, 4vw, 30px)",
        }}
      >
        <p style={{ margin: 0, color: C.red, fontWeight: 900, letterSpacing: 0.6, fontSize: 13 }}>⚠️ WARNING</p>
        <h1 style={{ margin: "6px 0 8px", fontSize: "clamp(1.5rem, 4.5vw, 2.2rem)", lineHeight: 1.2, color: C.red }}>
          Fake Apartment Rental Scams in Saudi Arabia
        </h1>
        <p style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>Protect Yourself Before Paying Rent!</p>
        <p style={{ margin: "10px 0 0", color: C.muted }}>
          Fake apartment rental scams have been reported in Saudi Arabia. These scams can happen in any city, and
          victims have lost thousands of Saudi Riyals.
        </p>
      </section>

      {/* How it works */}
      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.red }}>🚨 How Does the Scam Work?</h2>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {steps.map(([title, text], i) => (
            <li key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span
                style={{
                  flex: "none", width: 28, height: 28, borderRadius: "50%", background: C.red, color: "#fff",
                  display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14,
                }}
              >
                {i + 1}
              </span>
              <span>
                <strong>{title}:</strong> {text}
              </span>
            </li>
          ))}
        </ol>
        <p
          style={{
            margin: "16px 0 0", padding: "12px 14px", borderRadius: 12, background: "#fff7ed",
            border: "1px solid #fdba74", fontWeight: 700,
          }}
        >
          Remember: Visiting an apartment does not prove that the person is authorised to rent it.
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: C.muted, fontStyle: "italic" }}>
          These details are reproduced from the supplied report and have not been independently verified by MYKSA CONNECT.
        </p>
      </section>

      {/* Protect yourself */}
      <section style={card}>
        <h2 style={{ marginTop: 0, color: C.green }}>✅ How to Protect Yourself</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {protect.map(([title, text]) => (
            <li key={title} style={{ display: "flex", gap: 10 }}>
              <span style={{ color: C.green, fontWeight: 900 }}>✔</span>
              <span>
                <strong>{title}:</strong> {text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Job seekers */}
      <section style={{ ...card, borderLeft: "5px solid #d4a017" }}>
        <h2 style={{ marginTop: 0 }}>📢 Important Notice for Job Seekers and Marketers</h2>
        <p>Scammers may recruit job seekers or freelance marketers to publish apartment advertisements on their behalf.</p>
        <p>
          If someone offers you money to post rental ads or asks you to advertise apartments using your name or phone
          number, be careful.
        </p>
        <ul style={{ paddingLeft: 20, margin: 0, display: "grid", gap: 6 }}>
          <li>Never publish an advertisement without verifying the owner and agent.</li>
          <li>Do not trust licences or contracts sent through WhatsApp without checking them independently.</li>
          <li>
            Your account or contact details could be linked to fraudulent advertisements, potentially leading to
            complaints or account restrictions.
          </li>
        </ul>
      </section>

      {/* Affected */}
      <section style={card}>
        <h2 style={{ marginTop: 0 }}>🚔 Have You Been Affected?</h2>
        <p>
          If you believe you have been scammed, report the incident to the relevant authorities and keep copies of
          payment receipts, messages, phone numbers and advertisements.
        </p>
        <p style={{ marginBottom: 0 }}>
          You can also email{" "}
          <a href="mailto:myksaconnect@gmail.com" style={{ fontWeight: 700 }}>myksaconnect@gmail.com</a> with the
          advertisement link.
        </p>
      </section>

      {/* Reminder */}
      <section
        style={{
          ...card,
          background: C.navy,
          color: "#fff",
          border: "1px solid #d4a017",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#f6b91f" }}>MYKSA CONNECT Safety Reminder</h2>
        <p style={{ marginBottom: 0 }}>
          We provide a platform for local advertisements and listings. Always verify the property, the agent&apos;s
          authority and the payment details before making any transaction.
        </p>
      </section>
    </main>
  );
}
