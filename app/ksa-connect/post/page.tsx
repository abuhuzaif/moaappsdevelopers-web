"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { addDoc, collection, doc, getDoc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";
import { CITIES, CATEGORIES, SUB_CATEGORIES, REGIONS } from "@/lib/categories";
import { DRAFT_TEMPLATES } from "@/lib/draftTemplates";
import { track } from "@/lib/analytics";

const MAX_PHOTOS = 6;
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

// 3-step wizard. Firestore schema is unchanged, so the Flutter app,
// security rules and the Make/FB auto-posting keep working as before.
const STEPS = ["Category", "Details", "Contact"] as const;
const PRICE_NOTE_CHIPS = ["per month", "per 3 months", "per 6 months", "per year", "Fixed price"];

// Browser-only helpers: draft autosave + remembering city/phone for next time.
const DRAFT_KEY = "mk_post_draft";
const RESUME_KEY = "mk_post_resume";
const LAST_CITY_KEY = "mk_last_city";
const LAST_PHONE_KEY = "mk_last_phone";

type Draft = {
  category: string;
  subCategory: string;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  negotiable: boolean;
  city: string;
  location: string;
  phone: string;
  showEmail: boolean;
  photoCount: number;
};

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

/** "2BHK FLAT FOR RENT" → "2BHK Flat For Rent" (only when the title is all capitals). */
function fixAllCaps(s: string): string {
  const letters = s.replace(/[^A-Za-z]/g, "");
  if (letters.length < 6 || letters !== letters.toUpperCase()) return s;
  return s
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/\b(\d*)(bhk|br|sar|ac|ksa|tv|wifi|suv)\b/gi, (_, d, w) => d + w.toUpperCase());
}

/** Phone numbers belong in the contact field, not the title (also keeps titles clean on FB/IG). */
function hasPhoneNumber(s: string): boolean {
  return /\d[\d\s-]{7,}\d/.test(s);
}

/** Shrinks big phone photos before upload (faster on mobile data). Falls back to the original file. */
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

function PostListingForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const adminPosting = !!user && isAdmin(user);
  const cardRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [city, setCity] = useState(editId ? CITIES[0] : "");
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[CATEGORIES[0].key][0]);
  const [categoryChosen, setCategoryChosen] = useState(!!editId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceNote, setPriceNote] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [descriptionColor, setDescriptionColor] = useState("");
  const [descriptionBold, setDescriptionBold] = useState(false);
  const [descriptionItalic, setDescriptionItalic] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(!!editId);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [draftReady, setDraftReady] = useState(!!editId);

  // Tracks whether Title/Description currently came from our own draft
  // template (so switching sub-category keeps updating it) vs. the user
  // manually editing it (in which case we stop auto-filling).
  const [isDraftAutoFilled, setIsDraftAutoFilled] = useState(false);
  const [lastDraft, setLastDraft] = useState({ title: "", description: "" });

  // New ad: restore an unfinished draft, remembered city/phone, and a
  // ?category= preset (Facebook "post for free" CTA). Remember utm_source.
  useEffect(() => {
    if (editId) return;
    let restored: Partial<Draft> | null = null;
    try {
      const raw = readStorage(DRAFT_KEY);
      if (raw) restored = JSON.parse(raw);
    } catch {}

    if (restored && (restored.title || restored.description || restored.location)) {
      const cat = restored.category && SUB_CATEGORIES[restored.category] ? restored.category : CATEGORIES[0].key;
      setCategory(cat);
      setSubCategory(
        restored.subCategory && SUB_CATEGORIES[cat].includes(restored.subCategory) ? restored.subCategory : SUB_CATEGORIES[cat][0]
      );
      setCategoryChosen(true);
      setTitle(restored.title ?? "");
      setDescription(restored.description ?? "");
      setPrice(restored.price ?? "");
      setPriceNote(restored.priceNote ?? "");
      setNegotiable(!!restored.negotiable);
      setLocation(restored.location ?? "");
      setShowEmail(!!restored.showEmail);
      if (restored.city && CITIES.includes(restored.city)) setCity(restored.city);
      if (restored.phone) setPhone(restored.phone);
      setNotice("Your unfinished ad was restored.");
    }

    const lastCity = readStorage(LAST_CITY_KEY);
    if (!restored?.city && lastCity && CITIES.includes(lastCity)) setCity(lastCity);
    const lastPhone = readStorage(LAST_PHONE_KEY);
    if (!restored?.phone && lastPhone) setPhone(lastPhone);

    // Coming back from a Google sign-in redirect: jump straight to the last step.
    let resuming = false;
    try {
      resuming = sessionStorage.getItem(RESUME_KEY) === "1";
      sessionStorage.removeItem(RESUME_KEY);
    } catch {}
    if (resuming && restored) {
      setStep(2);
      setNotice(
        restored.photoCount
          ? "You're signed in. Please add your photos again in step 2, then tap Publish."
          : "You're signed in. Tap Publish to post your ad."
      );
    }

    const c = searchParams.get("category");
    if (!restored && c && CATEGORIES.some((x) => x.key === c)) onCategoryChange(c);

    const src = searchParams.get("utm_source");
    if (src) {
      try {
        sessionStorage.setItem("mk_src", src.slice(0, 30));
      } catch {}
    }
    setDraftReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the text fields of a new ad (photos can't be stored in the browser).
  useEffect(() => {
    if (editId || !draftReady) return;
    const draft: Draft = {
      category,
      subCategory,
      title,
      description,
      price,
      priceNote,
      negotiable,
      city,
      location,
      phone,
      showEmail,
      photoCount: files.length,
    };
    writeStorage(DRAFT_KEY, JSON.stringify(draft));
  }, [editId, draftReady, category, subCategory, title, description, price, priceNote, negotiable, city, location, phone, showEmail, files.length]);

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
        setCategoryChosen(true);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setPrice(data.price ? Number(data.price).toLocaleString("en-US") : "");
        setPriceNote(data.priceNote ?? "");
        setNegotiable(!!data.negotiable);
        setLocation(data.location ?? "");
        setPhone(data.phone ?? "");
        setShowEmail(!!data.showEmail);
        setExistingImageUrls(data.imageUrls ?? []);
        setDescriptionColor(data.descriptionColor ?? "");
        setDescriptionBold(!!data.descriptionBold);
        setDescriptionItalic(!!data.descriptionItalic);
        setShowFormatting(!!(data.descriptionColor || data.descriptionBold || data.descriptionItalic));
        setIsDraftAutoFilled(false);
      } catch (err: any) {
        setError(err.message ?? "Couldn't load this listing for editing.");
      } finally {
        setEditLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, user, loading]);

  // After the Google sign-in popup finishes, publish automatically.
  useEffect(() => {
    if (pendingPublish && user && !submitting) {
      setPendingPublish(false);
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPublish, user]);

  // Photo previews (object URLs are released when the list changes).
  const filePreviews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => filePreviews.forEach((u) => URL.revokeObjectURL(u)), [filePreviews]);

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
    setCategoryChosen(true);
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
    e.target.value = ""; // allow choosing the same photo again after removing it
  }

  function removeFile(i: number) {
    setFiles(files.filter((_, idx) => idx !== i));
  }

  function removeExistingImage(i: number) {
    setExistingImageUrls(existingImageUrls.filter((_, idx) => idx !== i));
  }

  /** Returns an error message for the given step, or null when it's complete. */
  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!categoryChosen) return "Choose what you're posting.";
      return null;
    }
    if (s === 1) {
      if (title.trim().length < 5) return "Write a short title (at least 5 letters).";
      if (hasPhoneNumber(title)) return "Please remove the phone number from the title. You'll add it in the next step.";
      if (!negotiable) {
        const cleaned = price.replace(/,/g, "").trim();
        if (cleaned) {
          const n = parseFloat(cleaned);
          if (isNaN(n) || n <= 0) return "Enter a valid price, or tick 'Negotiable / Price on request'.";
        }
      }
      return null;
    }
    if (!city) return "Choose your city.";
    if (!location.trim()) return "Enter your area or district.";
    if (phone.replace(/\D/g, "").length < 9) return "Enter a valid contact number.";
    return null;
  }

  function scrollToCard() {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToStep(next: number) {
    setError(null);
    setStep(next);
    track("post_ad_step", { step: next + 1, category });
    scrollToCard();
  }

  function goNext() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    if (step === 1) setTitle((t) => fixAllCaps(t.trim()));
    goToStep(step + 1);
  }

  async function onPublishClick() {
    setError(null);
    for (let s = 0; s < STEPS.length; s++) {
      const msg = validateStep(s);
      if (msg) {
        setStep(s);
        setError(msg);
        scrollToCard();
        return;
      }
    }
    if (!user) {
      // Sign in only now, after the form is filled. The draft is already
      // saved, so even a redirect-based sign-in brings the user back here.
      setPendingPublish(true);
      try {
        sessionStorage.setItem(RESUME_KEY, "1");
      } catch {}
      try {
        await signInWithGoogle();
        try {
          sessionStorage.removeItem(RESUME_KEY);
        } catch {}
      } catch {
        setPendingPublish(false);
        setError("Sign-in didn't finish. Tap Publish to try again.");
      }
      return;
    }
    await doSubmit();
  }

  async function doSubmit() {
    if (!user) return;
    setError(null);

    let priceNum = 0;
    if (!negotiable) {
      const cleaned = price.replace(/,/g, "").trim();
      if (cleaned) priceNum = parseFloat(cleaned);
    }
    const finalTitle = fixAllCaps(title.trim());

    setSubmitting(true);
    try {
      // Upload any newly chosen photos (compressed); keep existing ones
      // already on the listing (edit mode) unless the user removed them.
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const blob = await compressImage(files[i]);
        const path = `listings/${user.uid}/${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob, { contentType: blob.type || "image/jpeg" });
        const url = await getDownloadURL(storageRef);
        newUrls.push(url);
      }
      const imageUrls = [...existingImageUrls, ...newUrls].slice(0, MAX_PHOTOS);

      const commonFields = {
        category,
        subCategory,
        city,
        title: finalTitle,
        description: description.trim(),
        price: priceNum,
        priceNote: negotiable ? null : priceNote.trim() || null,
        negotiable,
        location: location.trim(),
        phone: phone.trim(),
        showEmail: adminPosting ? false : showEmail,
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
        const expiresAt = Timestamp.fromDate(new Date(Date.now() + LISTING_LIFESPAN_DAYS * 24 * 60 * 60 * 1000));
        let source: string | null = null;
        try {
          source = sessionStorage.getItem("mk_src");
        } catch {}
        const newListing = {
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
        };
        try {
          // `source` (e.g. "facebook") shows which channel brings new posters.
          await addDoc(collection(db, "listings"), source ? { ...newListing, source } : newListing);
        } catch (e: any) {
          // If security rules don't allow the extra field, post without it.
          if (source && String(e?.code ?? e?.message ?? "").includes("permission")) {
            await addDoc(collection(db, "listings"), newListing);
          } else {
            throw e;
          }
        }
        writeStorage(DRAFT_KEY, null);
        writeStorage(LAST_CITY_KEY, city);
        if (!adminPosting) writeStorage(LAST_PHONE_KEY, phone.trim());
      }

      track(editId ? "edit_ad_success" : "post_ad_success", {
        category,
        sub_category: subCategory,
        city,
        photos: existingImageUrls.length + files.length,
      });
      router.push(editId ? `/ksa-connect/${editId}` : "/ksa-connect");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong while posting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) goNext();
    else onPublishClick();
  }

  function clearDraft() {
    writeStorage(DRAFT_KEY, null);
    setTitle("");
    setDescription("");
    setPrice("");
    setPriceNote("");
    setNegotiable(false);
    setLocation("");
    setFiles([]);
    setCategoryChosen(false);
    setIsDraftAutoFilled(false);
    setNotice(null);
    setStep(0);
  }

  const photoCount = existingImageUrls.length + files.length;
  const coverPhoto = existingImageUrls[0] ?? filePreviews[0] ?? null;
  const isJob = category === "Classifieds" && subCategory === "Jobs";
  const categoryInfo = CATEGORIES.find((c) => c.key === category);
  const showForm = !loading && !editLoading && !notAuthorized && (!editId || !!user);

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

      {/* ── Branding banner: first step only, so later steps need less scrolling ── */}
      {IS_KSA_CONNECT_SITE && step === 0 && (
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
        <h1
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            margin: "0 0 6px",
            fontWeight: 850,
            letterSpacing: "-0.6px",
            color: "var(--mk-navy, #06172a)",
          }}
        >
          {editId ? "Edit your ad" : "Post a free ad"}
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14.5 }}>
          {editId ? "Change anything and save." : "Three quick steps. Takes about a minute."}
        </p>
      </div>

      <main style={{ maxWidth: 760, margin: "20px auto 60px", padding: "0 20px" }}>
        <div
          ref={cardRef}
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 16px 38px rgba(6,23,42,.1)",
            border: "1px solid #e6e4dc",
            padding: "28px 24px",
            scrollMarginTop: 16,
          }}
        >
          {(loading || editLoading) && <p style={{ margin: 0, color: "var(--text-muted)" }}>Loading…</p>}

          {/* Editing needs sign-in up front (we load the owner's listing). New ads don't. */}
          {!loading && !editLoading && editId && !user && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ marginBottom: 18, color: "var(--text-muted)", fontSize: 15 }}>Sign in with Google to edit this listing.</p>
              <button className="mk-btn mk-btn-gold" onClick={() => signInWithGoogle()}>
                Sign in with Google
              </button>
            </div>
          )}

          {!loading && !editLoading && user && notAuthorized && (
            <div className="empty-state">You don&apos;t have permission to edit this listing.</div>
          )}

          {showForm && (
            <form onSubmit={onFormSubmit} noValidate>
              {/* ── Step indicator ── */}
              <ol style={stepList} aria-label="Progress">
                {STEPS.map((label, i) => {
                  const done = i < step;
                  const current = i === step;
                  const canJump = i < step || !!editId;
                  return (
                    <li key={label} style={{ flex: 1 }}>
                      <button
                        type="button"
                        disabled={!canJump}
                        onClick={() => canJump && goToStep(i)}
                        aria-current={current ? "step" : undefined}
                        style={{
                          width: "100%",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: canJump ? "pointer" : "default",
                          textAlign: "left",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            height: 6,
                            borderRadius: 999,
                            background: done || current ? "var(--mk-green, #005744)" : "#e8e5dc",
                            opacity: current ? 1 : done ? 0.55 : 1,
                          }}
                        />
                        <span
                          style={{
                            display: "block",
                            marginTop: 6,
                            fontSize: 12.5,
                            fontWeight: current ? 800 : 600,
                            color: current ? "var(--mk-navy, #06172a)" : "var(--text-muted)",
                          }}
                        >
                          {i + 1}. {label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* ── Signed-in strip / sign-in hint ── */}
              {user ? (
                <div style={signedInStrip}>
                  <span style={{ fontSize: 13, color: "#2a4a3f" }}>
                    Signed in as <strong>{user.displayName ?? user.email}</strong>
                    {adminPosting && (
                      <em style={{ fontStyle: "normal", color: "var(--mk-green, #005744)" }}>
                        {" "}
                        (posting publicly as &quot;{ADMIN_PUBLIC_NAME}&quot;)
                      </em>
                    )}
                  </span>
                  <button type="button" onClick={() => signOutUser()} style={linkBtn}>
                    Sign out
                  </button>
                </div>
              ) : (
                <p style={hintBox}>Fill in your ad first. We&apos;ll ask you to sign in with Google when you publish.</p>
              )}

              {notice && !editId && (
                <div style={{ ...hintBox, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <span>{notice}</span>
                  {step === 0 && (
                    <button type="button" onClick={clearDraft} style={linkBtn}>
                      Start over
                    </button>
                  )}
                </div>
              )}

              {/* ───────── Step 1: Category ───────── */}
              {step === 0 && (
                <section>
                  <h2 style={stepHeading}>What are you posting?</h2>
                  <div style={tileGrid}>
                    {CATEGORIES.map((c) => {
                      const active = categoryChosen && category === c.key;
                      return (
                        <button type="button" key={c.key} style={tile(active)} onClick={() => onCategoryChange(c.key)} aria-pressed={active}>
                          <span style={{ fontSize: 30, lineHeight: 1 }} aria-hidden>
                            {c.emoji}
                          </span>
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {categoryChosen && SUB_CATEGORIES[category].length > 1 && (
                    <>
                      <label style={fieldLabel}>Which one fits best?</label>
                      <div style={chipRow}>
                        {SUB_CATEGORIES[category].map((s) => (
                          <button
                            type="button"
                            key={s}
                            style={chip(subCategory === s)}
                            onClick={() => onSubCategoryChange(s)}
                            aria-pressed={subCategory === s}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* ───────── Step 2: Details ───────── */}
              {step === 1 && (
                <section>
                  <h2 style={stepHeading}>
                    Tell people about it
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginTop: 4 }}>
                      {categoryInfo?.emoji} {categoryInfo?.label} / {subCategory}
                    </span>
                  </h2>

                  <label style={fieldLabel}>
                    Photos <span style={optional}>({photoCount}/{MAX_PHOTOS}, ads with photos get more replies)</span>
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {existingImageUrls.map((url, i) => (
                      <div key={`existing-${i}`} style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" style={thumb} />
                        <button type="button" onClick={() => removeExistingImage(i)} style={removeBtn} aria-label="Remove photo">
                          ×
                        </button>
                      </div>
                    ))}
                    {filePreviews.map((url, i) => (
                      <div key={url} style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" style={thumb} />
                        <button type="button" onClick={() => removeFile(i)} style={removeBtn} aria-label="Remove photo">
                          ×
                        </button>
                      </div>
                    ))}
                    {photoCount < MAX_PHOTOS && (
                      <label style={addPhotoBox}>
                        <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>
                          📷
                        </span>
                        Add photos
                        <input type="file" accept="image/*" multiple onChange={onFilesChosen} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>

                  <label style={fieldLabel} htmlFor="post-title">
                    Title
                  </label>
                  <input
                    id="post-title"
                    style={inputStyle}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    onBlur={() => setTitle((t) => fixAllCaps(t))}
                    placeholder="e.g. 2BHK family flat near Lulu, Al Olaya"
                    maxLength={90}
                    autoComplete="off"
                  />
                  <p style={fieldHint}>Keep it short. No phone numbers here.</p>

                  <label style={fieldLabel} htmlFor="post-price">
                    {isJob ? "Salary (SAR)" : "Price (SAR)"} <span style={optional}>optional</span>
                  </label>
                  <input
                    id="post-price"
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
                  {!negotiable && (
                    <div style={{ ...chipRow, marginTop: 10 }}>
                      {PRICE_NOTE_CHIPS.map((n) => (
                        <button
                          type="button"
                          key={n}
                          style={chip(priceNote === n)}
                          onClick={() => setPriceNote(priceNote === n ? "" : n)}
                          aria-pressed={priceNote === n}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  <label style={checkRow}>
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

                  <label style={fieldLabel} htmlFor="post-desc">
                    Description <span style={optional}>optional</span>
                  </label>
                  <textarea
                    id="post-desc"
                    style={{
                      ...inputStyle,
                      minHeight: 110,
                      color: descriptionColor || "var(--ink)",
                      fontWeight: descriptionBold ? 700 : 400,
                      fontStyle: descriptionItalic ? "italic" : "normal",
                    }}
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Size, condition, what's included, who it suits…"
                  />

                  <button type="button" onClick={() => setShowFormatting((v) => !v)} style={{ ...linkBtn, marginTop: 8 }}>
                    {showFormatting ? "Hide text style" : "Text style (bold, colour)"}
                  </button>
                  {showFormatting && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setDescriptionBold((v) => !v)}
                        style={{
                          ...formatToggleBtn,
                          background: descriptionBold ? "var(--mk-navy, #06172a)" : "#fff",
                          color: descriptionBold ? "#fff" : "var(--mk-navy, #06172a)",
                        }}
                        title="Bold"
                        aria-pressed={descriptionBold}
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
                        aria-pressed={descriptionItalic}
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
                          aria-label={`${c.label} text colour`}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: descriptionColor === c.value ? "2px solid var(--mk-navy, #06172a)" : "1px solid #e4e1d8",
                            background: c.value || "#fff",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ───────── Step 3: Contact ───────── */}
              {step === 2 && (
                <section>
                  <h2 style={stepHeading}>Where are you, and how can people reach you?</h2>

                  <label style={fieldLabel} htmlFor="post-city">
                    City
                  </label>
                  <select id="post-city" style={{ ...inputStyle, background: "#fff" }} value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="" disabled>
                      Choose your city
                    </option>
                    {REGIONS.map((r) => (
                      <optgroup key={r.key} label={`${r.emoji} ${r.label}`}>
                        {r.cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <label style={fieldLabel} htmlFor="post-location">
                    Area or district
                  </label>
                  <input
                    id="post-location"
                    style={inputStyle}
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Al Malaz, near Lulu"
                    autoComplete="off"
                  />

                  <label style={fieldLabel} htmlFor="post-phone">
                    WhatsApp / phone number
                  </label>
                  <input
                    id="post-phone"
                    style={inputStyle}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 05XXXXXXXX"
                    autoComplete="tel"
                  />
                  <p style={fieldHint}>People can call you or message you on WhatsApp.</p>

                  {!adminPosting && (
                    <label style={checkRow}>
                      <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} />
                      Also show my email on this ad
                    </label>
                  )}

                  {/* ── Preview ── */}
                  <div style={previewCard}>
                    {coverPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverPhoto} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                    ) : (
                      <div style={{ ...thumb, width: 84, height: 84, display: "grid", placeItems: "center", fontSize: 30, background: "#f4f2ec" }}>
                        {categoryInfo?.emoji}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>How your ad will look</div>
                      <div style={{ fontWeight: 800, color: "var(--mk-navy, #06172a)", fontSize: 15, marginTop: 2, overflowWrap: "anywhere" }}>
                        {fixAllCaps(title) || "Your title"}
                      </div>
                      <div style={{ fontSize: 13.5, color: "var(--mk-green, #005744)", fontWeight: 700, marginTop: 2 }}>
                        {negotiable ? "Negotiable" : price ? `SAR ${price}${priceNote ? ` ${priceNote}` : ""}` : "Price not given"}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                        {[location, city].filter(Boolean).join(", ") || "Your area"}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {error && (
                <p role="alert" style={{ color: "#b91c1c", fontSize: 13.5, fontWeight: 600, marginTop: 16 }}>
                  {error}
                </p>
              )}

              {/* ── Navigation ── */}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                {step > 0 && (
                  <button type="button" onClick={() => goToStep(step - 1)} style={backBtn} disabled={submitting}>
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || pendingPublish}
                  className="mk-btn mk-btn-gold"
                  style={{ flex: 1, padding: "14px 0", fontSize: 15, justifyContent: "center" }}
                >
                  {step < STEPS.length - 1
                    ? "Next"
                    : submitting
                      ? editId
                        ? "Saving…"
                        : "Publishing…"
                      : pendingPublish
                        ? "Signing in…"
                        : editId
                          ? "Save changes"
                          : user
                            ? "Publish ad"
                            : "Sign in with Google and publish"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/ksa-connect" style={{ color: "var(--mk-navy, #06172a)", fontWeight: 700, fontSize: 13.5 }}>
            Back to listings
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

const stepList: React.CSSProperties = {
  display: "flex",
  gap: 10,
  listStyle: "none",
  padding: 0,
  margin: "0 0 20px",
};

const stepHeading: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 850,
  color: "var(--mk-navy, #06172a)",
  margin: "4px 0 14px",
  letterSpacing: "-0.3px",
};

const tileGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
  gap: 10,
};

function tile(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "18px 8px",
    minHeight: 100,
    borderRadius: 16,
    border: active ? "2px solid var(--mk-gold, #f6b91f)" : "1px solid #e4e1d8",
    background: active ? "#fff8df" : "#fff",
    color: "var(--mk-navy, #06172a)",
    fontWeight: 800,
    fontSize: 14,
    textAlign: "center",
    cursor: "pointer",
  };
}

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: 13.5,
  fontWeight: 700,
  color: "var(--mk-navy, #06172a)",
  marginTop: 20,
  marginBottom: 8,
};

const optional: React.CSSProperties = {
  fontWeight: 500,
  color: "var(--text-muted)",
  fontSize: 12.5,
};

const fieldHint: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 12.5,
  color: "var(--text-muted)",
};

const hintBox: React.CSSProperties = {
  margin: "0 0 16px",
  padding: "10px 14px",
  background: "#f6f4ee",
  border: "1px solid #e8e5dc",
  borderRadius: 12,
  fontSize: 13,
  color: "#4a5553",
};

const signedInStrip: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
  padding: "10px 14px",
  background: "var(--mk-green-soft, #e9f1e9)",
  border: "1px solid #cfe3cf",
  borderRadius: 12,
};

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "var(--mk-navy, #06172a)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  textDecoration: "underline",
  whiteSpace: "nowrap",
};

const chipRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

function chip(active: boolean): React.CSSProperties {
  return {
    padding: "9px 16px",
    borderRadius: 999,
    border: active ? "1.5px solid var(--mk-gold, #f6b91f)" : "1px solid #e4e1d8",
    background: active ? "#fff8df" : "#fff",
    color: active ? "#7a5a00" : "var(--text-muted)",
    fontWeight: active ? 800 : 600,
    fontSize: 13,
    cursor: "pointer",
  };
}

const checkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13.5,
  fontWeight: 600,
  color: "var(--text-muted)",
  margin: "14px 0 0",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 12,
  border: "1px solid #e4e1d8",
  fontSize: 16, // 16px stops iPhone Safari from zooming into the field
  fontFamily: "inherit",
};

const thumb: React.CSSProperties = {
  width: 96,
  height: 96,
  objectFit: "cover",
  borderRadius: 12,
};

const formatToggleBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #e4e1d8",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const addPhotoBox: React.CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: 12,
  border: "1.5px dashed #c9c4b6",
  background: "#faf9f5",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--mk-navy, #06172a)",
  cursor: "pointer",
};

const removeBtn: React.CSSProperties = {
  position: "absolute",
  top: -6,
  right: -6,
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "#111",
  color: "white",
  border: "2px solid white",
  fontSize: 13,
  cursor: "pointer",
  lineHeight: "1",
};

const previewCard: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  marginTop: 24,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #e8e5dc",
  background: "#fcfbf8",
};

const backBtn: React.CSSProperties = {
  padding: "14px 22px",
  borderRadius: 999,
  border: "1px solid #e4e1d8",
  background: "#fff",
  color: "var(--mk-navy, #06172a)",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};
