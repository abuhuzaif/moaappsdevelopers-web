"use client";

// Admin: daily "new ads" videos (made by the makeDailyAdsVideo Cloud Function at 20:00 Riyadh).
// Download the MP4, copy the caption, schedule it in Metricool for 20:30.

import { useEffect, useState, type CSSProperties } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { isAdmin } from "@/lib/admin";

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
