"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["🪪", "Iqama Expiry Calculator", "/tools/iqama-expiry-calculator/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🧮", "Zakat Calculator", "/tools/zakat-calculator/"],
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toInputDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseInputDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;
  return date;
}

function formatGregorian(date: Date) {
  return new Intl.DateTimeFormat("en-SA", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHijriParts(date: Date) {
  try {
    const formatter = new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "";

    return {
      weekday: get("weekday"),
      day: get("day"),
      month: get("month"),
      year: get("year"),
    };
  } catch {
    return {
      weekday: "",
      day: "",
      month: "Hijri date unavailable",
      year: "",
    };
  }
}

function formatGregorianParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";

  return {
    weekday: get("weekday"),
    day: get("day"),
    month: get("month"),
    year: get("year"),
  };
}

export default function HijriGregorianConverter() {
  const today = useMemo(() => new Date(), []);
  const [gregorianDate, setGregorianDate] = useState(toInputDate(today));
  const [submitted, setSubmitted] = useState(true);

  const selectedDate = parseInputDate(gregorianDate);

  const result = selectedDate
    ? {
        gregorian: formatGregorianParts(selectedDate),
        hijri: formatHijriParts(selectedDate),
      }
    : null;

  return (
    <main className="hgc-page">
      <style jsx>{`
        .hgc-page {
          min-height: 100vh;
          background: #fbfaf7;
          color: #0b1719;
          font-family: inherit;
        }

        .hgc-hero {
          position: relative;
          overflow: hidden;
          min-height: 440px;
          background:
            linear-gradient(
              110deg,
              #06423a 0%,
              #06423a 22%,
              #06443c 42%,
              #005044 68%,
              #005744 100%
            );
          color: #fff;
          padding: 20px 20px 112px;
        }

        .hgc-hero-art {
          position: absolute;
          z-index: 1;
          top: 0;
          right: 0;
          width: 65%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          pointer-events: none;
          overflow: hidden;
        }

        .hgc-hero-art::before {
          content: "";
          position: absolute;
          z-index: 2;
          top: 0;
          bottom: 0;
          left: -2px;
          width: 58%;
          background: linear-gradient(
            90deg,
            #06423a 0%,
            #06423a 18%,
            rgba(6,66,58,.96) 34%,
            rgba(6,66,58,.78) 48%,
            rgba(6,66,58,.48) 66%,
            rgba(6,66,58,.18) 84%,
            rgba(6,66,58,0) 100%
          );
        }

        .hgc-hero-art::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          background: linear-gradient(
            180deg,
            rgba(6,23,42,.015) 35%,
            rgba(6,23,42,.12) 100%
          );
        }

        .hgc-hero-art img {
          width: 100%;
          max-width: none;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
          margin-left: auto;
        }

        .hgc-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .02;
          background-image:
            linear-gradient(30deg, rgba(255,255,255,.15) 1px, transparent 1px),
            linear-gradient(150deg, rgba(255,255,255,.10) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to right, #000 0%, transparent 58%);
        }

        .hgc-hero::after {
          content: "☪";
          position: absolute;
          right: 9%;
          top: 15px;
          color: rgba(246,185,31,.24);
          font-size: 145px;
          line-height: 1;
          transform: rotate(-8deg);
        }

        .hgc-shell {
          width: min(1500px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 3;
        }

        .hgc-crumbs {
          font-size: 12px;
          color: rgba(255,255,255,.74);
          margin-bottom: 27px;
        }

        .hgc-crumbs a {
          color: #f6b91f;
          text-decoration: none;
          font-weight: 800;
        }

        .hgc-hero-content {
          position: relative;
          z-index: 5;
          width: min(48%, 820px);
          max-width: 820px;
        }

        .hgc-kicker {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .06em;
          text-transform: uppercase;
          margin: 0 0 10px;
        }

        .hgc-kicker::before {
          content: "▣";
          color: #f6b91f;
          font-size: 16px;
        }

        h1 {
          margin: 0 0 13px;
          font-size: clamp(36px, 4.7vw, 54px);
          line-height: 1.03;
          letter-spacing: -1.9px;
          color: #fff;
          text-shadow: 0 3px 16px rgba(0,0,0,.20);
        }

        .hgc-lead {
          margin: 0;
          max-width: 850px;
          color: rgba(255,255,255,.88);
          font-size: 17px;
          line-height: 1.65;
        }

        .hgc-lead strong {
          color: #f6b91f;
        }

        .hgc-content {
          position: relative;
          z-index: 5;
          margin-top: -55px;
          padding: 0 20px 70px;
        }

        .hgc-main-card {
          width: min(1500px, 100%);
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e2e8e4;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 22px 60px rgba(6,23,42,.15);
        }

        .hgc-converter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .hgc-panel {
          border-radius: 17px;
          padding: 28px;
          min-height: 270px;
        }

        .hgc-input-panel {
          background: linear-gradient(145deg, #f1faf6 0%, #fff 82%);
          border: 1px solid #d7e9e1;
        }

        .hgc-result-panel {
          background: linear-gradient(145deg, #fffaf0 0%, #fff 82%);
          border: 1px solid #f0dfad;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hgc-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .hgc-panel-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #005744;
          font-size: 23px;
          font-weight: 900;
        }

        .hgc-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #dcefe7;
          font-size: 20px;
        }

        .hgc-gold-icon {
          background: #fff0bf;
        }

        .hgc-badge {
          background: #fff3c4;
          border: 1px solid #f3d46a;
          color: #8a6200;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .hgc-label {
          display: block;
          margin-bottom: 8px;
          color: #263735;
          font-size: 13px;
          font-weight: 900;
        }

        .hgc-input {
          width: 100%;
          box-sizing: border-box;
          min-height: 52px;
          border: 1px solid #cbd9d4;
          border-radius: 11px;
          background: #fff;
          padding: 12px 14px;
          color: #102123;
          font: inherit;
          font-size: 16px;
        }

        .hgc-input:focus {
          outline: 3px solid rgba(0,87,68,.12);
          border-color: #005744;
        }

        .hgc-button {
          width: 100%;
          min-height: 52px;
          margin-top: 15px;
          border: 0;
          border-radius: 11px;
          background: #005744;
          color: #fff;
          font: inherit;
          font-weight: 900;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0,87,68,.17);
        }

        .hgc-button:hover {
          background: #003c31;
        }

        .hgc-helper {
          display: flex;
          gap: 7px;
          align-items: flex-start;
          margin-top: 12px;
          color: #5e6e6a;
          font-size: 12px;
          line-height: 1.55;
        }

        .hgc-result-heading {
          text-align: center;
          color: #8a6200;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .07em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .hgc-result-title {
          text-align: center;
          color: #005744;
          font-size: 21px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .hgc-date-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #dfe5df;
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
        }

        .hgc-date-side {
          padding: 16px 14px;
          text-align: center;
        }

        .hgc-date-side:first-child {
          background: #eaf7f0;
          border-right: 1px solid #dbe8e1;
        }

        .hgc-date-side:last-child {
          background: #fff5d7;
        }

        .hgc-date-side-label {
          display: block;
          color: #5e6d69;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .hgc-day {
          display: block;
          color: #005744;
          font-size: 40px;
          line-height: .95;
          font-weight: 950;
        }

        .hgc-month {
          display: block;
          margin-top: 6px;
          color: #005744;
          font-size: 20px;
          font-weight: 900;
          line-height: 1.2;
          white-space: nowrap;
        }

        .hgc-year {
          display: block;
          margin-top: 3px;
          color: #005744;
          font-size: 17px;
          font-weight: 800;
        }

        .hgc-date-side:last-child .hgc-day,
        .hgc-date-side:last-child .hgc-month,
        .hgc-date-side:last-child .hgc-year {
          color: #8a6200;
        }

        .hgc-weekday {
          display: inline-block;
          margin-top: 8px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(0,87,68,.09);
          color: #005744;
          font-size: 11px;
          font-weight: 800;
        }

        .hgc-date-side:last-child .hgc-weekday {
          background: rgba(212,155,0,.12);
          color: #8a6200;
        }

        .hgc-note {
          margin-top: 13px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #fff8df;
          color: #665b38;
          font-size: 11px;
          line-height: 1.55;
        }

        .hgc-note strong {
          color: #8a6200;
        }

        .hgc-section {
          width: min(1500px, 100%);
          margin: 22px auto 0;
        }

        .hgc-section-card {
          background: #fff;
          border: 1px solid #e2e8e4;
          border-radius: 19px;
          padding: 24px;
        }

        .hgc-section-card h2 {
          margin: 0 0 9px;
          color: #06172a;
          font-size: 24px;
        }

        .hgc-section-intro {
          margin: 0;
          color: #5b6966;
          font-size: 14px;
          line-height: 1.7;
        }

        .hgc-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
          margin-top: 17px;
        }

        .hgc-info {
          border-radius: 15px;
          padding: 18px;
          background: linear-gradient(145deg,#eff9f4,#fff);
          border: 1px solid #dceae4;
        }

        .hgc-info:nth-child(2) {
          background: linear-gradient(145deg,#fff9ec,#fff);
          border-color: #eee1bd;
        }

        .hgc-info-icon {
          font-size: 25px;
          margin-bottom: 7px;
        }

        .hgc-info h3 {
          margin: 0 0 6px;
          color: #102123;
          font-size: 16px;
        }

        .hgc-info p {
          margin: 0;
          color: #62706d;
          font-size: 13px;
          line-height: 1.6;
        }

        .hgc-faq {
          border-top: 1px solid #e2e8e4;
          padding: 14px 0;
        }

        .hgc-faq:first-child {
          border-top: 0;
        }

        .hgc-faq summary {
          cursor: pointer;
          color: #20302f;
          font-size: 15px;
          font-weight: 850;
          list-style-position: outside;
        }

        .hgc-faq p {
          margin: 8px 0 0;
          color: #65716f;
          font-size: 13px;
          line-height: 1.65;
        }

        .hgc-related {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 10px;
          margin-top: 16px;
        }

        .hgc-related a {
          text-decoration: none;
          color: #102123;
          background: #fff;
          border: 1px solid #e1e8e5;
          border-radius: 13px;
          padding: 14px;
          font-size: 12px;
          font-weight: 900;
          transition: .18s ease;
        }

        .hgc-related a:hover {
          transform: translateY(-2px);
          border-color: #005744;
          box-shadow: 0 8px 20px rgba(6,23,42,.07);
        }

        .hgc-related-icon {
          display: block;
          font-size: 23px;
          margin-bottom: 8px;
        }

        @media (max-width: 900px) {
          .hgc-hero {
            min-height: 380px;
          }

          .hgc-hero-art {
            width: 68%;
          }

          .hgc-hero-content {
            width: min(58%, 820px);
          }
        }

        @media (max-width: 820px) {
          .hgc-converter-grid {
            grid-template-columns: 1fr;
          }

          .hgc-related {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media (max-width: 600px) {
          .hgc-hero {
            min-height: 360px;
          }

          .hgc-hero-art {
            width: 100%;
            height: 62%;
            top: auto;
            bottom: 0;
            opacity: .55;
          }

          .hgc-hero-art img {
            width: 100%;
          }

          .hgc-hero-art::before {
            background: linear-gradient(
              90deg,
              #06172a 0%,
              rgba(6,23,42,.72) 35%,
              rgba(0,60,49,.18) 100%
            );
          }

          .hgc-hero-content {
            width: 100%;
          }

          .hgc-hero {
            padding: 22px 14px 78px;
          }

          .hgc-content {
            padding: 0 12px 50px;
          }

          .hgc-main-card {
            padding: 11px;
            border-radius: 18px;
          }

          .hgc-panel {
            padding: 20px;
          }

          .hgc-date-card {
            grid-template-columns: 1fr;
          }

          .hgc-date-side:first-child {
            border-right: 0;
            border-bottom: 1px solid #dbe8e1;
          }

          .hgc-month {
            white-space: normal;
          }

          .hgc-info-grid {
            grid-template-columns: 1fr;
          }

          .hgc-related {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <section className="hgc-hero">
        <div className="hgc-hero-art" aria-hidden="true">
          <img
            src="/images/MYKSA_Hijri_Gregorian_Header_Banner.png"
            alt=""
          />
        </div>
        <div className="hgc-shell">
          <div className="hgc-crumbs">
            <a href="/">MYKSA CONNECT</a> &nbsp;›&nbsp;
            <a href="/tools/">Saudi Expat Tools</a> &nbsp;›&nbsp;
            Hijri / Gregorian Converter
          </div>

          <div className="hgc-hero-content">
            <p className="hgc-kicker">Saudi Expat Tool</p>
            <h1>Hijri / Gregorian Date Converter</h1>
            <p className="hgc-lead">
              Convert a Gregorian date to its corresponding Hijri date using
              the Saudi <strong>Umm al-Qura calendar</strong>.
              <br />
              Accurate, fast and free — no login required.
            </p>
          </div>
        </div>
      </section>

      <section className="hgc-content">
        <div className="hgc-main-card">
          <div className="hgc-converter-grid">
            <div className="hgc-panel hgc-input-panel">
              <div className="hgc-panel-head">
                <div className="hgc-panel-title">
                  <span className="hgc-icon">📅</span>
                  Gregorian Date
                </div>
                <span className="hgc-badge">Free Tool</span>
              </div>

              <label className="hgc-label" htmlFor="gregorian-date">
                Select Gregorian date
              </label>

              <input
                id="gregorian-date"
                className="hgc-input"
                type="date"
                value={gregorianDate}
                onChange={(e) => {
                  setGregorianDate(e.target.value);
                  setSubmitted(false);
                }}
              />

              <button
                className="hgc-button"
                type="button"
                onClick={() => setSubmitted(true)}
              >
                ↻ &nbsp; Convert Date
              </button>

              <div className="hgc-helper">
                <span>ⓘ</span>
                <span>
                  Select any Gregorian date to get the corresponding Hijri date
                  using the Saudi Umm al-Qura calendar.
                </span>
              </div>
            </div>

            <div className="hgc-panel hgc-result-panel">
              {submitted && result ? (
                <>
                  <div className="hgc-result-heading">Conversion Result</div>
                  <div className="hgc-result-title">
                    🌙 &nbsp; Hijri Date (Umm al-Qura)
                  </div>

                  <div className="hgc-date-card">
                    <div className="hgc-date-side">
                      <span className="hgc-date-side-label">Gregorian Date</span>
                      <span className="hgc-day">{result.gregorian.day}</span>
                      <span className="hgc-month">{result.gregorian.month}</span>
                      <span className="hgc-year">{result.gregorian.year}</span>
                      <span className="hgc-weekday">{result.gregorian.weekday}</span>
                    </div>

                    <div className="hgc-date-side">
                      <span className="hgc-date-side-label">Hijri Date (Umm al-Qura)</span>
                      <span className="hgc-day">{result.hijri.day}</span>
                      <span className="hgc-month">{result.hijri.month}</span>
                      <span className="hgc-year">{result.hijri.year} AH</span>
                      <span className="hgc-weekday">{result.hijri.weekday}</span>
                    </div>
                  </div>

                  <div className="hgc-note">
                    <strong>Saudi calendar note:</strong> Hijri conversion
                    uses your browser&apos;s Umm al-Qura Islamic calendar
                    support where available. Results can differ from manually
                    sighted moon dates used for some religious occasions.
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#62706d" }}>
                  <div style={{ fontSize: 38, marginBottom: 8 }}>🌙</div>
                  <strong style={{ display: "block", color: "#06172a", fontSize: 18 }}>
                    Your Hijri result will appear here
                  </strong>
                  <span>Select a date and tap “Convert Date”.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hgc-section">
          <div className="hgc-section-card">
            <h2>How to use this converter</h2>
            <p className="hgc-section-intro">
              Select the Gregorian date and tap <strong>Convert Date</strong>.
              The converter displays the corresponding Hijri date using the
              Saudi Umm al-Qura calendar.
            </p>

            <div className="hgc-info-grid">
              <div className="hgc-info">
                <div className="hgc-info-icon">📅</div>
                <h3>Select the Gregorian date</h3>
                <p>
                  Choose the date you want to convert from the date picker.
                </p>
              </div>

              <div className="hgc-info">
                <div className="hgc-info-icon">🌙</div>
                <h3>View the Hijri date</h3>
                <p>
                  The corresponding Umm al-Qura Hijri date appears in the result
                  panel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hgc-section">
          <div className="hgc-section-card">
            <h2>Frequently Asked Questions</h2>

            <details className="hgc-faq">
              <summary>Which Hijri calendar does this tool use?</summary>
              <p>
                It uses the browser&apos;s Islamic Umm al-Qura calendar
                implementation where available.
              </p>
            </details>

            <details className="hgc-faq">
              <summary>Can I use this converter on my phone?</summary>
              <p>
                Yes. The page is responsive and works on mobile, tablet and
                desktop browsers.
              </p>
            </details>

            <details className="hgc-faq">
              <summary>Is my date uploaded or stored?</summary>
              <p>
                No login is required and the conversion is performed in the
                browser.
              </p>
            </details>
          </div>
        </div>

        <div className="hgc-section">
          <div className="hgc-section-card">
            <h2>More Saudi Expat Tools</h2>

            <div className="hgc-related">
              {TOOL_LINKS.map(([icon, title, href]) => (
                <a href={href} key={href}>
                  <span className="hgc-related-icon">{icon}</span>
                  {title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
