"use client";

import { useState } from "react";

const IS_KSA_CONNECT_SITE = process.env.NEXT_PUBLIC_SITE_MODE === "ksaconnect";

const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Jubail", "Yanbu", "Madinah"];

export default function CreateMenuRequestPage() {
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !contactName.trim() || !phone.trim()) {
      setError("Please fill in the business name, contact person, and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/menu-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          phone: phone.trim(),
          whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim(),
          email: email.trim(),
          city,
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mk-page">
      <div style={{ background: "var(--mk-navy, #06172a)", paddingBottom: 2 }}>
        <div style={{ width: "min(1500px, 90vw)", margin: "0 auto", padding: "16px 0" }}>
          <nav className="mk-nav">
            <a href={IS_KSA_CONNECT_SITE ? "/ksa-connect" : "/"} className="mk-logo" aria-label="MYKSA CONNECT home">
              <span className="mk-logo-mark">✦</span>
              <span className="mk-logo-text">
                {IS_KSA_CONNECT_SITE ? (
                  <>
                    <strong>MYKSA</strong> <b>CONNECT</b>
                    <small>BUY. SELL. CONNECT.</small>
                  </>
                ) : (
                  <strong>MOA Apps Developer&apos;s</strong>
                )}
              </span>
            </a>
          </nav>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, var(--mk-navy, #06172a), var(--mk-green-deep, #003c31))",
          color: "#fff",
          padding: "34px 0 42px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", margin: "0 0 8px", fontWeight: 850, letterSpacing: "-0.6px" }}>
          Create a <span style={{ color: "var(--mk-gold, #f6b91f)" }}>Digital Menu</span>
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,.82)", fontSize: 15 }}>
          Tell us about your restaurant and we&apos;ll reach out to set up your digital menu.
        </p>
      </div>

      <main style={{ maxWidth: 680, margin: "-28px auto 60px", padding: "0 20px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 16px 38px rgba(6,23,42,.1)",
            border: "1px solid #e6e4dc",
            padding: "32px 28px",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <h2 style={{ margin: "0 0 10px", color: "var(--mk-navy, #06172a)" }}>Request received!</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14.5, maxWidth: 420, margin: "0 auto" }}>
                Thanks — we&apos;ve got your details and will contact you on WhatsApp or by phone shortly to set up your
                digital menu.
              </p>
              <a href="/restaurants" className="mk-btn mk-btn-gold" style={{ marginTop: 20, display: "inline-flex" }}>
                Browse Digital Menus
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={fieldLabel}>Restaurant / Business Name *</label>
              <input
                style={inputStyle}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Al Baik Express"
              />

              <label style={fieldLabel}>Contact Person Name *</label>
              <input
                style={inputStyle}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Ahmed Al-Saud"
              />

              <label style={fieldLabel}>Phone Number *</label>
              <input
                style={inputStyle}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 5XXXXXXXX"
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  margin: "10px 0 4px",
                  cursor: "pointer",
                }}
              >
                <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} />
                WhatsApp number is the same as above
              </label>

              {!sameAsPhone && (
                <>
                  <label style={fieldLabel}>WhatsApp Number</label>
                  <input
                    style={inputStyle}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 5XXXXXXXX"
                  />
                </>
              )}

              <label style={fieldLabel}>Email (optional)</label>
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@restaurant.com"
              />

              <label style={fieldLabel}>City</label>
              <div style={chipRow}>
                {CITIES.map((c) => (
                  <button type="button" key={c} style={chip(city === c)} onClick={() => setCity(c)}>
                    {c}
                  </button>
                ))}
              </div>

              <label style={fieldLabel}>Anything else we should know? (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 90 }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. number of menu items, preferred languages, existing menu photos..."
              />

              {error && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 8 }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mk-btn mk-btn-gold"
                style={{ width: "100%", marginTop: 22, padding: "14px 0", fontSize: 15, justifyContent: "center" }}
              >
                {submitting ? "Sending…" : "Submit Request"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/restaurants" style={{ color: "var(--mk-navy, #06172a)", fontWeight: 700, fontSize: 13.5 }}>
            ← Back to Digital Menus
          </a>
        </p>
      </main>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--mk-navy, #06172a)",
  marginTop: 18,
  marginBottom: 8,
};

const chipRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

function chip(active: boolean): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: 999,
    border: active ? "1.5px solid var(--mk-gold, #f6b91f)" : "1px solid #e4e1d8",
    background: active ? "#fff8df" : "#fff",
    color: active ? "#7a5a00" : "var(--text-muted)",
    fontWeight: active ? 800 : 600,
    fontSize: 13,
    cursor: "pointer",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e4e1d8",
  fontSize: 14,
  fontFamily: "inherit",
};
