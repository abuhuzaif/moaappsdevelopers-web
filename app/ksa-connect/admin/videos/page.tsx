"use client";

// Admin: daily "new ads" videos (made by the makeDailyAdsVideo Cloud Function at 20:00 Riyadh).
// Download the MP4, copy the caption, schedule it in Metricool for 20:30.
// Also: restaurant promo videos (Urdu voice) — made on demand by makeRestaurantVideoNow.

import { useEffect, useState, type CSSProperties } from "react";
import { collection, getDocs, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";

type Restaurant = { id: string; slug: string; name: string; isActive?: boolean };
type RestaurantVideo = { status?: "working" | "ready" | "failed"; url?: string; sizeBytes?: number; caption?: string; name?: string; dishIds?: string[]; dishPhotos?: Record<string, { url?: string }> };
type PickDish = { id: string; name: string; price?: number; imageUrl?: string; available: boolean };
const MAX_CHOSEN = 8;

/** Shrinks a picked photo (max 1600 px, JPEG) so it uploads fast and stays sharp in the 1080 px video. */
async function photoToDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Could not read this image"));
      i.src = url;
    });
    const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

type DailyVideo = {
  id: string;
  date: string;
  status: "working" | "ready" | "no-ads";
  count?: number;
  url?: string;
  sizeBytes?: number;
  caption?: string;
  trigger?: string;
  tool?: { status: "working" | "ready" | "failed"; name?: string; slug?: string; url?: string; sizeBytes?: number; caption?: string };
};

