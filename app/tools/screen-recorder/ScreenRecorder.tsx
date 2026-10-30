"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/*
 * Browser-only screen recorder. Nothing is uploaded: the video is built in
 * the user's browser (MediaRecorder) and downloaded from there.
 *
 * Webcam: shown as a floating Picture-in-Picture window, so it appears in a
 * full-screen recording naturally. (Drawing it onto a canvas would freeze
 * whenever the user switches tabs, because browsers pause background timers.)
 */

type Phase = "idle" | "countdown" | "recording" | "paused" | "done";
type Quality = "720p" | "1080p";

const QUALITY: Record<Quality, { width: number; height: number; bitrate: number }> = {
  "720p": { width: 1280, height: 720, bitrate: 2_500_000 },
  "1080p": { width: 1920, height: 1080, bitrate: 5_000_000 },
};

function pickFormat(): { mime: string; ext: "mp4" | "webm" } {
  const candidates: { mime: string; ext: "mp4" | "webm" }[] = [
    { mime: "video/mp4;codecs=avc1.42E01E,mp4a.40.2", ext: "mp4" },
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];
  if (typeof MediaRecorder === "undefined") return { mime: "", ext: "webm" };
  for (const c of candidates) if (MediaRecorder.isTypeSupported(c.mime)) return c;
  return { mime: "", ext: "webm" };
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function fileStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
}

