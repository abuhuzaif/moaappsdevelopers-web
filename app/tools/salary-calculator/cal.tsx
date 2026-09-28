"use client";

import { useMemo, useState } from "react";

const TOOL_LINKS = [
  ["/tools/iqama-expiry-calculator/", "Iqama Expiry Calculator"],
  ["/tools/hijri-gregorian-converter/", "Hijri / Gregorian Converter"],
  ["/tools/sar-currency-converter/", "SAR Currency Converter"],
  ["/tools/rent-split-calculator/", "Rent Split Calculator"],
  ["/tools/zakat-calculator/", "Zakat Calculator"],
];

function money(value: number) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value);
}

function Input({
  label,
  value,
  setValue,
  placeholder = "0",
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="salary-field">
      <span>{label}</span>
      <div className="salary-input-wrap">
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
        <b>SAR</b>
      </div>
    </label>
  );
}

export default function SalaryCalculator() {
  const [basic, setBasic] = useState("7000");
  const [housing, setHousing] = useState("0");
  const [transport, setTransport] = useState("0");
  const [other, setOther] = useState("0");

  const result = useMemo(() => {
    const b = Number(basic) || 0;
    const h = Number(housing) || 0;
    const t = Number(transport) || 0;
    const o = Number(other) || 0;
    const monthly = b + h + t + o;

    return {
      basic: b,
      allowances: h + t + o,
      monthly,
      annualBasic: b * 12,
      annualAllowances: (h + t + o) * 12,
      annual: monthly * 12,
    };
  }, [basic, housing, transport, other]);

  return (
    <main className="salary-page">
      <div className="salary-shell">
        <nav className="salary-breadcrumbs">
          <a href="/">MYKSA CONNECT</a>
          <span>›</span>
          <a href="/tools/">Saudi Expat Tools</a>
          <span>›</span>
          <span>Salary Calculator</span>
        </nav>

        <header className="salary-hero">
          <div className="salary-hero-inner">
            <div className="salary-hero-copy">
              <div className="salary-kicker">▣ SAUDI EXPAT TOOL</div>
              <h1>Saudi Salary Calculator</h1>
              <p>
                Calculate your monthly and annual salary in Saudi Riyals,
                including basic salary and allowances.
              </p>
              <p className="salary-subtitle">
                Simple, fast and free — no login required.
              </p>
            </div>

            <div className="salary-hero-image" aria-hidden="true">
              <img
                src="/images/salary-calculator-banner-clean.png"
                alt=""
              />
            </div>
          </div>
        </header>

        <section className="salary-main-card">
          <div className="salary-input-card">
            <div className="salary-card-head">
              <div>
                <div className="salary-icon">﷼</div>
                <h2>Salary Details</h2>
              </div>
              <span className="salary-badge">Free Tool</span>
            </div>

            <p className="salary-help">
              Enter your monthly salary components below.
            </p>

            <div className="salary-grid">
              <Input label="Basic Salary" value={basic} setValue={setBasic} />
              <Input
                label="Housing Allowance"
                value={housing}
                setValue={setHousing}
              />
              <Input
                label="Transport Allowance"
                value={transport}
                setValue={setTransport}
              />
              <Input
                label="Other Allowances"
                value={other}
                setValue={setOther}
              />
            </div>

            <div className="salary-note">
              💡 You can enter 0 for any allowance you do not receive.
            </div>
          </div>

          <div className="salary-result-card">
            <div className="salary-result-label">TOTAL MONTHLY SALARY</div>
            <div className="salary-total">{money(result.monthly)}</div>

            <div className="salary-result-box">
              <div>
                <span>Basic Salary</span>
                <strong>{money(result.basic)}</strong>
              </div>
              <div>
                <span>Total Allowances</span>
                <strong>{money(result.allowances)}</strong>
              </div>
            </div>

            <div className="salary-annual">
              <div className="salary-annual-title">Annual Salary</div>
              <strong>{money(result.annual)}</strong>
              <div className="salary-annual-breakdown">
                <span>
                  Annual Basic
                  <b>{money(result.annualBasic)}</b>
                </span>
                <span>
                  Annual Allowances
                  <b>{money(result.annualAllowances)}</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="salary-info-grid">
          <article className="salary-info-card salary-info-green">
            <h2>How to use this calculator</h2>
            <p>Enter your monthly salary details and the totals update instantly.</p>
            <div className="salary-steps">
              <div><b>1</b><span>Enter your basic salary.</span></div>
              <div><b>2</b><span>Add housing, transport and other allowances.</span></div>
              <div><b>3</b><span>See your monthly and annual salary.</span></div>
            </div>
          </article>

          <article className="salary-info-card salary-info-gold">
            <h2>Useful for Saudi residents</h2>
            <ul>
              <li>Compare salary packages</li>
              <li>Understand total monthly income</li>
              <li>Calculate annual salary</li>
              <li>Plan rent and household expenses</li>
            </ul>
          </article>
        </section>

        <section className="salary-faq">
          <h2>Frequently Asked Questions</h2>
          <details>
            <summary>What does this Saudi salary calculator include?</summary>
            <p>
              It adds your basic salary, housing allowance, transport allowance
              and other monthly allowances to calculate your total salary.
            </p>
          </details>
          <details>
            <summary>Can I use this calculator for any SAR salary?</summary>
            <p>
              Yes. Enter the amounts in Saudi Riyals (SAR). The calculator is
              designed for monthly salary calculations.
            </p>
          </details>
          <details>
            <summary>Does this calculator deduct tax or other payments?</summary>
            <p>
              No. This tool calculates the gross salary from the amounts you
              enter. It does not estimate individual deductions or payroll
              policies.
            </p>
          </details>
        </section>

        <section className="salary-related">
          <h2>More Saudi Expat Tools</h2>
          <div className="salary-related-grid">
            {TOOL_LINKS.map(([href, title]) => (
              <a href={href} key={href}>
                <span>◆</span>
                <strong>{title}</strong>
              </a>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .salary-page {
          direction: ltr;
          --green: #005f4d;
          --green-deep: #003c31;
          --green-soft: #edf8f4;
          --gold: #f4b51b;
          --gold-soft: #fff6dc;
          --navy: #06172a;
          --ink: #09202a;
          --line: #dce7e2;
          background: #fbfaf7;
          color: var(--ink);
          min-height: 100vh;
          padding: 0 0 70px;
        }

        .salary-shell {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
        }

        .salary-breadcrumbs {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 22px 0 8px;
          font-size: 12px;
          color: #607078;
        }

        .salary-breadcrumbs a:first-child,
        .salary-breadcrumbs a:nth-of-type(2) {
          color: var(--green);
          font-weight: 800;
          text-decoration: none;
        }

        .salary-hero {
          width: 100%;
          margin-top: 8px;
          background: linear-gradient(90deg, #003c31 0%, #004b3f 43%, #073b36 100%);
          color: #fff;
          border-radius: 0;
          overflow: hidden;
          position: relative;
        }

        .salary-hero-inner {
          direction: ltr !important;
          width: 100% !important;
          min-height: 330px;
          margin: 0;
          display: grid !important;
          grid-template-columns: 46% 54% !important;
          align-items: stretch;
          box-sizing: border-box !important;
        }

        .salary-hero-copy {
          direction: ltr !important;
          display: flex;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          flex-direction: column;
          justify-content: center;
          padding: 44px 42px 48px 42px;
          position: relative;
          z-index: 2;
          background: linear-gradient(90deg, #003c31 0%, #00483c 78%, rgba(0,72,60,.72) 100%);
        }

        .salary-kicker {
          color: #f4b51b;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.3px;
          margin-bottom: 12px;
        }

        .salary-hero h1 {
          margin: 0;
          max-width: 560px;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1.04;
          letter-spacing: -2.2px;
          color: #fff;
        }

        .salary-hero p {
          max-width: 650px;
          margin: 16px 0 0;
          font-size: 17px;
          line-height: 1.55;
          color: rgba(255,255,255,.92);
        }

        .salary-hero .salary-subtitle {
          margin-top: 5px;
          font-weight: 700;
          color: #fff;
        }

        .salary-hero-image {
          direction: ltr !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          overflow: hidden;
          box-sizing: border-box !important;
          position: relative;
          background: #073b36;
        }

        .salary-hero-image::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,60,49,.28), transparent 35%);
          z-index: 1;
          pointer-events: none;
        }

        .salary-hero-image img {
          width: 100%;
          height: 330px;
          min-height: 330px;
          display: block;
          object-fit: cover;
          object-position: center center;
        }

        .salary-main-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 18px 50px rgba(5, 45, 38, 0.1);
        }

        .salary-input-card,
        .salary-result-card {
          border-radius: 18px;
          padding: 28px;
          border: 1px solid var(--line);
        }

        .salary-input-card {
          background: linear-gradient(145deg, #f0faf7, #fff);
        }

        .salary-result-card {
          background: linear-gradient(145deg, #fffdf7, #fff8e7);
          border-color: #f0d58a;
          text-align: center;
        }

        .salary-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .salary-card-head > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .salary-card-head h2,
        .salary-info-card h2,
        .salary-faq h2,
        .salary-related h2 {
          margin: 0;
          color: var(--green-deep);
        }

        .salary-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #dcefe9;
          color: var(--green);
          font-weight: 900;
          font-size: 19px;
        }

        .salary-badge {
          border: 1px solid #edc95e;
          background: #fff4c9;
          color: #876300;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }

        .salary-help {
          color: #5b6c73;
          font-size: 14px;
          margin: 13px 0 22px;
        }

        .salary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .salary-field {
          display: block;
        }

        .salary-field > span {
          display: block;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 7px;
          color: #294047;
        }

        .salary-input-wrap {
          display: flex;
          align-items: center;
          height: 48px;
          border: 1px solid #cbdad5;
          border-radius: 10px;
          background: #fff;
          overflow: hidden;
        }

        .salary-input-wrap input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          padding: 0 13px;
          font-size: 15px;
          color: var(--ink);
          background: transparent;
        }

        .salary-input-wrap b {
          padding: 0 13px;
          color: #718087;
          font-size: 12px;
        }

        .salary-note {
          margin-top: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #e9f4f0;
          color: #587078;
          font-size: 12px;
        }

        .salary-result-label {
          color: #9a7200;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .salary-total {
          margin: 8px 0 18px;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1;
          font-weight: 900;
          color: var(--navy);
        }

        .salary-result-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #ead9ad;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
        }

        .salary-result-box div {
          padding: 15px;
        }

        .salary-result-box div + div {
          border-left: 1px solid #ead9ad;
        }

        .salary-result-box span {
          display: block;
          font-size: 11px;
          color: #758087;
          margin-bottom: 5px;
        }

        .salary-result-box strong {
          color: var(--green-deep);
          font-size: 16px;
        }

        .salary-annual {
          margin-top: 14px;
          padding: 16px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #ead9ad;
        }

        .salary-annual-title {
          font-size: 12px;
          color: #7a6b49;
          font-weight: 800;
        }

        .salary-annual > strong {
          display: block;
          margin-top: 4px;
          color: var(--green-deep);
          font-size: 27px;
        }

        .salary-annual-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .salary-annual-breakdown span {
          font-size: 10px;
          color: #7a858b;
        }

        .salary-annual-breakdown b {
          display: block;
          color: #30434a;
          margin-top: 3px;
          font-size: 12px;
        }

        .salary-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 18px;
        }

        .salary-info-card,
        .salary-faq,
        .salary-related {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: #fff;
          padding: 26px;
        }

        .salary-info-green {
          background: linear-gradient(135deg, #eef9f5, #fff);
        }

        .salary-info-gold {
          background: linear-gradient(135deg, #fff9e9, #fff);
          border-color: #eadbb4;
        }

        .salary-info-card p {
          color: #627279;
          line-height: 1.6;
        }

        .salary-steps {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .salary-steps div {
          display: flex;
          gap: 11px;
          align-items: center;
          font-size: 13px;
        }

        .salary-steps b {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--green);
          color: #fff;
        }

        .salary-info-card ul {
          margin: 18px 0 0;
          padding-left: 20px;
          color: #475a61;
          line-height: 2;
        }

        .salary-faq,
        .salary-related {
          margin-top: 18px;
        }

        .salary-faq details {
          border-top: 1px solid #e4ebe8;
          padding: 15px 0;
        }

        .salary-faq details:first-of-type {
          margin-top: 14px;
        }

        .salary-faq summary {
          cursor: pointer;
          font-weight: 800;
          color: #263d45;
        }

        .salary-faq details p {
          color: #68787f;
          line-height: 1.6;
          margin: 10px 0 0;
          font-size: 14px;
        }

        .salary-related-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .salary-related-grid a {
          min-height: 92px;
          padding: 13px;
          border: 1px solid #dce6e2;
          border-radius: 12px;
          background: #fbfdfc;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 8px;
          color: var(--green-deep);
          transition: transform .15s ease, box-shadow .15s ease;
        }

        .salary-related-grid a:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 60, 49, .08);
        }

        .salary-related-grid span {
          color: var(--gold);
          font-size: 18px;
        }

        .salary-related-grid strong {
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .salary-main-card,
          .salary-info-grid {
            grid-template-columns: 1fr;
          }

          .salary-grid {
            grid-template-columns: 1fr;
          }

          .salary-related-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .salary-hero-inner {
            min-height: 0;
            grid-template-columns: 1fr !important;
          }

          .salary-hero-copy {
            padding: 34px 20px 30px;
          }

          .salary-hero-image {
            height: 220px;
          }

          .salary-hero-image img {
            height: 220px;
            min-height: 220px;
            object-position: center center;
          }

          .salary-main-card {
            padding: 9px;
          }
        }

        @media (max-width: 480px) {
          .salary-shell {
            width: min(100% - 20px, 1120px);
          }

          .salary-breadcrumbs {
            font-size: 10px;
          }

          .salary-hero h1 {
            letter-spacing: -1px;
          }

          .salary-hero p {
            font-size: 15px;
          }

          .salary-input-card,
          .salary-result-card,
          .salary-info-card,
          .salary-faq,
          .salary-related {
            padding: 18px;
          }

          .salary-related-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}
