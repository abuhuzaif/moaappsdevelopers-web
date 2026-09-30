import type { ReactNode } from "react";

type Faq = { question: string; answer: string };

type Props = {
  name: string;
  description: string;
  slug: string;
  faqs?: Faq[];
  children?: ReactNode;
};

const BASE_URL = "https://www.myksaconnect.com";

export default function ToolSeoSchema({
  name,
  description,
  slug,
  faqs = [],
  children,
}: Props) {
  const url = `${BASE_URL}/tools/${slug}/`;

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
    publisher: {
      "@type": "Organization",
      name: "MYKSA CONNECT",
      url: BASE_URL,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MYKSA CONNECT", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Saudi Expat Tools", item: `${BASE_URL}/tools/` },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };

  const faqSchema = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      {children}
    </>
  );
}