export default function ScreenRecorder() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [useMic, setUseMic] = useState(true);
  const [useSystemAudio, setUseSystemAudio] = useState(true);
  const [useWebcam, setUseWebcam] = useState(false);
  const [quality, setQuality] = useState<Quality>("1080p");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; size: number; ext: string; name: string } | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const camVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const segmentStartRef = useRef(0);
  const accumulatedRef = useRef(0);
  const formatRef = useRef(pickFormat());
  const originalTitleRef = useRef("");

  // Desktop Chrome / Edge / Firefox only. Phones can't capture the screen from a browser.
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const hasApi = !!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== "undefined";
    setSupported(hasApi && !isMobile);
    formatRef.current = pickFormat();
    originalTitleRef.current = document.title;
    return () => {
      stopEverything();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before closing the tab mid-recording.
  useEffect(() => {
    if (phase !== "recording" && phase !== "paused") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // Release the previous video from memory when a new one replaces it.
  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  // Webcam preview: start/stop the camera when the toggle changes.
  useEffect(() => {
    if (!useWebcam) {
      stopCamera();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          cam.getTracks().forEach((t) => t.stop());
          return;
        }
        camStreamRef.current = cam;
        if (camVideoRef.current) {
          camVideoRef.current.srcObject = cam;
          await camVideoRef.current.play().catch(() => {});
        }
      } catch {
        setUseWebcam(false);
        setNotice("Camera permission was not given, so the webcam is off.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useWebcam]);

  function stopCamera() {
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    if (camVideoRef.current) camVideoRef.current.srcObject = null;
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
  }

  function startTimer() {
    segmentStartRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const ms = accumulatedRef.current + (Date.now() - segmentStartRef.current);
      setElapsed(ms);
      document.title = `● REC ${formatTime(ms)}`;
    }, 250);
  }

  function pauseTimer() {
    accumulatedRef.current += Date.now() - segmentStartRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  /** Stops capture streams, audio mixing, timers and the PiP window. Keeps the camera preview. */
  function stopEverything() {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    streamsRef.current = [];
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    if (originalTitleRef.current) document.title = originalTitleRef.current;
  }

  async function start() {
    setError(null);
    setNotice(null);
    if (result) setResult(null);

    // 1) Pop out the webcam first, while we still have the user's click
    //    (browsers only allow Picture-in-Picture right after a click).
    if (useWebcam && camVideoRef.current && camStreamRef.current && document.pictureInPictureEnabled) {
      try {
        await camVideoRef.current.requestPictureInPicture();
      } catch {
        setNotice("Couldn't pop out the webcam. Recording without it.");
      }
    }

    // 2) Ask which screen / window / tab to record.
    let display: MediaStream;
    try {
      const q = QUALITY[quality];
      const options: any = {
        video: { width: { ideal: q.width }, height: { ideal: q.height }, frameRate: { ideal: 30 } },
        audio: useSystemAudio ? { echoCancellation: false, noiseSuppression: false, autoGainControl: false } : false,
        systemAudio: useSystemAudio ? "include" : "exclude",
        selfBrowserSurface: "exclude",
        surfaceSwitching: "include",
      };
      display = await navigator.mediaDevices.getDisplayMedia(options);
    } catch {
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
      setError("Screen sharing was cancelled. Click Start recording to try again.");
      return;
    }
    streamsRef.current.push(display);

    // 3) Microphone (optional; recording continues without it if refused).
    let mic: MediaStream | null = null;
    if (useMic) {
      try {
        mic = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        streamsRef.current.push(mic);
      } catch {
        setNotice("Microphone permission was not given, so your voice won't be recorded.");
      }
    }

    if (useSystemAudio && display.getAudioTracks().length === 0) {
      setNotice(
        (n) =>
          (n ? n + " " : "") +
          "Computer sound isn't included. To record it, choose a Chrome tab or Entire screen and tick “Share audio”."
      );
    }

    // 4) Combine screen video with one mixed audio track
    //    (MediaRecorder only records the first audio track it gets).
    const tracks: MediaStreamTrack[] = [...display.getVideoTracks()];
    const audioSources = [display, mic].filter((s): s is MediaStream => !!s && s.getAudioTracks().length > 0);
    if (audioSources.length === 1) {
      tracks.push(audioSources[0].getAudioTracks()[0]);
    } else if (audioSources.length > 1) {
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      audioSources.forEach((s) => ctx.createMediaStreamSource(s).connect(dest));
      audioCtxRef.current = ctx;
      tracks.push(dest.stream.getAudioTracks()[0]);
    }
    const combined = new MediaStream(tracks);

    // Browser's own "Stop sharing" bar ends the recording too.
    display.getVideoTracks()[0].addEventListener("ended", () => stop());

    // 5) 3-2-1 countdown, then record.
    setPhase("countdown");
    let n = 3;
    setCountdown(n);
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        beginRecording(combined);
      } else {
        setCountdown(n);
        countdownRef.current = setTimeout(tick, 1000);
      }
    };
    countdownRef.current = setTimeout(tick, 1000);
  }

  function beginRecording(stream: MediaStream) {
    const { mime, ext } = formatRef.current;
    const bitrate = QUALITY[quality].bitrate;
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: bitrate } : { videoBitsPerSecond: bitrate });
    } catch {
      stopEverything();
      setPhase("idle");
      setError("Your browser couldn't start the recording. Please try the latest Chrome or Edge.");
      return;
    }
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const type = rec.mimeType || mime || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      const finalExt = type.includes("mp4") ? "mp4" : ext;
      setResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        ext: finalExt,
        name: `screen-recording_${fileStamp()}.${finalExt}`,
      });
      stopEverything();
      setPhase("done");
      track("screen_recorder_done", {
        seconds: Math.round(accumulatedRef.current / 1000),
        format: finalExt,
        mic: useMic,
        webcam: useWebcam,
      });
    };
    recorderRef.current = rec;
    accumulatedRef.current = 0;
    setElapsed(0);
    rec.start(1000); // save a chunk every second, so a crash loses very little
    startTimer();
    setPhase("recording");
    track("screen_recorder_start", { quality, mic: useMic, system_audio: useSystemAudio, webcam: useWebcam });
  }

  function pause() {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      rec.pause();
      pauseTimer();
      setPhase("paused");
    }
  }

  function resume() {
    const rec = recorderRef.current;
    if (rec && rec.state === "paused") {
      rec.resume();
      startTimer();
      setPhase("recording");
    }
  }

  function stop() {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      if (rec.state === "recording") pauseTimer();
      rec.stop(); // onstop builds the file
    } else {
      // Stopped during the countdown.
      stopEverything();
      setPhase("idle");
    }
  }

  function recordAgain() {
    setResult(null);
    setElapsed(0);
    setPhase("idle");
  }

  return (
    <div className="mk-page">
      <div style={{ background: "var(--mk-navy, #06172a)", paddingBottom: 2 }}>
        <div style={{ width: "min(1500px, 90vw)", margin: "0 auto", padding: "16px 0" }}>
          <nav className="mk-nav">
            <a href="/ksa-connect" className="mk-logo" aria-label="MYKSA CONNECT home">
              <span className="mk-logo-mark">✦</span>
              <span className="mk-logo-text">
                <strong>MYKSA</strong> <b>CONNECT</b>
                <small>BUY. SELL. CONNECT.</small>
              </span>
            </a>
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "30px 20px 4px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(26px, 3.4vw, 38px)", margin: "0 0 8px", fontWeight: 850, letterSpacing: "-0.8px", color: "var(--mk-navy, #06172a)" }}>
          Free Screen Recorder
        </h1>
        <p style={{ margin: "0 auto", maxWidth: 560, color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.5 }}>
          Record your screen, voice and webcam right in your browser. No install, no signup, no watermark. Your video never
          leaves your computer.
        </p>
      </div>

      <main style={{ maxWidth: 820, margin: "24px auto 60px", padding: "0 20px" }}>
        <div style={card}>
          {supported === null && <p style={{ margin: 0, color: "var(--text-muted)" }}>Loading…</p>}

          {supported === false && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 40 }} aria-hidden>
                💻
              </div>
              <h2 style={{ ...h2, marginTop: 8 }}>Please open this on a laptop or desktop</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14.5, margin: 0 }}>
                Phones and tablets don&apos;t allow screen recording from a website. Use Chrome or Edge on a computer.
              </p>
            </div>
          )}

          {supported && phase === "idle" && (
            <>
              <h2 style={h2}>What should we record?</h2>

              <ToggleRow
                icon="🎙️"
                title="Microphone"
                hint="Record your voice while you talk."
                checked={useMic}
                onChange={setUseMic}
              />
              <ToggleRow
                icon="🔊"
                title="Computer sound"
                hint="Videos, calls and app sounds. Works best in Chrome or Edge on Windows."
                checked={useSystemAudio}
                onChange={setUseSystemAudio}
              />
              <ToggleRow
                icon="📷"
                title="Webcam bubble"
                hint="Shows your face in a small floating window that appears in the recording."
                checked={useWebcam}
                onChange={setUseWebcam}
              />

            </>
          )}

          {/* One webcam <video> that is never unmounted: removing it would close the
              Picture-in-Picture window mid-recording. In setup it is the round preview;
              after that it is tucked away off-screen. */}
          <div
            style={
              supported && phase === "idle" && useWebcam
                ? { display: "flex", justifyContent: "center", margin: "14px 0 4px" }
                : { position: "fixed", left: -9999, top: 0, width: 2, height: 2, overflow: "hidden", opacity: 0, pointerEvents: "none" }
            }
          >
            <video ref={camVideoRef} muted playsInline style={camPreview} />
          </div>

          {supported && phase === "idle" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--mk-navy, #06172a)" }}>Quality</span>
                {(Object.keys(QUALITY) as Quality[]).map((q) => (
                  <button key={q} type="button" onClick={() => setQuality(q)} style={chip(quality === q)} aria-pressed={quality === q}>
                    {q === "1080p" ? "Full HD 1080p" : "HD 720p (smaller file)"}
                  </button>
                ))}
              </div>

              <button type="button" className="mk-btn mk-btn-gold" onClick={start} style={bigBtn}>
                <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", background: "#d61f1f", marginRight: 10 }} />
                Start recording
              </button>
              <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--text-muted)", margin: "10px 0 0" }}>
                Your browser will ask which screen, window or tab to share.
              </p>
            </>
          )}


          {phase === "countdown" && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 84, fontWeight: 900, color: "var(--mk-navy, #06172a)", lineHeight: 1 }}>{countdown}</div>
              <p style={{ color: "var(--text-muted)", marginTop: 12 }}>Get ready…</p>
              <button type="button" onClick={stop} style={secondaryBtn}>
                Cancel
              </button>
            </div>
          )}

          {(phase === "recording" || phase === "paused") && (
            <div style={{ textAlign: "center", padding: "18px 0" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 800, color: phase === "recording" ? "#b91c1c" : "var(--text-muted)" }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: phase === "recording" ? "#d61f1f" : "#9aa3a1",
                    animation: phase === "recording" ? "mkRecPulse 1.2s ease-in-out infinite" : "none",
                  }}
                />
                {phase === "recording" ? "Recording" : "Paused"}
              </div>
              <div style={{ fontSize: 56, fontWeight: 850, fontVariantNumeric: "tabular-nums", color: "var(--mk-navy, #06172a)", margin: "6px 0 18px" }}>
                {formatTime(elapsed)}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {phase === "recording" ? (
                  <button type="button" onClick={pause} style={secondaryBtn}>
                    ⏸ Pause
                  </button>
                ) : (
                  <button type="button" onClick={resume} style={secondaryBtn}>
                    ▶ Resume
                  </button>
                )}
                <button type="button" onClick={stop} style={stopBtn}>
                  ■ Stop and save
                </button>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 14 }}>
                You can switch to any other window. Come back here, or use the browser&apos;s “Stop sharing” bar, to finish.
              </p>
            </div>
          )}

          {phase === "done" && result && (
            <div>
              <h2 style={h2}>Your recording is ready</h2>
              <video src={result.url} controls playsInline style={{ width: "100%", borderRadius: 14, background: "#000", maxHeight: 460 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "10px 0 0" }}>
                {formatTime(accumulatedRef.current)} · {(result.size / (1024 * 1024)).toFixed(1)} MB · {result.ext.toUpperCase()}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <a
                  href={result.url}
                  download={result.name}
                  className="mk-btn mk-btn-gold"
                  style={{ flex: 1, justifyContent: "center", padding: "14px 0", fontSize: 15, textAlign: "center" }}
                  onClick={() => track("screen_recorder_download", { format: result.ext })}
                >
                  ⬇ Download video
                </a>
                <button type="button" onClick={recordAgain} style={secondaryBtn}>
                  Record again
                </button>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 12 }}>
                Download before closing this page. The video only exists in this browser tab.
              </p>
            </div>
          )}

          {notice && <p style={noticeBox}>{notice}</p>}
          {error && (
            <p role="alert" style={{ color: "#b91c1c", fontSize: 13.5, fontWeight: 600, marginTop: 14 }}>
              {error}
            </p>
          )}
        </div>

        {/* ── How it works + FAQ (also helps Google understand the page) ── */}
        <section style={{ marginTop: 36 }}>
          <h2 style={{ ...h2, textAlign: "center" }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              ["1", "Choose", "Pick microphone, computer sound and webcam, then press Start."],
              ["2", "Record", "Select your screen, a window or a browser tab. Pause any time."],
              ["3", "Download", "Press Stop and download your video. No upload, no waiting."],
            ].map(([n, t, d]) => (
              <div key={n} style={{ ...card, padding: "18px 18px" }}>
                <div style={{ fontWeight: 900, color: "var(--mk-green, #005744)", fontSize: 13 }}>STEP {n}</div>
                <div style={{ fontWeight: 800, color: "var(--mk-navy, #06172a)", fontSize: 16, marginTop: 4 }}>{t}</div>
                <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 36 }}>
          <h2 style={{ ...h2, textAlign: "center" }}>Questions</h2>
          {[
            ["Is it really free?", "Yes. No signup, no watermark and no time limit."],
            ["Is my video uploaded anywhere?", "No. The video is made inside your browser and saved straight to your computer. We never see it."],
            ["Why doesn't it work on my phone?", "Android and iPhone browsers don't allow websites to record the screen. Please use a laptop or desktop."],
            ["Why is there no computer sound in my video?", "When the browser asks what to share, choose a Chrome tab or Entire screen and tick “Share audio”. Mac computers don't allow computer sound from the browser."],
            ["How long can I record?", "As long as you like. Very long recordings use more of your computer's memory, so for 1 hour+ we suggest 720p."],
          ].map(([q, a]) => (
            <details key={q} style={faqItem}>
              <summary style={{ fontWeight: 800, color: "var(--mk-navy, #06172a)", cursor: "pointer", fontSize: 15 }}>{q}</summary>
              <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 14, lineHeight: 1.55 }}>{a}</p>
            </details>
          ))}
        </section>
      </main>

      <style>{`@keyframes mkRecPulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }`}</style>
    </div>
  );
}

