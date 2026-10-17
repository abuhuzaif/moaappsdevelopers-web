import type { Metadata } from "next";
import { CITIES, citySlug } from "@/lib/categories";
import CityListingsClient from "./CityListingsClient";

type Props = {
  params: Promise<{ city: string }>;
};

function slugToCityValue(slug: string): string | null {
  const s = slug.toLowerCase();
  const match = CITIES.find((c) => citySlug(c) === s || c.toLowerCase() === decodeURIComponent(s));
  return match ?? null;
}

// Pre-generates a static route for each real city at build time — good
// for SEO (each gets its own indexable URL) and fast to serve.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: citySlug(c) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityValue = slugToCityValue(city);
  const cityName = cityValue ?? city;
  const title = `Classifieds in ${cityName} — Housing, Cars & More | MYKSA Connect`;
  const description = `Browse live housing, car, job, household, and classifieds listings in ${cityName}, Saudi Arabia. Post a free ad or find what you need on MYKSA Connect.`;
  const url = `https://www.myksaconnect.com/ksa-connect/city/${cityValue ? citySlug(cityValue) : city.toLowerCase()}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityValue = slugToCityValue(city);
  return <CityListingsClient citySlug={city} cityValue={cityValue} />;
}
