"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
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
const ADMIN_PUBLIC_NAME = "MYKSA CONNECT";
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
  const adminPosting = !!user && isAdmin(user);

  const [city, setCity] = useState(CITIES[0]);
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[CATEGORIES[0].key][0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceNote, setPriceNote] = useState("");
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
        setPriceNote(data.priceNote ?? "");
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
        priceNote: priceNote.trim() || null,
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
        // When an admin posts, the listing shows "MYKSA CONNECT" publicly
        // instead of the admin's personal name/photo.
        const expiresAt = Timestamp.fromDate(
          new Date(Date.now() + LISTING_LIFESPAN_DAYS * 24 * 60 * 60 * 1000)
        );
        await addDoc(collection(db, "listings"), {
          ...commonFields,
          userId: user.uid,
          userName: adminPosting ? ADMIN_PUBLIC_NAME : user.displayName ?? "User",
          userPhoto: adminPosting ? null : user.photoURL ?? null,
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
    <div className="mk-page">
      {/* ── Branded header bar (reuses the homepage's nav classes) ── */}
      <div style={{ background: "var(--mk-navy, #06172a)", paddingBottom: 2 }}>
        <div style={{ width: "min(1500px, 90vw)", margin: "0 auto", padding: "16px 0" }}>
          <nav className="mk-nav">
            <a href={IS_KSA_CONNECT_SITE ? "/ksa-connect" : "/"} className="mk-logo" aria-label="MYKSA CONNECT home">
              <span className="mk-logo-mark">✦</span>
              <span className="mk-logo-text">
                {IS_KSA_CONNECT_SITE ? (
                  <>
                    <strong>MYKSA</strong> <b>CONNECT</b>
                    <small>BUY. SELL. CONNECT.</small>
                  </>
                ) : (
                  <strong>MOA Apps Developer&apos;s</strong>
                )}
              </span>
            </a>
          </nav>
        </div>
      </div>

      {/* ── Branding banner (same max-width as the form below, so edges line up) ── */}
      {IS_KSA_CONNECT_SITE && (
        <div style={{ maxWidth: 760, margin: "20px auto 0", padding: "0 20px" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1200 / 420", borderRadius: 16, overflow: "hidden" }}>
            <Image
              src="/images/myksa-tools-banner.png"
              alt="MYKSA CONNECT — Explore, Connect, Live Better"
              fill
              sizes="(max-width: 800px) 100vw, 760px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      )}

      {/* ── Page title ── */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 20px 4px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(24px, 3vw, 32px)", margin: "0 0 6px", fontWeight: 850, letterSpacing: "-0.6px", color: "var(--mk-navy, #06172a)" }}>
          {editId ? (
            <>
              Edit <span style={{ color: "var(--mk-gold, #d99a00)" }}>Listing</span>
            </>
          ) : (
            <>
              Post a <span style={{ color: "var(--mk-gold, #d99a00)" }}>Listing</span>
            </>
          )}
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14.5 }}>
          Share housing, cars, or items with the MYKSA CONNECT community.
        </p>
      </div>

      <main style={{ maxWidth: 760, margin: "20px auto 60px", padding: "0 20px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 16px 38px rgba(6,23,42,.1)",
            border: "1px solid #e6e4dc",
            padding: "32px 28px",
          }}
        >
          {(loading || editLoading) && <p style={{ margin: 0, color: "var(--text-muted)" }}>Checking sign-in status…</p>}

          {!loading && !editLoading && !user && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ marginBottom: 18, color: "var(--text-muted)", fontSize: 15 }}>
                Sign in with Google to {editId ? "edit this listing" : "post a listing"}.
              </p>
              <button className="mk-btn mk-btn-gold" onClick={() => signInWithGoogle()}>
                Sign in with Google
              </button>
            </div>
          )}

          {!loading && !editLoading && user && notAuthorized && (
            <div className="empty-state">You don&apos;t have permission to edit this listing.</div>
          )}

          {!loading && !editLoading && user && !notAuthorized && (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 22,
                  padding: "12px 14px",
                  background: "var(--mk-green-soft, #e9f1e9)",
                  border: "1px solid #cfe3cf",
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 13, color: "#2a4a3f" }}>
                  Signed in as <strong>{user.displayName ?? user.email}</strong>
                  {adminPosting && (
                    <>
                      {" "}
                      · <em style={{ fontStyle: "normal", color: "var(--mk-green, #005744)" }}>
                        posting publicly as &quot;{ADMIN_PUBLIC_NAME}&quot;
                      </em>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  style={{ background: "none", border: "none", color: "var(--mk-navy, #06172a)", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  Sign out
                </button>
              </div>

              <label style={fieldLabel}>City *</label>
              <div style={chipRow}>
                {CITIES.map((c) => (
                  <button type="button" key={c} style={chip(city === c)} onClick={() => setCity(c)}>
                    {c}
                  </button>
                ))}
              </div>

              <label style={fieldLabel}>Category *</label>
              <div style={chipRow}>
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c.key}
                    style={chip(category === c.key)}
                    onClick={() => onCategoryChange(c.key)}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              <label style={fieldLabel}>Sub Category</label>
              <div style={chipRow}>
                {SUB_CATEGORIES[category].map((s) => (
                  <button type="button" key={s} style={chip(subCategory === s)} onClick={() => onSubCategoryChange(s)}>
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
                    <img src={url} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 12 }} />
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
                      style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 12 }}
                    />
                    <button type="button" onClick={() => removeFile(i)} style={removeBtn}>
                      ×
                    </button>
                  </div>
                ))}
                {existingImageUrls.length + files.length < MAX_PHOTOS && (
                  <label style={addPhotoBox}>
                    + Add
                    <input type="file" accept="image/*" multiple onChange={onFilesChosen} style={{ display: "none" }} />
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
                    background: descriptionBold ? "var(--mk-navy, #06172a)" : "#fff",
                    color: descriptionBold ? "#fff" : "var(--mk-navy, #06172a)",
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
                    background: descriptionItalic ? "var(--mk-navy, #06172a)" : "#fff",
                    color: descriptionItalic ? "#fff" : "var(--mk-navy, #06172a)",
                  }}
                  title="Italic"
                >
                  I
                </button>
                <span style={{ width: 1, height: 20, background: "#e4e1d8", margin: "0 2px" }} />
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
                      border: descriptionColor === c.value ? "2px solid var(--mk-navy, #06172a)" : "1px solid #e4e1d8",
                      background: c.value || "#fff",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {!c.value && (
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "var(--text-muted)",
                        }}
                      >
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

              <label style={{ ...fieldLabel, marginTop: 10 }}>Price Note (optional)</label>
              <input
                style={{ ...inputStyle, opacity: negotiable ? 0.5 : 1 }}
                type="text"
                disabled={negotiable}
                value={priceNote}
                onChange={(e) => setPriceNote(e.target.value)}
                placeholder="e.g. per month, per night, OBO"
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  margin: "12px 0 4px",
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

              {error && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 8 }}>{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mk-btn mk-btn-gold"
                style={{ width: "100%", marginTop: 22, padding: "14px 0", fontSize: 15, justifyContent: "center" }}
              >
                {submitting ? (editId ? "Saving…" : "Posting…") : editId ? "Save Changes" : "Post Ad"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/ksa-connect" style={{ color: "var(--mk-navy, #06172a)", fontWeight: 700, fontSize: 13.5 }}>
            ← Back to listings
          </a>
        </p>
      </main>
    </div>
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
  color: "var(--mk-navy, #06172a)",
  marginTop: 18,
  marginBottom: 8,
};

const chipRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

function chip(active: boolean): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: 999,
    border: active ? "1.5px solid var(--mk-gold, #f6b91f)" : "1px solid #e4e1d8",
    background: active ? "#fff8df" : "#fff",
    color: active ? "#7a5a00" : "var(--text-muted)",
    fontWeight: active ? 800 : 600,
    fontSize: 13,
    cursor: "pointer",
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e4e1d8",
  fontSize: 14,
  fontFamily: "inherit",
};

const formatToggleBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "1px solid #e4e1d8",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const addPhotoBox: React.CSSProperties = {
  width: 90,
  height: 90,
  borderRadius: 12,
  border: "1px dashed #e4e1d8",
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
