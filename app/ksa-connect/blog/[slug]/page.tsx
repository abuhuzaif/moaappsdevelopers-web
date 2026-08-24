import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseBlogContent } from "@/lib/blogContentFormat";
import { FONT_STYLES, FontStyleKey } from "@/lib/blogStyles";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

type PostDoc = {
  title: string;
  description: string;
  publishedDate: string;
  city?: string | null;
  content: string;
  contentUrdu?: string | null;
  fontStyle?: FontStyleKey | null;
  accentColor?: string | null;
};

async function getPost(slug: string): Promise<PostDoc | null> {
  try {
    const snap = await getDoc(doc(db, "blogPosts", slug));
    if (!snap.exists()) return null;
    return snap.data() as PostDoc;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
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
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `https://www.myksaconnect.com/ksa-connect/blog/${slug}`;
  const contentBlocks = parseBlogContent(post.content);
  const contentUrduBlocks = post.contentUrdu ? parseBlogContent(post.contentUrdu) : null;

  const fontConfig = FONT_STYLES[post.fontStyle || "classic"] || FONT_STYLES.classic;
  const accentColor = post.accentColor || undefined;

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

      {/* Next.js hoists <link> tags found anywhere in the tree into <head> */}
      {fontConfig.googleFontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={fontConfig.googleFontsHref} rel="stylesheet" />
        </>
      )}

      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          KSA-Connect
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28, fontFamily: fontConfig.heading, color: accentColor }}>{post.title}</h1>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        <article>
          {contentBlocks.map((block, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 0 : 24 }}>
              {block.heading && (
                <h2 style={{ fontSize: 19, marginBottom: 10, fontFamily: fontConfig.heading, color: accentColor }}>
                  {block.heading}
                </h2>
              )}
              {block.paragraphs.map((p, j) => (
                <p
                  key={j}
                  style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 12, fontFamily: fontConfig.body }}
                >
                  {p}
                </p>
              ))}
            </div>
          ))}
        </article>

        {contentUrduBlocks && contentUrduBlocks.length > 0 && (
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
              {contentUrduBlocks.map((block, i) => (
                <div key={i} style={{ marginTop: i === 0 ? 0 : 24 }}>
                  {block.heading && (
                    <h2 style={{ fontSize: 19, marginBottom: 10, fontFamily: fontConfig.heading, color: accentColor }}>
                      {block.heading}
                    </h2>
                  )}
                  {block.paragraphs.map((p, j) => (
                    <p
                      key={j}
                      style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 12, fontFamily: fontConfig.body }}
                    >
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
