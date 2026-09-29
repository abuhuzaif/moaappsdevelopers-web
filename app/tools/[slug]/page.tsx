import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONVERTER_DEFINITIONS } from "@/lib/converters/converterTypes";
import ConverterClient, { converterIsInteractive } from "../_components/ConverterClient";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CONVERTER_DEFINITIONS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = CONVERTER_DEFINITIONS.find((item) => item.slug === slug);
  if (!tool) return {};

  return {
    title: `${tool.name} Online | MYKSA CONNECT Tools`,
    description: `${tool.shortDescription} Free online tool from MYKSA CONNECT.`,
    alternates: { canonical: `/tools/${tool.slug}/` },
    robots: { index: true, follow: true },
  };
}

export default async function ConverterToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = CONVERTER_DEFINITIONS.find((item) => item.slug === slug);
  if (!tool) notFound();

  const interactive = converterIsInteractive(slug);

  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>
          MYKSA CONNECT • {tool.category} tool
        </p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(30px,5vw,46px)", margin: "8px 0 12px" }}>{tool.name}</h1>
        <p style={{ color: "#5d6a68", fontSize: 16, lineHeight: 1.7 }}>{tool.shortDescription}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: {tool.input}</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: {tool.output}</span>
          {tool.clientSide && <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>}
        </div>

        {interactive ? (
          <ConverterClient slug={slug} input={tool.input} output={tool.output} />
        ) : (
          <div style={{ padding: 20, borderRadius: 16, background: "#f6f8f7", border: "1px dashed #cbd8d3" }}>
            <strong style={{ color: "#06172a" }}>Tool page is live</strong>
            <p style={{ margin: "8px 0 0", color: "#65716f", lineHeight: 1.6 }}>
              This format needs a dedicated server-side processing engine. The SEO route, metadata and tool URL are already live; its processor will be added without changing the public URL.
            </p>
          </div>
        )}

        <a href="/tools/converters/" style={{ display: "inline-block", marginTop: 24, color: "#005744", fontWeight: 800, textDecoration: "none" }}>← Back to all converters</a>
      </section>
    </main>
  );
}