/** One downloadable video with its caption. */
function VideoBlock({ label, date, name, status, url, sizeBytes, caption, copied, onCopy, empty }: {
  label: string; date: string; name: string; status?: string; url?: string; sizeBytes?: number; caption?: string;
  copied: boolean; onCopy: () => void; empty: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)", gap: 14 }}>
      {status === "ready" && url ? (
        <video src={url} controls preload="metadata" style={{ width: "100%", aspectRatio: "9 / 16", borderRadius: 12, background: "#000" }} />
      ) : (
        <div style={{ aspectRatio: "9 / 16", borderRadius: 12, background: "#eef2f1", display: "grid", placeItems: "center", color: "#5d6a68", fontSize: 13, textAlign: "center", padding: 10 }}>
          {status === "working" ? "⏳ Being made…" : status === "failed" ? "⚠️ Failed" : empty}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.6, color: "#005744" }}>{label}</div>
        <div style={{ fontWeight: 800, margin: "2px 0 8px" }}>{name}{sizeBytes ? <span style={{ fontWeight: 500, color: "#5d6a68", fontSize: 13 }}> · {(sizeBytes / 1e6).toFixed(1)} MB</span> : null}</div>
        {status === "ready" && url && (
          <a href={url} download={`myksa-${label.toLowerCase().replace(/\W+/g, "-")}-${date}.mp4`} style={{ display: "inline-block", padding: "9px 14px", borderRadius: 10, background: "#f6b91f", color: "#0c1730", fontWeight: 800, textDecoration: "none", marginBottom: 10 }}>
            ⬇ Download
          </a>
        )}
        {caption && (
          <>
            <textarea readOnly value={caption} rows={7} style={{ width: "100%", fontSize: 13, padding: 10, borderRadius: 10, border: "1px solid #dfe7e3", fontFamily: "inherit", resize: "vertical" }} />
            <button onClick={onCopy} style={{ marginTop: 6, padding: "7px 13px", borderRadius: 10, border: "1px solid #005744", background: "#fff", color: "#005744", fontWeight: 800, cursor: "pointer" }}>
              {copied ? "✓ Copied" : "Copy caption"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminVideosPage() {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState<DailyVideo[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restVideos, setRestVideos] = useState<Record<string, RestaurantVideo>>({});
  const [busySlug, setBusySlug] = useState("");
  const [restErrors, setRestErrors] = useState<Record<string, string>>({});
  // Dish picker: open restaurant, its dishes, and the ticked dish ids (in order)
  const [pickerFor, setPickerFor] = useState("");
  const [pickDishes, setPickDishes] = useState<Record<string, PickDish[]>>({});
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState(""); // "<slug>/<dishId>" while a video photo uploads

  const admin = !!user && isAdmin(user);

  useEffect(() => {
    if (!admin) return;
    const q = query(collection(db, "dailyVideos"), orderBy("date", "desc"), limit(14));
    return onSnapshot(
      q,
      (snap) => setVideos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DailyVideo, "id">) }))),
      (e) => setMsg(`Could not load videos: ${e.message}`)
    );
  }, [admin]);

  // Restaurants + their promo videos
  useEffect(() => {
    if (!admin) return;
    const stopR = onSnapshot(
      collection(db, "restaurants"),
      (snap) =>
        setRestaurants(
          snap.docs
            .map((d) => ({ id: d.id, slug: String(d.get("slug") ?? ""), name: String(d.get("name") ?? d.id), isActive: d.get("isActive") }))
            .filter((r) => r.slug)
            .sort((a, b) => a.name.localeCompare(b.name)),
        ),
      () => undefined,
    );
    const stopV = onSnapshot(
      collection(db, "restaurantVideos"),
      (snap) => setRestVideos(Object.fromEntries(snap.docs.map((d) => [d.id, d.data() as RestaurantVideo]))),
      () => undefined, // no read rule yet → the button result below still shows
    );
    return () => { stopR(); stopV(); };
  }, [admin]);

  async function openPicker(r: Restaurant) {
    if (pickerFor === r.slug) { setPickerFor(""); return; }
    setPickerFor(r.slug);
    if (!chosen[r.slug] && restVideos[r.slug]?.dishIds?.length) {
      setChosen((prev) => ({ ...prev, [r.slug]: restVideos[r.slug].dishIds! }));
    }
    if (pickDishes[r.slug]) return;
    try {
      const snap = await getDocs(collection(db, "restaurants", r.id, "menuItems"));
      const list = snap.docs
        .map((d) => {
          const x = d.data();
          const amounts = (Array.isArray(x.prices) ? x.prices : []).map((p: any) => p?.amount).filter((a: unknown) => typeof a === "number" && a > 0);
          return {
            id: d.id,
            name: String(x.name ?? d.id),
            price: amounts.length ? Math.min(...amounts) : undefined,
            imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : undefined,
            available: x.isAvailable !== false,
            sort: typeof x.sort === "number" ? x.sort : 0,
          };
        })
        .sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl) || a.sort - b.sort);
      setPickDishes((prev) => ({ ...prev, [r.slug]: list }));
    } catch (e) {
      setRestErrors((prev) => ({ ...prev, [r.slug]: `Could not load dishes: ${e instanceof Error ? e.message : String(e)}` }));
    }
  }

  async function setDishPhoto(slug: string, dishId: string, file: File | null) {
    const key = `${slug}/${dishId}`;
    setUploading(key);
    setRestErrors((prev) => ({ ...prev, [slug]: "" }));
    try {
      const fn = httpsCallable(getFunctions(getApp(), "us-central1"), "setVideoDishPhoto", { timeout: 120_000 });
      const dataUrl = file ? await photoToDataUrl(file) : null;
      const res = (await fn({ slug, dishId, dataUrl })) as { data: { url?: string } };
      setRestVideos((prev) => {
        const photos = { ...(prev[slug]?.dishPhotos ?? {}) };
        if (res.data.url) photos[dishId] = { url: res.data.url };
        else delete photos[dishId];
        return { ...prev, [slug]: { ...prev[slug], dishPhotos: photos } };
      });
      // a dish that gets a video photo is ticked automatically
      if (file) setChosen((prev) => {
        const cur = prev[slug] ?? [];
        return cur.includes(dishId) || cur.length >= MAX_CHOSEN ? prev : { ...prev, [slug]: [...cur, dishId] };
      });
    } catch (e) {
      setRestErrors((prev) => ({ ...prev, [slug]: `Photo upload failed: ${e instanceof Error ? e.message : String(e)}` }));
    } finally {
      setUploading("");
    }
  }

  function toggleDish(slug: string, id: string) {
    setChosen((prev) => {
      const cur = prev[slug] ?? [];
      if (cur.includes(id)) return { ...prev, [slug]: cur.filter((x) => x !== id) };
      if (cur.length >= MAX_CHOSEN) return prev;
      return { ...prev, [slug]: [...cur, id] };
    });
  }

  async function makeRestaurantVideo(slug: string) {
    setBusySlug(slug);
    setRestErrors((prev) => ({ ...prev, [slug]: "" }));
    setMsg("Making the restaurant video (Urdu voice)… this takes 1–3 minutes.");
    try {
      const fn = httpsCallable(getFunctions(getApp(), "us-central1"), "makeRestaurantVideoNow", { timeout: 540_000 });
      const res = (await fn({ slug, dishIds: chosen[slug] ?? [] })) as { data: { url: string; sizeBytes: number } };
      setRestVideos((prev) => ({ ...prev, [slug]: { ...prev[slug], status: "ready", url: res.data.url, sizeBytes: res.data.sizeBytes } }));
      setMsg("Done — restaurant video is ready below.");
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setMsg(`Failed: ${err}`);
      setRestErrors((prev) => ({ ...prev, [slug]: err }));
    } finally {
      setBusySlug("");
    }
  }

  async function generateNow() {
    setBusy(true);
    setMsg("Making today's video… this takes 1–3 minutes. You can keep this page open.");
    try {
      const fn = httpsCallable(getFunctions(getApp(), "us-central1"), "makeDailyAdsVideoNow", { timeout: 540_000 });
      const res = (await fn()) as { data: { status: string; count: number } };
      setMsg(res.data.status === "no-ads" ? "Tool video done. No new ads with photos in the last 24 hours." : `Done — ${res.data.count} ads + tool of the day.`);
    } catch (e) {
      setMsg(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* ignore */
    }
  }

  const wrap: CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "28px 16px 60px", color: "#0c1730" };

  if (loading) return <main style={wrap}>Loading…</main>;
  if (!user)
    return (
      <main style={wrap}>
        <h1>Daily videos</h1>
        <button className="btn btn-primary" onClick={() => signInWithGoogle()}>Sign in with Google</button>
      </main>
    );
  if (!admin) return <main style={wrap}>Admins only.</main>;

  return (
    <main style={wrap}>
      <a href="/ksa-connect" style={{ color: "#005744", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>← MYKSA Connect</a>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", margin: "12px 0 6px" }}>
        <h1 style={{ margin: 0 }}>📹 Daily videos</h1>
        <button
          onClick={generateNow}
          disabled={busy}
          style={{ padding: "11px 18px", borderRadius: 12, border: 0, background: busy ? "#9ab7ad" : "#005744", color: "#fff", fontWeight: 800, cursor: busy ? "wait" : "pointer" }}
        >
          {busy ? "Making video…" : "⚡ Make today's video now"}
        </button>
      </div>
      <p style={{ margin: "0 0 18px", color: "#5d6a68", fontSize: 14 }}>
        Every day at 8:00 PM (Riyadh) two videos are made: the new ads of the last 24 hours, and a "Free tool of the day". Download them, copy the captions, and schedule them in Metricool.
      </p>
      {msg && <p style={{ padding: "10px 12px", borderRadius: 10, background: "#fff8df", color: "#665300", fontSize: 14 }}>{msg}</p>}
      {videos.length === 0 && <p style={{ color: "#5d6a68" }}>No videos yet. The first one arrives tonight at 8 PM, or press “Make today's video now”.</p>}

      {/* ── Restaurant promo videos ── */}
      <section style={{ padding: 16, borderRadius: 16, border: "1px solid #dfe7e3", background: "#fff", marginBottom: 18 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>🍽️ Restaurant videos</h2>
        <p style={{ margin: "0 0 14px", color: "#5d6a68", fontSize: 13 }}>
          Urdu voice + English/Urdu text, 5 dishes with photos and prices. Only the newest video per restaurant is kept.
        </p>
        <div style={{ display: "grid", gap: 16 }}>
          {restaurants.map((r) => {
            const v = restVideos[r.slug];
            const working = busySlug === r.slug;
            return (
              <div key={r.slug} style={{ paddingTop: 12, borderTop: "1px solid #eef2f1" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <strong>
                    {r.name}
                    {r.isActive === false && <span style={{ fontSize: 12, color: "#b45309" }}> · draft</span>}
                  </strong>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => openPicker(r)}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #0c1730", background: pickerFor === r.slug ? "#0c1730" : "#fff", color: pickerFor === r.slug ? "#fff" : "#0c1730", fontWeight: 800, cursor: "pointer" }}
                  >
                    🍛 Choose dishes{chosen[r.slug]?.length ? ` (${chosen[r.slug].length})` : ""}
                  </button>
                  <button
                    onClick={() => makeRestaurantVideo(r.slug)}
                    disabled={!!busySlug}
                    style={{ padding: "8px 14px", borderRadius: 10, border: 0, background: busySlug ? "#9ab7ad" : "#0c1730", color: "#fff", fontWeight: 800, cursor: busySlug ? "wait" : "pointer" }}
                  >
                    {working ? "Making…" : v?.url ? "🔄 Make again" : "🎬 Make video"}
                  </button>
                  </div>
                </div>
                {pickerFor === r.slug && (
                  <div style={{ margin: "0 0 12px", padding: 12, borderRadius: 12, background: "#f7f9f8", border: "1px solid #dfe7e3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 8, fontSize: 13 }}>
                      <span>
                        Tick up to {MAX_CHOSEN} dishes — the video shows them <b>in the order you tick</b>. 📷 = a better photo just for the video.{" "}
                        {(chosen[r.slug]?.length ?? 0) === 0 && "Nothing ticked = automatic pick (5 dishes)."}
                      </span>
                      {(chosen[r.slug]?.length ?? 0) > 0 && (
                        <button type="button" onClick={() => setChosen((prev) => ({ ...prev, [r.slug]: [] }))}
                          style={{ border: 0, background: "transparent", color: "#b42318", fontWeight: 700, cursor: "pointer" }}>
                          Clear
                        </button>
                      )}
                    </div>
                    {!pickDishes[r.slug] ? (
                      <p style={{ margin: 0, color: "#5d6a68", fontSize: 13 }}>Loading dishes…</p>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, maxHeight: 420, overflowY: "auto" }}>
                        {pickDishes[r.slug].map((d) => {
                          const pos = (chosen[r.slug] ?? []).indexOf(d.id);
                          const on = pos >= 0;
                          const videoPhoto = v?.dishPhotos?.[d.id]?.url;
                          const thumb = videoPhoto ?? d.imageUrl;
                          const busyHere = uploading === `${r.slug}/${d.id}`;
                          const inputId = `vp-${r.slug}-${d.id}`;
                          return (
                            <div
                              key={d.id}
                              style={{
                                display: "flex", alignItems: "center", gap: 8, padding: 6, borderRadius: 10,
                                border: `2px solid ${on ? "#005744" : "#dfe7e3"}`, background: on ? "#e8f3ef" : "#fff",
                                opacity: d.available ? 1 : 0.55,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => toggleDish(r.slug, d.id)}
                                style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, padding: 0, border: 0, background: "transparent", textAlign: "left", cursor: "pointer" }}
                              >
                                <span style={{ position: "relative", flexShrink: 0 }}>
                                  {thumb ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={thumb} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, display: "block" }} />
                                  ) : (
                                    <span style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 8, background: "#eef2f1", fontSize: 11, color: "#65716f" }}>no photo</span>
                                  )}
                                  {videoPhoto && (
                                    <span title="Video photo" style={{ position: "absolute", bottom: -4, right: -4, background: "#f6b91f", borderRadius: 6, fontSize: 9, fontWeight: 800, padding: "0 3px", color: "#0c1730" }}>🎬</span>
                                  )}
                                </span>
                                <span style={{ minWidth: 0, flex: 1 }}>
                                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0c1730", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                                  <span style={{ fontSize: 12, color: "#65716f" }}>{d.price ? `SAR ${d.price}` : ""}{d.available ? "" : " · hidden"}</span>
                                </span>
                                {on && (
                                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#005744", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                                    {pos + 1}
                                  </span>
                                )}
                              </button>
                              {/* Optional photo only for the video (the menu keeps its own photo) */}
                              <label
                                htmlFor={inputId}
                                title={videoPhoto ? "Change video photo" : "Upload a photo for the video"}
                                style={{ width: 30, height: 30, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 8, border: "1px solid #d6dfdc", background: "#fff", cursor: busyHere ? "wait" : "pointer", fontSize: 15 }}
                              >
                                {busyHere ? "⏳" : "📷"}
                              </label>
                              <input
                                id={inputId}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: "none" }}
                                disabled={!!uploading}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  e.currentTarget.value = "";
                                  if (f) setDishPhoto(r.slug, d.id, f);
                                }}
                              />
                              {videoPhoto && !busyHere && (
                                <button
                                  type="button"
                                  title="Remove video photo"
                                  onClick={() => setDishPhoto(r.slug, d.id, null)}
                                  disabled={!!uploading}
                                  style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, border: "1px solid #f3c4bf", background: "#fff", color: "#b42318", fontWeight: 800, cursor: "pointer" }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {restErrors[r.slug] && !working && (
                  <p style={{ margin: "0 0 10px", padding: "8px 10px", borderRadius: 8, background: "#fdecea", color: "#b42318", fontSize: 13 }}>
                    ⚠️ {restErrors[r.slug]}
                  </p>
                )}
                {(v?.url || working) && (
                  <VideoBlock
                    label="RESTAURANT" date={r.slug} name={r.name} status={working ? "working" : v?.status ?? "ready"} url={v?.url} sizeBytes={v?.sizeBytes} caption={v?.caption}
                    copied={copied === `rest-${r.slug}`} onCopy={() => copy(v?.caption ?? "", `rest-${r.slug}`)} empty="Not made yet"
                  />
                )}
              </div>
            );
          })}
          {restaurants.length === 0 && <p style={{ color: "#5d6a68", margin: 0 }}>No restaurants found.</p>}
        </div>
      </section>

      <div style={{ display: "grid", gap: 18 }}>
        {videos.map((v) => (
          <section key={v.id} style={{ padding: 16, borderRadius: 16, border: "1px solid #dfe7e3", background: "#fff" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>📅 {v.date}{v.trigger === "manual" ? <span style={{ fontSize: 12, fontWeight: 600, color: "#5d6a68" }}> · made manually</span> : null}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))", gap: 18 }}>
              <VideoBlock
                label="NEW ADS" date={v.date} name={`${v.count ?? 0} new ads`} status={v.status} url={v.url} sizeBytes={v.sizeBytes} caption={v.caption}
                copied={copied === `${v.id}-ads`} onCopy={() => copy(v.caption ?? "", `${v.id}-ads`)} empty="No new ads with photos"
              />
              <VideoBlock
                label="TOOL OF THE DAY" date={v.date} name={v.tool?.name ?? "—"} status={v.tool?.status} url={v.tool?.url} sizeBytes={v.tool?.sizeBytes} caption={v.tool?.caption}
                copied={copied === `${v.id}-tool`} onCopy={() => copy(v.tool?.caption ?? "", `${v.id}-tool`)} empty="Not made yet"
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
