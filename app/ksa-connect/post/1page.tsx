"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { CITIES, CATEGORIES, SUB_CATEGORIES } from "@/lib/categories";
import { DRAFT_TEMPLATES } from "@/lib/draftTemplates";

const MAX_PHOTOS = 3;

export default function PostListingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [city, setCity] = useState(CITIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[CATEGORIES[0].key][0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether Title/Description currently came from our own draft
  // template (so switching sub-category keeps updating it) vs. the user
  // manually editing it (in which case we stop auto-filling).
  const [isDraftAutoFilled, setIsDraftAutoFilled] = useState(false);
  const [lastDraft, setLastDraft] = useState({ title: "", description: "" });

  function applyDraftIfEmpty(cat: string, sub: string) {
    const draft = DRAFT_TEMPLATES[cat]?.[sub];
    if (!draft) return;

    const bothEmpty = title.trim() === "" && description.trim() === "";
    if (bothEmpty || isDraftAutoFilled) {
      setTitle(draft.title);
      setDescription(draft.description);
      setLastDraft(draft);
      setIsDraftAutoFilled(true);
    }
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (isDraftAutoFilled && value !== lastDraft.title) setIsDraftAutoFilled(false);
  }

  function onDescriptionChange(value: string) {
    setDescription(value);
    if (isDraftAutoFilled && value !== lastDraft.description) setIsDraftAutoFilled(false);
  }

  function onCategoryChange(key: string) {
    setCategory(key);
    const firstSub = SUB_CATEGORIES[key][0];
    setSubCategory(firstSub);
    applyDraftIfEmpty(key, firstSub);
  }

  function onSubCategoryChange(sub: string) {
    setSubCategory(sub);
    applyDraftIfEmpty(category, sub);
  }

  function onFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    const combined = [...files, ...chosen].slice(0, MAX_PHOTOS);
    setFiles(combined);
  }

  function removeFile(i: number) {
    setFiles(files.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please sign in first.");
      return;
    }
    if (!title.trim() || !price.trim() || !location.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload photos to Firebase Storage
      const imageUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `listings/${user.uid}/${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      // Create the Firestore document — same schema as the Flutter app's
      // ListingModel.toMap(), so it shows up correctly in the app too.
      await addDoc(collection(db, "listings"), {
        category,
        subCategory,
        city,
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        location: location.trim(),
        phone: phone.trim(),
        imageUrls,
        userId: user.uid,
        userName: user.displayName ?? "User",
        userPhoto: user.photoURL ?? null,
        userEmail: user.email ?? null,
        createdAt: serverTimestamp(),
        isFeatured: false,
        status: "active",
        latitude: null,
        longitude: null,
        descriptionColor: null,
        descriptionBold: false,
        descriptionItalic: false,
      });

      router.push("/ksa-connect");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong while posting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <nav className="nav container">
        <a href="/" className="brand">
          <div className="brand-badge">M</div>
          MOA Apps Developer&apos;s
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>
            Post a <span className="gold">Listing</span>
          </h1>
          <p>Share housing, cars, or items with the KSA-Connect community.</p>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 640, paddingBottom: 60 }}>
        {loading && <p style={{ marginTop: 24 }}>Checking sign-in status…</p>}

        {!loading && !user && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>
              Sign in with Google to post a listing.
            </p>
            <button className="btn btn-gold" onClick={() => signInWithGoogle()}>
              Sign in with Google
            </button>
          </div>
        )}

        {!loading && user && (
          <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                padding: 12,
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Signed in as <strong>{user.displayName ?? user.email}</strong>
              </span>
              <button
                type="button"
                onClick={() => signOutUser()}
                style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", fontSize: 13 }}
              >
                Sign out
              </button>
            </div>

            <label style={fieldLabel}>City *</label>
            <div className="filters">
              {CITIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`filter-chip ${city === c ? "active" : ""}`}
                  onClick={() => setCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <label style={fieldLabel}>Category *</label>
            <div className="filters">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  className={`filter-chip ${category === c.key ? "active" : ""}`}
                  onClick={() => onCategoryChange(c.key)}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>

            <label style={fieldLabel}>Sub Category</label>
            <div className="filters">
              {SUB_CATEGORIES[category].map((s) => (
                <button
                  type="button"
                  key={s}
                  className={`filter-chip ${subCategory === s ? "active" : ""}`}
                  onClick={() => onSubCategoryChange(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <label style={fieldLabel}>Photos ({files.length}/{MAX_PHOTOS})</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {files.map((f, i) => (
                <div key={i} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    style={removeBtn}
                  >
                    ×
                  </button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <label style={addPhotoBox}>
                  + Add
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFilesChosen}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            <label style={fieldLabel}>Title *</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. 2BHK Apartment - Al Olaya"
            />

            <label style={fieldLabel}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100 }}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe your listing..."
            />

            <label style={fieldLabel}>
              {category === "Classifieds" && subCategory === "Jobs" ? "Salary (SAR) *" : "Price (SAR) *"}
            </label>
            <input
              style={inputStyle}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 2000"
            />

            <label style={fieldLabel}>Location *</label>
            <input
              style={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Al Malqa, Riyadh"
            />

            <label style={fieldLabel}>Contact Number *</label>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 5XXXXXXXX"
            />

            {error && (
              <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 8 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold"
              style={{ width: "100%", marginTop: 20, padding: "14px 0", fontSize: 15 }}
            >
              {submitting ? "Posting…" : "Post Ad"}
            </button>
          </form>
        )}
      </main>

      <footer className="footer">
        <p>
          <a href="/ksa-connect">← Back to listings</a>
        </p>
      </footer>
    </>
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

const addPhotoBox: React.CSSProperties = {
  width: 90,
  height: 90,
  borderRadius: 10,
  border: "1px dashed var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  color: "var(--text-muted)",
  cursor: "pointer",
};

const removeBtn: React.CSSProperties = {
  position: "absolute",
  top: -6,
  right: -6,
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "#111",
  color: "white",
  border: "2px solid white",
  fontSize: 13,
  cursor: "pointer",
  lineHeight: "1",
};
