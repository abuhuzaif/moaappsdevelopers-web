import { TOOL_LABELS, TOOL_SEO } from "@/lib/toolSeo";

const h2: React.CSSProperties = { color: "#06172a", fontSize: 24, marginTop: 30, marginBottom: 12 };

/** Internal links to related tools. Renders nothing if the tool has no entry. */
export function RelatedTools({ slug }: { slug: string }) {
  const related = (TOOL_SEO[slug]?.related ?? []).filter((s) => TOOL_LABELS[s]);
  if (related.length === 0) return null;

  return (
    <nav aria-label="Related tools" style={{ marginTop: 34 }}>
      <h2 style={h2}>Related tools</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {related.map((s) => (
          <a
            key={s}
            href={`/tools/${s}/`}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: "1px solid #cfe2dc",
              background: "#f1f8f5",
              color: "#005744",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            {TOOL_LABELS[s]}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** Full text block (intro, how-to, features, FAQs, related tools) for calculator pages. */
export default function ToolSeoContent({ slug }: { slug: string }) {
  const seo = TOOL_SEO[slug];
  if (!seo) return null;
  const name = TOOL_LABELS[slug] ?? "About this tool";

  return (
    <article
      style={{
        marginTop: 28,
        background: "#fff",
        border: "1px solid #dfe7e3",
        borderRadius: 22,
        boxShadow: "0 12px 34px rgba(6,23,42,.07)",
        padding: "30px",
        color: "#33413f",
        lineHeight: 1.75,
      }}
    >
      <h2 style={{ ...h2, marginTop: 0, fontSize: 28 }}>{name}</h2>
      <p style={{ margin: 0 }}>{seo.intro}</p>

      <h2 style={h2}>How to use this tool</h2>
      <ol style={{ paddingLeft: 22, margin: 0 }}>
        {seo.howTo.map((step) => (
          <li key={step} style={{ marginBottom: 8 }}>{step}</li>
        ))}
      </ol>

      <h2 style={h2}>Key features</h2>
      <ul style={{ paddingLeft: 22, margin: 0 }}>
        {seo.benefits.map((benefit) => (
          <li key={benefit} style={{ marginBottom: 8 }}>{benefit}</li>
        ))}
      </ul>

      <h2 style={h2}>Frequently asked questions</h2>
      <div>
        {seo.faqs.map((faq) => (
          <section key={faq.q} style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}>
            <h3 style={{ color: "#06172a", fontSize: 17, margin: 0 }}>{faq.q}</h3>
            <p style={{ margin: "7px 0 0" }}>{faq.a}</p>
          </section>
        ))}
      </div>

      <RelatedTools slug={slug} />
    </article>
  );
}
