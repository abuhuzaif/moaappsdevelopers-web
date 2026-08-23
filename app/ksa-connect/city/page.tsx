import type { Metadata } from "next";
import { CITIES } from "@/lib/categories";
import CityListingsClient from "./CityListingsClient";

type Props = {
  params: { city: string };
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

export function generateMetadata({ params }: Props): Metadata {
  const cityValue = slugToCityValue(params.city);
  const cityName = cityValue ?? params.city;
  const title = `Classifieds in ${cityName} — Housing, Cars & More | KSA-Connect`;
  const description = `Browse live housing, car, job, household, and classifieds listings in ${cityName}, Saudi Arabia. Post a free ad or find what you need on KSA-Connect.`;
  const url = `https://www.myksaconnect.com/ksa-connect/city/${params.city.toLowerCase()}`;

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

export default function CityPage({ params }: Props) {
  const cityValue = slugToCityValue(params.city);
  return <CityListingsClient citySlug={params.city} cityValue={cityValue} />;
}