function ToggleRow(props: { icon: string; title: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  const { icon, title, hint, checked, onChange } = props;
  return (
    <label style={toggleRow}>
      <span style={{ fontSize: 24, width: 34, textAlign: "center" }} aria-hidden>
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 800, color: "var(--mk-navy, #06172a)", fontSize: 15 }}>{title}</span>
        <span style={{ display: "block", fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{hint}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />
      <span
        aria-hidden
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          background: checked ? "var(--mk-green, #005744)" : "#d8d4c9",
          position: "relative",
          transition: "background .2s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .2s",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          }}
        />
      </span>
    </label>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 16px 38px rgba(6,23,42,.1)",
  border: "1px solid #e6e4dc",
  padding: "28px 24px",
};

const h2: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 850,
  color: "var(--mk-navy, #06172a)",
  margin: "0 0 14px",
  letterSpacing: "-0.3px",
};

const toggleRow: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 14px",
  border: "1px solid #ece9e0",
  borderRadius: 14,
  marginBottom: 10,
  cursor: "pointer",
  background: "#fcfbf8",
};

const camPreview: React.CSSProperties = {
  width: 160,
  height: 160,
  objectFit: "cover",
  borderRadius: "50%",
  border: "3px solid var(--mk-gold, #f6b91f)",
  background: "#111",
  transform: "scaleX(-1)",
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

const bigBtn: React.CSSProperties = {
  width: "100%",
  justifyContent: "center",
  marginTop: 22,
  padding: "16px 0",
  fontSize: 16,
};

const secondaryBtn: React.CSSProperties = {
  padding: "13px 22px",
  borderRadius: 999,
  border: "1px solid #e4e1d8",
  background: "#fff",
  color: "var(--mk-navy, #06172a)",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};

const stopBtn: React.CSSProperties = {
  ...secondaryBtn,
  background: "#b91c1c",
  border: "1px solid #b91c1c",
  color: "#fff",
};

const noticeBox: React.CSSProperties = {
  margin: "14px 0 0",
  padding: "10px 14px",
  background: "#fff8df",
  border: "1px solid #f3e2a6",
  borderRadius: 12,
  fontSize: 13,
  color: "#6b5200",
};

const faqItem: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e6e4dc",
  borderRadius: 14,
  padding: "14px 18px",
  marginBottom: 10,
};
