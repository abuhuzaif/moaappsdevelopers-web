"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, doc, getDoc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";
import { CITIES, CATEGORIES, SUB_CATEGORIES } from "@/lib/categories";
import { DRAFT_TEMPLATES } from "@/lib/draftTemplates";

const MAX_PHOTOS = 3;
const LISTING_LIFESPAN_DAYS = 8;
const IS_KSA_CONNECT_SITE = process.env.NEXT_PUBLIC_SITE_MODE === "ksaconnect";
const DESCRIPTION_COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "#dc2626" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Gold", value: "#b45309" },
  { label: "Purple", value: "#7c3aed" },
];

function PostListingForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [city, setCity] = useState(CITIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[CATEGORIES[0].key][0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [descriptionColor, setDescriptionColor] = useState("");
  const [descriptionBold, setDescriptionBold] = useState(false);
  const [descriptionItalic, setDescriptionItalic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(!!editId);
  const [notAuthorized, setNotAuthorized] = useState(false);

  // Edit mode: load the existing listing and prefill the form. Runs once
  // the signed-in user is known, so we can check owner/admin authorization.
  useEffect(() => {
    if (!editId || loading) return;
    if (!user) {
      setEditLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "listings", editId));
        if (!snap.exists()) {
          setError("This listing no longer exists.");
          setEditLoading(false);
          return;
        }
        const data = snap.data();
        if (data.userId !== user.uid && !isAdmin(user)) {
          setNotAuthorized(true);
          setEditLoading(false);
          return;
        }
        setCity(data.city ?? CITIES[0]);
        setCategory(data.category ?? CATEGORIES[0].key);
        setSubCategory(data.subCategory ?? SUB_CATEGORIES[data.category ?? CATEGORIES[0].key][0]);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setPrice(data.price ? Number(data.price).toLocaleString("en-US") : "");
        setNegotiable(!!data.negotiable);
        setLocation(data.location ?? "");
        setPhone(data.phone ?? "");
        setExistingImageUrls(data.imageUrls ?? []);
        setDescriptionColor(data.descriptionColor ?? "");
        setDescriptionBold(!!data.descriptionBold);
        setDescriptionItalic(!!data.descriptionItalic);
        setIsDraftAutoFilled(false);
      } catch (err: any) {
        setError(err.message ?? "Couldn't load this listing for editing.");
      } finally {
        setEditLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, user, loading]);

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
    const room = MAX_PHOTOS - existingImageUrls.length;
    const combined = [...files, ...chosen].slice(0, Math.max(room, 0));
    setFiles(combined);
  }

  function removeFile(i: number) {
    setFiles(files.filter((_, idx) => idx !== i));
  }

  function removeExistingImage(i: number) {
    setExistingImageUrls(existingImageUrls.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please sign in first.");
      return;
    }
    if (!title.trim() || !location.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    let priceNum = 0;
    if (!negotiable) {
      const cleaned = price.replace(/,/g, "").trim();
      if (cleaned) {
        priceNum = parseFloat(cleaned);
        if (isNaN(priceNum) || priceNum <= 0) {
          setError("Please enter a valid price, or check 'Negotiable / Price on request'.");
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      // Upload any newly chosen photos; keep existing ones already on the
      // listing (relevant when editing) unless the user removed them.
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `listings/${user.uid}/${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        newUrls.push(url);
      }
      const imageUrls = [...existingImageUrls, ...newUrls].slice(0, MAX_PHOTOS);

      const commonFields = {
        category,
        subCategory,
        city,
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        negotiable,
        location: location.trim(),
        phone: phone.trim(),
        imageUrls,
        descriptionColor: descriptionColor || null,
        descriptionBold,
        descriptionItalic,
      };

      if (editId) {
        // Editing an existing listing — owner or admin only (checked on load).
        await updateDoc(doc(db, "listings", editId), commonFields);
      } else {
        // Creating a new listing — same schema as the Flutter app's
        // ListingModel.toMap(), so it shows up correctly in the app too.
        // expiresAt drives a Firestore TTL policy that auto-deletes listings
        // after LISTING_LIFESPAN_DAYS (set up separately in Firebase Console).
        const expiresAt = Timestamp.fromDate(
          new Date(Date.now() + LISTING_LIFESPAN_DAYS * 24 * 60 * 60 * 1000)
        );
        await addDoc(collection(db, "listings"), {
          ...commonFields,
          userId: user.uid,
          userName: user.displayName ?? "User",
          userPhoto: user.photoURL ?? null,
          userEmail: user.email ?? null,
          createdAt: serverTimestamp(),
          expiresAt,
          isFeatured: false,
          status: "active",
          latitude: null,
          longitude: null,
        });
      }

      router.push(editId ? `/ksa-connect/${editId}` : "/ksa-connect");
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
          <div className="brand-badge">{IS_KSA_CONNECT_SITE ? "K" : "M"}</div>
          {IS_KSA_CONNECT_SITE ? "KSA-Connect" : "MOA Apps Developer's"}
        </a>
      </nav>

      <section className="hero" style={{ padding: "36px 0 44px" }}>
        <div className="container">
          <h1 style={{ fontSize: 28 }}>
            {editId ? (
              <>
                Edit <span className="gold">Listing</span>
              </>
            ) : (
              <>
                Post a <span className="gold">Listing</span>
              </>
            )}
          </h1>
          <p>Share housing, cars, or items with the KSA-Connect community.</p>
        </div>
      </section>

      <main className="container" style={{ maxWidth: 640, paddingBottom: 60 }}>
        {(loading || editLoading) && <p style={{ marginTop: 24 }}>Checking sign-in status…</p>}

        {!loading && !editLoading && !user && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>
              Sign in with Google to {editId ? "edit this listing" : "post a listing"}.
            </p>
            <button className="btn btn-gold" onClick={() => signInWithGoogle()}>
              Sign in with Google
            </button>
          </div>
        )}

        {!loading && !editLoading && user && notAuthorized && (
          <div className="empty-state">
            You don&apos;t have permission to edit this listing.
          </div>
        )}

        {!loading && !editLoading && user && !notAuthorized && (
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

            <label style={fieldLabel}>
              Photos ({existingImageUrls.length + files.length}/{MAX_PHOTOS})
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {existingImageUrls.map((url, i) => (
                <div key={`existing-${i}`} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10 }}
                  />
                  <button type="button" onClick={() => removeExistingImage(i)} style={removeBtn}>
                    ×
                  </button>
                </div>
              ))}
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
              {existingImageUrls.length + files.length < MAX_PHOTOS && (
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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setDescriptionBold((v) => !v)}
                style={{
                  ...formatToggleBtn,
                  background: descriptionBold ? "var(--navy)" : "white",
                  color: descriptionBold ? "white" : "var(--ink)",
                }}
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => setDescriptionItalic((v) => !v)}
                style={{
                  ...formatToggleBtn,
                  fontStyle: "italic",
                  background: descriptionItalic ? "var(--navy)" : "white",
                  color: descriptionItalic ? "white" : "var(--ink)",
                }}
                title="Italic"
              >
                I
              </button>
              <span style={{ width: 1, height: 20, background: "var(--border)", margin: "0 2px" }} />
              {DESCRIPTION_COLORS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setDescriptionColor(c.value)}
                  title={c.label}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border:
                      descriptionColor === c.value ? "2px solid var(--navy)" : "1px solid var(--border)",
                    background: c.value || "white",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {!c.value && (
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-muted)" }}>
                      ✕
                    </span>
                  )}
                </button>
              ))}
            </div>
            <textarea
              style={{
                ...inputStyle,
                minHeight: 100,
                color: descriptionColor || "var(--ink)",
                fontWeight: descriptionBold ? 700 : 400,
                fontStyle: descriptionItalic ? "italic" : "normal",
              }}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe your listing..."
            />

            <label style={fieldLabel}>
              {category === "Classifieds" && subCategory === "Jobs" ? "Salary (SAR)" : "Price (SAR)"}
            </label>
            <input
              style={{ ...inputStyle, opacity: negotiable ? 0.5 : 1 }}
              type="text"
              inputMode="numeric"
              disabled={negotiable}
              value={price}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/[^\d]/g, "");
                setPrice(digitsOnly ? Number(digitsOnly).toLocaleString("en-US") : "");
              }}
              placeholder="e.g. 2,000"
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                fontWeight: 600,
                color: "var(--text-muted)",
                margin: "8px 0 4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={negotiable}
                onChange={(e) => {
                  setNegotiable(e.target.checked);
                  if (e.target.checked) setPrice("");
                }}
              />
              Negotiable / Price on request
            </label>

            <label style={fieldLabel}>Location *</label>
            <input
              style={inputStyle}
              type="text"
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
              {submitting ? (editId ? "Saving…" : "Posting…") : editId ? "Save Changes" : "Post Ad"}
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

export default function PostListingPage() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Loading…</p>}>
      <PostListingForm />
    </Suspense>
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

const formatToggleBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 6,
  border: "1px solid var(--border)",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
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
