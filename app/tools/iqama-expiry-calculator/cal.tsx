"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["🔄", "Hijri / Gregorian Converter", "/tools/hijri-gregorian-converter/"],
  ["💰", "Salary Calculator", "/tools/salary-calculator/"],
  ["💱", "SAR Currency Converter", "/tools/sar-currency-converter/"],
  ["🏠", "Rent Split Calculator", "/tools/rent-split-calculator/"],
  ["🧮", "Zakat Calculator", "/tools/zakat-calculator/"],
];

function formatGregorian(date: Date) {
  return new Intl.DateTimeFormat("en-SA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHijri(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "Hijri date unavailable in this browser";
  }
}

function parseDate(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function calendarMonthsAndDays(from: Date, to: Date) {
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());

  let anchor = new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth() + months,
      from.getUTCDate()
    )
  );

  if (anchor > to) {
    months -= 1;
    anchor = new Date(
      Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth() + months,
        from.getUTCDate()
      )
    );
  }

  const days = Math.round((to.getTime() - anchor.getTime()) / 86400000);
  return { months: Math.max(months, 0), days: Math.max(days, 0) };
}

export default function IqamaExpiryCalculator() {
  const [expiry, setExpiry] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const expiryDate = parseDate(expiry);
    if (!expiryDate) return null;

    const today = todayUtc();
    const days = Math.round(
      (expiryDate.getTime() - today.getTime()) / 86400000
    );
    const expired = days < 0;
    const until = Math.abs(days);
    const md = expired
      ? calendarMonthsAndDays(expiryDate, today)
      : calendarMonthsAndDays(today, expiryDate);

    return {
      expiryDate,
      today,
      days,
      expired,
      absoluteDays: until,
      months: md.months,
      remainderDays: md.days,
      hijri: formatHijri(expiryDate),
    };
  }, [expiry]);

  return (
    <main className="iqama-tool-page">
      <style jsx>{`
        .iqama-tool-page {
          min-height: 100vh;
          background: #fbfaf7;
          color: #0b1719;
          font-family: inherit;
        }

        .tool-hero {
          position: relative;
          overflow: hidden;
          min-height: 355px;
          color: #fff;
          background-color: #063f37;
          background-image:
            linear-gradient(
              90deg,
              rgba(3, 48, 42, 0.96) 0%,
              rgba(3, 48, 42, 0.88) 24%,
              rgba(3, 48, 42, 0.60) 43%,
              rgba(3, 48, 42, 0.16) 63%,
              rgba(3, 48, 42, 0) 78%
            ),
            url("/images/MYKSA_Iqama_Clean_Banner.png");
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }

        .hero-inner {
          width: min(1180px, 100%);
          min-height: 355px;
          margin: 0 auto;
          position: relative;
        }

        .hero-copy {
          position: relative;
          z-index: 3;
          width: min(620px, 50vw);
          min-height: 355px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 34px 20px 72px 0;
        }

        .hero-copy::after {
          display: none;
        }

        .hero-image {
          display: none;
        }

        .hero-breadcrumb {
          position: relative;
          z-index: 4;
          margin-bottom: 26px;
          font-size: 12px;
          font-weight: 700;
        }

        .hero-breadcrumb a {
          color: #f6b91f;
          text-decoration: none;
        }

        .hero-label {
          position: relative;
          z-index: 4;
          margin: 0 0 10px;
          color: #f6b91f;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .hero-title {
          position: relative;
          z-index: 4;
          margin: 0;
          max-width: 680px;
          font-size: clamp(42px, 4.2vw, 62px);
          line-height: 1.04;
          letter-spacing: -2px;
          color: #fff;
        }

        .hero-description {
          position: relative;
          z-index: 4;
          max-width: 650px;
          margin: 16px 0 0;
          color: rgba(255, 255, 255, 0.92);
          font-size: 17px;
          line-height: 1.6;
        }

        .hero-accessible-content {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .tool-shell {
          display: none;
        }

        .hero-accessible-content {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .tool-shell {
          width: min(1400px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 2;
          min-height: 500px;
        }

        .content {
          margin-top: -44px;
          padding: 0 20px 60px;
          position: relative;
          z-index: 5;
        }

        .card {
          width: min(1180px, 100%);
          margin: 0 auto;
          background: #fff;
          border: 1px solid #e4e8e5;
          border-radius: 20px;
          box-shadow: 0 18px 50px rgba(6, 23, 42, 0.12);
          padding: 16px;
        }

        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .input-panel,
        .result-panel {
          min-width: 0;
          border-radius: 15px;
          padding: 24px;
          border: 1px solid #d9e7e1;
        }

        .input-panel {
          background: linear-gradient(145deg, #f0faf6 0%, #ffffff 70%);
        }

        .result-panel {
          background: linear-gradient(145deg, #fffdf7 0%, #fffaf0 100%);
          border-color: #ecdcae;
        }

        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 22px;
        }

        .panel-title {
          margin: 0;
          font-size: 25px;
          line-height: 1.15;
          color: #005744;
          font-weight: 900;
        }

        .panel-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          margin-right: 8px;
          border-radius: 10px;
          background: #dcefe8;
          vertical-align: middle;
        }

        .free-badge {
          flex: 0 0 auto;
          padding: 6px 11px;
          border-radius: 999px;
          border: 1px solid #f0ca57;
          background: #fff8dd;
          color: #8a5b00;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .field-label {
          display: block;
          margin: 0 0 8px;
          color: #233335;
          font-size: 13px;
          font-weight: 800;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cfd9d5;
          border-radius: 12px;
          padding: 14px 15px;
          font: inherit;
          font-size: 16px;
          background: #fff;
          color: #102123;
        }

        input:focus {
          outline: 3px solid rgba(246, 185, 31, 0.25);
          border-color: #005744;
        }

        .hint {
          font-size: 12px;
          color: #6b7776;
          margin: 8px 0 16px;
        }

        .btn {
          width: 100%;
          border: 0;
          border-radius: 12px;
          background: #005f4d;
          color: #fff;
          font-weight: 900;
          padding: 14px 22px;
          font: inherit;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0, 95, 77, 0.16);
        }

        .btn:hover {
          background: #004f40;
        }

        .privacy {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 11px;
          background: #edf7f3;
          color: #536765;
          font-size: 11px;
          line-height: 1.45;
        }

        .result-panel {
          display: flex;
          flex-direction: column;
        }

        .result-kicker {
          margin: 0 0 6px;
          text-align: center;
          color: #8a5b00;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .result-status {
          margin: 0 0 8px;
          text-align: center;
          color: #005744;
          font-size: 18px;
          font-weight: 900;
        }

        .result.expired .result-status {
          color: #b42318;
        }

        .big {
          margin: 0 0 14px;
          text-align: center;
          color: #071d35;
          font-size: clamp(32px, 3.2vw, 45px);
          font-weight: 900;
          line-height: 1.05;
        }

        .result-box {
          overflow: hidden;
          border: 1px solid #eadfbe;
          border-radius: 14px;
          background: #fff;
        }

        .date-line {
          margin: 0;
          padding: 14px 16px;
          color: #344846;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
        }

        .date-line strong {
          color: #005744;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .stat {
          border: 1px solid #e0e6e3;
          border-radius: 11px;
          background: #fff;
          padding: 11px 8px;
          text-align: center;
        }

        .stat span {
          display: block;
          color: #7a8583;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .stat strong {
          color: #14292a;
          font-size: 17px;
        }

        .empty-result {
          flex: 1;
          min-height: 205px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          border: 1px dashed #e7d7a7;
          border-radius: 14px;
          background: rgba(255, 250, 235, 0.75);
          padding: 20px;
        }

        .empty-result-icon {
          font-size: 34px;
          margin-bottom: 8px;
        }

        .empty-result h3 {
          margin: 0 0 5px;
          color: #805900;
          font-size: 18px;
        }

        .empty-result p {
          margin: 0;
          max-width: 300px;
          color: #6c6960;
          font-size: 12px;
          line-height: 1.5;
        }

        .result {
          margin: 0;
          border-radius: 14px;
          padding: 0;
          border: 0;
          background: transparent;
        }

        .result.expired {
          background: transparent;
          border: 0;
        }

        .section {
          width: min(1180px, 100%);
          margin: 46px auto 0;
        }

        .section h2 {
          font-size: 28px;
          margin: 0 0 12px;
          color: #06172a;
        }

        .section p {
          color: #566462;
          line-height: 1.75;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        .info {
          background: #fff;
          border: 1px solid #e2e9e6;
          border-radius: 15px;
          padding: 20px;
        }

        .info h3 {
          font-size: 16px;
          margin: 0 0 7px;
        }

        .info p {
          font-size: 14px;
          margin: 0;
        }

        .faq {
          border-top: 1px solid #dfe6e3;
          padding: 18px 0;
        }

        .faq h3 {
          font-size: 16px;
          margin: 0 0 6px;
        }

        .faq p {
          font-size: 14px;
          margin: 0;
        }

        .related {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .related a {
          display: block;
          text-decoration: none;
          color: #102123;
          background: #fff;
          border: 1px solid #e1e8e5;
          border-radius: 13px;
          padding: 14px;
          font-size: 13px;
          font-weight: 800;
        }

        .related a span {
          display: block;
          font-size: 22px;
          margin-bottom: 8px;
        }

        .privacy {
          font-size: 13px;
          color: #667370;
          background: #eef5f2;
          border-radius: 13px;
          padding: 15px;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .tool-hero {
            min-height: 330px;
            background-position: center center;
          }

          .hero-inner {
            min-height: 330px;
          }

          .hero-copy {
            width: min(650px, 64vw);
            min-height: 330px;
            padding: 30px 24px 58px 24px;
          }

          .hero-title {
            font-size: 44px;
          }

          .hero-description {
            font-size: 15px;
          }
        }

        @media (max-width: 760px) {
          .tool-hero {
            min-height: 330px;
            background-position: 62% center;
          }

          .hero-inner {
            min-height: 330px;
          }

          .hero-copy {
            width: 100%;
            min-height: 330px;
            padding: 22px 18px 48px;
          }

          .hero-breadcrumb {
            margin-bottom: 20px;
            font-size: 11px;
          }

          .hero-title {
            max-width: 430px;
            font-size: 42px;
            letter-spacing: -1.5px;
          }

          .hero-description {
            max-width: 430px;
            font-size: 15px;
            line-height: 1.55;
          }

          .calculator-grid {
            grid-template-columns: 1fr;
          }

          .input-panel,
          .result-panel {
            padding: 20px;
          }

          .content {
            padding: 0 14px 48px;
          }

          .card {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .stats,
          .info-grid {
            grid-template-columns: 1fr;
          }

          .related {
            grid-template-columns: 1fr 1fr;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <section className="tool-hero" aria-label="Iqama Expiry Calculator">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-breadcrumb">
              <a href="/">MYKSA CONNECT</a> <span>›</span>{" "}
              <a href="/tools/">Saudi Expat Tools</a> <span>›</span>{" "}
              <span>Iqama Expiry Calculator</span>
            </div>

            <p className="hero-label">▣ Saudi Expat Tool</p>

            <h1 className="hero-title">Iqama Expiry Calculator</h1>

            <p className="hero-description">
              Check your Iqama expiry date, remaining days and renewal details
              easily. Simple, fast and free — no login required.
            </p>
          </div>

          <div
            className="hero-image"
            role="img"
            aria-label="Saudi Riyadh skyline with Islamic architecture"
          />

          <div className="hero-accessible-content">
            <nav aria-label="Breadcrumb">
              <a href="/">MYKSA CONNECT</a> &gt;{" "}
              <a href="/tools/">Saudi Expat Tools</a> &gt; Iqama Expiry Calculator
            </nav>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="card">
          <div className="calculator-grid">
            <div className="input-panel">
              <div className="panel-head">
                <h2 className="panel-title">
                  <span className="panel-icon">📅</span>
                  Iqama Expiry Date
                </h2>
                <span className="free-badge">Free Tool</span>
              </div>

              <label className="field-label" htmlFor="iqama-expiry">
                Select your Iqama expiry date
              </label>

              <input
                id="iqama-expiry"
                type="date"
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                  setSubmitted(false);
                }}
              />

              <p className="hint">
                Enter the expiry date exactly as shown on your Iqama/official
                record.
              </p>

              <button className="btn" onClick={() => setSubmitted(true)}>
                ✓ Check Iqama Expiry
              </button>

              <div className="privacy">
                🔒 <strong>Privacy:</strong> this calculator runs in your
                browser. Your date is used only for the calculation and is not
                submitted to MYKSA CONNECT.
              </div>
            </div>

            <div className="result-panel">
              <p className="result-kicker">Iqama Expiry Status</p>

              {!submitted && (
                <div className="empty-result">
                  <div className="empty-result-icon">📅</div>
                  <h3>Check your Iqama expiry</h3>
                  <p>
                    Select your expiry date and tap “Check Iqama Expiry” to see
                    your remaining time and Hijri date.
                  </p>
                </div>
              )}

              {submitted && !result && (
                <div className="result expired">
                  <p className="result-status">Date required</p>
                  <p className="big">Please select an expiry date</p>
                </div>
              )}

              {result && (
                <div className={`result ${result.expired ? "expired" : ""}`}>
                  <p className="result-status">
                    {result.expired
                      ? "⚠ Iqama has expired"
                      : "✓ Iqama is currently valid"}
                  </p>

                  <p className="big">
                    {result.expired
                      ? `${result.absoluteDays} days ago`
                      : `${result.days} days remaining`}
                  </p>

                  <div className="result-box">
                    <p className="date-line">
                      <strong>Expiry date:</strong>{" "}
                      {formatGregorian(result.expiryDate)}
                      <br />
                      <strong>Hijri date:</strong> {result.hijri}
                    </p>
                  </div>

                  <div className="stats">
                    <div className="stat">
                      <span>Calendar months</span>
                      <strong>{result.months}</strong>
                    </div>
                    <div className="stat">
                      <span>Extra days</span>
                      <strong>{result.remainderDays}</strong>
                    </div>
                    <div className="stat">
                      <span>Calculated from</span>
                      <strong>Today</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="section">
          <h2>How to use the Iqama expiry calculator</h2>
          <p>
            Enter your Resident ID (Iqama) expiry date, then select{" "}
            <strong>Check Expiry</strong>. The calculator compares the selected
            date with today&apos;s date on your device and shows the remaining
            days. It also displays the corresponding Hijri date when your
            browser supports the Umm al-Qura calendar.
          </p>

          <div className="info-grid">
            <div className="info">
              <h3>1. Find your expiry date</h3>
              <p>
                Use the expiry date shown in your official Saudi resident
                record or document.
              </p>
            </div>
            <div className="info">
              <h3>2. Enter the date</h3>
              <p>Select the exact Gregorian date in the date picker.</p>
            </div>
            <div className="info">
              <h3>3. Check the result</h3>
              <p>
                See remaining days, calendar months, extra days and the Hijri
                equivalent.
              </p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Iqama expiry FAQs</h2>

          <div className="faq">
            <h3>Is this the official Saudi Iqama validity check?</h3>
            <p>
              No. It is a calculation tool. For an official Resident ID
              validity/expiry inquiry, use the authorized Saudi government
              service through Absher.
            </p>
          </div>

          <div className="faq">
            <h3>Can I use a Hijri expiry date?</h3>
            <p>
              The input currently uses a Gregorian date. The result also shows
              a Hijri equivalent when supported by your browser. If you only
              have a Hijri date, use our Hijri/Gregorian Converter first.
            </p>
          </div>

          <div className="faq">
            <h3>Does MYKSA CONNECT store my date?</h3>
            <p>
              No. The calculation is performed in the browser; the page does
              not need an account or a server request for the calculation.
            </p>
          </div>

          <div className="faq">
            <h3>What should I do if the result looks wrong?</h3>
            <p>
              Check the date you entered and compare it with your official
              Saudi record. For an official status check, use Absher.
            </p>
          </div>
        </div>

        <div className="section">
          <h2>More Saudi expat tools</h2>
          <div className="related">
            {TOOL_LINKS.map(([icon, title, href]) => (
              <a href={href} key={href}>
                <span>{icon}</span>
                {title}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
