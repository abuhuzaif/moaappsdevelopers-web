import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blogPosts";

export const metadata: Metadata = {
  title: "Expat Guides & Tips — KSA-Connect Blog",
  description:
    "Practical guides for expatriates living in Saudi Arabia — moving tips, city guides, housing advice, and more from KSA-Connect.",
  alternates: {
    canonical: "https://www.myksaconnect.com/ksa-connect/blog",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="mk-page">
      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          KSA-Connect
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>
            Expat <span className="gold">Guides</span>
          </h1>
          <p>Practical tips for living, moving, and settling in across Saudi Arabia.</p>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
        {BLOG_POSTS.map((post) => (
          <a
            key={post.slug}
            href={`/ksa-connect/blog/${post.slug}`}
            style={{
              display: "block",
              padding: "20px 0",
              borderBottom: "1px solid var(--border)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h2 style={{ fontSize: 19, marginBottom: 6 }}>{post.title}</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{post.description}</p>
          </a>
        ))}

        <p style={{ marginTop: 32 }}>
          <a href="/ksa-connect">← Back to listings</a>
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
