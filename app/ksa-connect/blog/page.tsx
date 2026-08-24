import type { Metadata } from "next";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const metadata: Metadata = {
  title: "Expat Guides & Tips — KSA-Connect Blog",
  description:
    "Practical guides for expatriates living in Saudi Arabia — moving tips, city guides, housing advice, and more from KSA-Connect.",
  alternates: {
    canonical: "https://www.myksaconnect.com/ksa-connect/blog",
  },
};

// Re-fetch from Firestore at most once a minute, so posts published/edited
// via the admin page show up quickly without needing a full redeploy.
export const revalidate = 60;

type PostSummary = { slug: string; title: string; description: string };

async function getPosts(): Promise<PostSummary[]> {
  try {
    const q = query(collection(db, "blogPosts"), orderBy("publishedDate", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return { slug: d.id, title: data.title, description: data.description };
    });
  } catch {
    return [];
  }
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

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
        {posts.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>No guides published yet — check back soon.</p>
        )}
        {posts.map((post) => (
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
