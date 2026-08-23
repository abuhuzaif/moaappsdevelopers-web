import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fraud Prevention & Safety Notice — KSA-Connect",
  description:
    "Stay safe on KSA-Connect: verify identity and details before any deal, never share OTPs or bank details, and report suspicious listings.",
  alternates: {
    canonical: "https://www.myksaconnect.com/ksa-connect/safety",
  },
};

export default function SafetyNoticePage() {
  return (
    <div className="mk-page">
      <main className="container" style={{ maxWidth: 760, padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>
          ⚠️ Fraud Prevention &amp; Safety Notice
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
          Important Notice from the MYKSA CONNECT Team
        </p>

        <section style={{ marginBottom: 28 }}>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
            MYKSA CONNECT is a platform that helps users connect with individuals, businesses,
            buyers, sellers, property owners, and service providers through advertisements and
            listings.
          </p>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
            MYKSA CONNECT does not act as a party to any transaction or private agreement
            between users.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            Users are solely responsible for verifying the identity, information, products,
            properties, vehicles, services, and payment details of the person or party they
            choose to deal with.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>🛡️ Stay Alert Before Making Any Deal</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
            Before entering into any transaction or agreement, we strongly advise you to:
          </p>
          <ul style={{ lineHeight: 1.9, paddingLeft: 20 }}>
            <li>Carefully verify the identity and information of the other party.</li>
            <li>Verify the authenticity and ownership of the property, vehicle, product, or service.</li>
            <li>Confirm all details before making any payment or advance payment.</li>
            <li>Never share your OTP, password, bank details, or other sensitive information with anyone.</li>
            <li>Do not transfer money solely based on an advertisement or online communication.</li>
            <li>Ask for proper clarification and supporting information before proceeding.</li>
            <li>Only proceed with a transaction after you have independently verified the details and are completely satisfied.</li>
          </ul>
        </section>

        <section
          style={{
            marginBottom: 28,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 10 }}>⚠️ Important Disclaimer</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 12, fontSize: 14 }}>
            MYKSA CONNECT Team shall not be responsible for any fraud, scam, misleading
            information, false representation, unauthorized transaction, financial loss, or
            other dispute arising from dealings between users, except where responsibility is
            imposed on MYKSA CONNECT under applicable law.
          </p>
          <p style={{ lineHeight: 1.7, fontSize: 14, margin: 0 }}>
            Every user is advised to exercise due diligence and caution before entering into
            any transaction.
          </p>
        </section>

        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 18, marginBottom: 10 }}>🔐 Remember</h2>
          <p style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.3, marginBottom: 14 }}>
            VERIFY FIRST — DEAL LATER.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            If you come across a suspicious, misleading, or potentially fraudulent listing,
            please report it to the MYKSA CONNECT Team for review.
          </p>
        </section>

        <p style={{ marginTop: 40, fontWeight: 700, color: "var(--text-muted)" }}>
          MYKSA CONNECT Team
          <br />
          <span style={{ fontWeight: 400 }}>Find. Connect. Grow.</span>
        </p>

        <p style={{ marginTop: 32 }}>
          <a href="/ksa-connect">← Back to listings</a>
        </p>
      </main>
    </div>
  );
}
