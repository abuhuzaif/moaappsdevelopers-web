import { NextResponse } from "next/server";

export const revalidate = 86400;

const FALLBACK_RATES: Record<string, number> = {
  SAR: 1,
  USD: 0.2666666667,
  EUR: 0.234453,
  GBP: 0.201729,
  INR: 25.5951,
  PKR: 73.91,
  AED: 0.979432,
  QAR: 0.970936,
  KWD: 0.082427,
  BDT: 32.8198,
  LKR: 88.1834,
  CNY: 1.79012,
  JPY: 42.39,
};

const API_URL = "https://open.er-api.com/v6/latest/SAR";

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Exchange API returned ${response.status}`);

    const data = await response.json();
    const externalRates = data?.rates;

    if (!externalRates || typeof externalRates !== "object") {
      throw new Error("Exchange API returned no rates");
    }

    const rates: Record<string, number> = { SAR: 1 };
    for (const [code, value] of Object.entries(externalRates)) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        rates[code] = value;
      }
    }

    return NextResponse.json({
      ok: true,
      base: "SAR",
      rates,
      updatedAt: data?.time_last_update_utc ?? new Date().toISOString(),
      nextUpdateAt: data?.time_next_update_utc ?? null,
      source: "ExchangeRate-API Open Access",
      sourceUrl: "https://www.exchangerate-api.com/",
      fallback: false,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      base: "SAR",
      rates: FALLBACK_RATES,
      updatedAt: "25 September 2026",
      nextUpdateAt: null,
      source: "MYKSA fallback reference rates",
      sourceUrl: "https://www.sama.gov.sa/en-US/Currency/FinExc/pages/currency.aspx",
      fallback: true,
    });
  }
}
