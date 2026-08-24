"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { db, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";
import { ACCENT_COLORS, FONT_STYLES, FontStyleKey } from "@/lib/blogStyles";
import { parseBlogContent } from "@/lib/blogContentFormat";

type PostDoc = {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  city: string;
  content: string;
  contentUrdu: string;
  fontStyle: FontStyleKey;
  accentColor: string;
};

const EMPTY_FORM: PostDoc = {
  slug: "",
  title: "",
  description: "",
  publishedDate: new Date().toISOString().slice(0, 10),
  city: "",
  content: "",
  contentUrdu: "",
  fontStyle: "classic",
  accentColor: "",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminBlogPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [form, setForm] = useState<PostDoc>(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshPosts() {
    const q = query(collection(db, "blogPosts"), orderBy("publishedDate", "desc"));
    const snap = await getDocs(q);
    setPosts(snap.docs.map((d) => ({ slug: d.id, ...(d.data() as any) })));
    setPostsLoading(false);
  }

  useEffect(() => {
    if (!user || !isAdmin(user)) return;
    refreshPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingSlug(null);
    setSlugManuallyEdited(false);
    setError(null);
  }

  function startEdit(post: PostDoc) {
    setForm({
      ...post,
      city: post.city || "",
      contentUrdu: post.contentUrdu || "",
      fontStyle: post.fontStyle || "classic",
      accentColor: post.accentColor || "",
    });
    setEditingSlug(post.slug);
    setSlugManuallyEdited(true);
    setError(null);
  }

  function onTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: !editingSlug && !slugManuallyEdited ? slugify(value) : f.slug,
    }));
  }

  async function handleSave() {
    setError(null);
    if (!form.title.trim() || !form.slug.trim() || !form.description.trim() || !form.content.trim()) {
      setError("Title, slug, description, and content are required.");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "blogPosts", form.slug.trim()), {
        title: form.title.trim(),
        description: form.description.trim(),
        publishedDate: form.publishedDate,
        city: form.city.trim() || null,
        content: form.content,
        contentUrdu: form.contentUrdu.trim() || null,
        fontStyle: form.fontStyle,
        accentColor: form.accentColor || null,
      });
      await refreshPosts();
      startNew();
    } catch (err: any) {
      setError(err.message ?? "Couldn't save this post.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}" permanently? This can't be undone.`)) return;
    try {
      await deleteDoc(doc(db, "blogPosts", slug));
      setPosts((p) => p.filter((post) => post.slug !== slug));
      if (editingSlug === slug) startNew();
    } catch (err: any) {
      alert(err.message ?? "Couldn't delete this post.");
    }
  }

  if (loading) return <p style={{ padding: 24 }}>Checking sign-in status…</p>;

  if (!user) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>
          Sign in with an admin Google account to manage blog posts.
        </p>
        <button className="btn btn-gold" onClick={() => signInWithGoogle()}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin(user)) {
    return (
      <div className="empty-state" style={{ margin: 40 }}>
        You don&apos;t have permission to access this page.
      </div>
    );
  }

  return (
    <div className="mk-page">
      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">K</div>
          KSA-Connect
        </a>
      </nav>

      <main className="container" style={{ maxWidth: 980, paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0" }}>
          <h1 style={{ fontSize: 24 }}>Manage Blog Posts</h1>
          <button
            onClick={() => signOutUser()}
            style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", fontSize: 13 }}
          >
            Sign out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          <aside>
            <button className="btn btn-gold" style={{ width: "100%", marginBottom: 16 }} onClick={startNew}>
              + New Post
            </button>
            {postsLoading && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</p>}
            {!postsLoading && posts.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No posts yet.</p>
            )}
            {!postsLoading &&
              posts.map((post) => (
                <div
                  key={post.slug}
                  style={{
                    padding: 12,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    marginBottom: 8,
                    background: editingSlug === post.slug ? "var(--surface)" : "white",
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{post.title}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>{post.slug}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => startEdit(post)}
                      style={{ fontSize: 12, background: "none", border: "none", color: "var(--navy)", cursor: "pointer", padding: 0 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      style={{ fontSize: 12, background: "none", border: "none", color: "#b91c1c", cursor: "pointer", padding: 0 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </aside>

          <div>
            <label style={fieldLabel}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={(e) => onTitleChange(e.target.value)} />

            <label style={fieldLabel}>Slug (URL) *</label>
            <input
              style={inputStyle}
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
              disabled={!!editingSlug}
            />
            {editingSlug && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Slug can&apos;t be changed once created — delete and recreate if you need a new URL.
              </p>
            )}

            <label style={fieldLabel}>Short Description *</label>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              Shown on the guides list and used as the page&apos;s meta description.
            </p>
            <textarea
              style={{ ...inputStyle, minHeight: 60 }}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />

            <label style={fieldLabel}>City (optional)</label>
            <input
              style={inputStyle}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Riyadh"
            />

            <label style={fieldLabel}>Published Date</label>
            <input
              style={inputStyle}
              type="date"
              value={form.publishedDate}
              onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))}
            />

            <label style={fieldLabel}>Content (English) *</label>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
              Start a line with <code>## </code> for a heading. Leave a blank line between paragraphs.
            </p>
            <textarea
              style={{ ...inputStyle, minHeight: 260, fontFamily: "monospace", fontSize: 13 }}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />

            <label style={fieldLabel}>Content (Roman Urdu, optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 200, fontFamily: "monospace", fontSize: 13 }}
              value={form.contentUrdu}
              onChange={(e) => setForm((f) => ({ ...f, contentUrdu: e.target.value }))}
            />

            <label style={fieldLabel}>Font Style</label>
            <select
              style={inputStyle}
              value={form.fontStyle}
              onChange={(e) => setForm((f) => ({ ...f, fontStyle: e.target.value as any }))}
            >
              {Object.entries(FONT_STYLES).map(([key, style]) => (
                <option key={key} value={key}>
                  {style.label}
                </option>
              ))}
            </select>

            <label style={fieldLabel}>Heading Accent Color</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, accentColor: c.value }))}
                  title={c.label}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: form.accentColor === c.value ? "2px solid var(--navy)" : "1px solid var(--border)",
                    background: c.value || "var(--navy)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {(() => {
              const previewFont = FONT_STYLES[form.fontStyle] || FONT_STYLES.classic;
              const previewBlocks = parseBlogContent(form.content);
              return (
                <>
                  <label style={fieldLabel}>Live Preview</label>
                  {previewFont.googleFontsHref && <link rel="stylesheet" href={previewFont.googleFontsHref} />}
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20, background: "white" }}>
                    <h2
                      style={{
                        fontSize: 22,
                        marginBottom: 12,
                        fontFamily: previewFont.heading,
                        color: form.accentColor || undefined,
                      }}
                    >
                      {form.title || "Untitled Post"}
                    </h2>
                    {previewBlocks.length === 0 && (
                      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        Start typing content above to see a preview…
                      </p>
                    )}
                    {previewBlocks.map((block, i) => (
                      <div key={i} style={{ marginTop: i === 0 ? 0 : 16 }}>
                        {block.heading && (
                          <h3
                            style={{
                              fontSize: 16,
                              marginBottom: 6,
                              fontFamily: previewFont.heading,
                              color: form.accentColor || undefined,
                            }}
                          >
                            {block.heading}
                          </h3>
                        )}
                        {block.paragraphs.map((p, j) => (
                          <p
                            key={j}
                            style={{
                              color: "var(--text-muted)",
                              lineHeight: 1.6,
                              marginBottom: 8,
                              fontFamily: previewFont.body,
                              fontSize: 14,
                            }}
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {error && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 8 }}>{error}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn btn-gold" disabled={saving} onClick={handleSave}>
                {saving ? "Saving…" : editingSlug ? "Save Changes" : "Publish Post"}
              </button>
              {editingSlug && (
                <button type="button" onClick={startNew} className="btn btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ink)",
  marginTop: 18,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  fontSize: 14,
  fontFamily: "inherit",
};
