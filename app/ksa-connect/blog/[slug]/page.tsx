import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/blogPosts";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  const url = `https://www.myksaconnect.com/ksa-connect/blog/${slug}`;
  return {
    title: `${post.title} — KSA-Connect`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.publishedDate,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const url = `https://www.myksaconnect.com/ksa-connect/blog/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    url,
    author: {
      "@type": "Organization",
      name: "KSA-Connect",
      url: "https://www.myksaconnect.com",
    },
    publisher: {
      "@type": "Organization",
      name: "KSA-Connect",
      url: "https://www.myksaconnect.com",
    },
    mainEntityOfPage: url,
  };

  return (
    <div className="mk-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          KSA-Connect
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>{post.title}</h1>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <article>
          {post.content.map((block, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 0 : 24 }}>
              {block.heading && <h2 style={{ fontSize: 19, marginBottom: 10 }}>{block.heading}</h2>}
              {block.paragraphs.map((p, j) => (
                <p key={j} style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </article>

        {post.contentUrdu && post.contentUrdu.length > 0 && (
          <>
            <hr style={{ margin: "36px 0 28px", border: "none", borderTop: "1px solid var(--border)" }} />
            <p
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.4,
                color: "var(--navy)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "4px 12px",
                marginBottom: 16,
              }}
            >
              🇵🇰 Roman Urdu / Hindi mein padhein
            </p>
            <article>
              {post.contentUrdu.map((block, i) => (
                <div key={i} style={{ marginTop: i === 0 ? 0 : 24 }}>
                  {block.heading && <h2 style={{ fontSize: 19, marginBottom: 10 }}>{block.heading}</h2>}
                  {block.paragraphs.map((p, j) => (
                    <p key={j} style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </article>
          </>
        )}

        {post.city ? (
          <div
            style={{
              marginTop: 32,
              padding: "16px 20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, marginBottom: 6 }}>Looking for housing in {post.city}?</p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
              Browse live{" "}
              <a href={`/ksa-connect/city/${post.city.toLowerCase()}`} style={{ textDecoration: "underline" }}>
                {post.city} listings on KSA-Connect
              </a>
              , or{" "}
              <a href="/ksa-connect/post" style={{ textDecoration: "underline" }}>
                post your own ad
              </a>
              .
            </p>
          </div>
        ) : (
          <div
            style={{
              marginTop: 32,
              padding: "16px 20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, marginBottom: 6 }}>Stay safe on KSA-Connect</p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
              Read our full{" "}
              <a href="/ksa-connect/safety" style={{ textDecoration: "underline" }}>
                Safety &amp; Fraud Prevention guide
              </a>
              , or{" "}
              <a href="/ksa-connect" style={{ textDecoration: "underline" }}>
                browse verified listings
              </a>
              .
            </p>
          </div>
        )}

        <p style={{ marginTop: 32 }}>
          <a href="/ksa-connect/blog">← Back to guides</a>
        </p>
      </main>

      <footer className="footer">
        <p>
          <a href="/ksa-connect/faq">FAQ</a> ·{" "}
          <a href="/ksa-connect/privacy">Privacy Policy</a> ·{" "}
          <a href="/ksa-connect/safety">Safety &amp; Fraud Prevention</a>
        </p>
      </footer>
    </div>
  );
}
