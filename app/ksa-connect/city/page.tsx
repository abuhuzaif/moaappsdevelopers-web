import type { Metadata } from "next";
import { CITIES } from "@/lib/categories";
import CityListingsClient from "./CityListingsClient";

type Props = {
  params: Promise<{ city: string }>;
};

function slugToCityValue(slug: string): string | null {
  const match = CITIES.find((c) => c.toLowerCase() === slug.toLowerCase());
  return match ?? null;
}

// Pre-generates a static route for each real city at build time — good
// for SEO (each gets its own indexable URL) and fast to serve.
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityValue = slugToCityValue(city);
  const cityName = cityValue ?? city;
  const title = `Classifieds in ${cityName} — Housing, Cars & More | KSA-Connect`;
  const description = `Browse live housing, car, job, household, and classifieds listings in ${cityName}, Saudi Arabia. Post a free ad or find what you need on KSA-Connect.`;
  const url = `https://www.myksaconnect.com/ksa-connect/city/${city.toLowerCase()}`;

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
