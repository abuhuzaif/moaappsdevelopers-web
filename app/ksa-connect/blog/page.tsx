import type { Metadata } from "next";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SEO_POSTS } from "@/lib/seoContent";

export const metadata: Metadata = {
  title: "Saudi Expat Guides & Tips — MYKSA CONNECT",
  description:
    "Practical Saudi Arabia expat guides covering Iqama, salary, dates, currency, housing, cars, safety and everyday life.",
  alternates: {
    canonical: "https://www.myksaconnect.com/ksa-connect/blog",
  },
  openGraph: {
    title: "Saudi Expat Guides & Tips — MYKSA CONNECT",
    description:
      "Practical guides for expatriates living and working in Saudi Arabia, plus free tools and local classifieds.",
    type: "website",
    url: "https://www.myksaconnect.com/ksa-connect/blog",
  },
};

export const revalidate = 60;

type PostSummary = { slug: string; title: string; description: string; publishedDate?: string };

async function getPosts(): Promise<PostSummary[]> {
  let firestorePosts: PostSummary[] = [];
  try {
    const q = query(collection(db, "blogPosts"), orderBy("publishedDate", "desc"));
    const snap = await getDocs(q);
    firestorePosts = snap.docs.map((d) => {
      const data = d.data() as any;
      return { slug: d.id, title: data.title, description: data.description, publishedDate: data.publishedDate };
    });
  } catch {
    // Static SEO guides remain available even if Firestore is temporarily unavailable.
  }

  const staticPosts = SEO_POSTS.map(({ slug, title, description, publishedDate }) => ({
    slug,
    title,
    description,
    publishedDate,
  }));

  const merged = new Map<string, PostSummary>();
  [...staticPosts, ...firestorePosts].forEach((post) => merged.set(post.slug, post));
  return [...merged.values()].sort((a, b) => (b.publishedDate || "").localeCompare(a.publishedDate || ""));
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="mk-page">
      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          MYKSA CONNECT
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>
            Saudi Expat <span className="gold">Guides</span>
          </h1>
          <p>Practical tips for living, working, renting, budgeting and settling in across Saudi Arabia.</p>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 760, paddingBottom: 60 }}>
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
