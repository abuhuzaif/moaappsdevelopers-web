// Turns a photo/scan of a handwritten signature into a clean PNG:
// paper → transparent, ink → solid colour, empty margins cropped.
// Runs fully in the browser (canvas), nothing is uploaded.
//
//   const png = await cleanSignature(file);              // dark-blue ink
//   const png = await cleanSignature(file, { ink: "#000000" });
//   const png = await cleanSignature(file, { ink: "original" });

export interface CleanSignatureOptions {
  /** "#1a237e" (default, pen blue), any hex colour, or "original" to keep the photo's ink colour */
  ink?: string;
  /** largest side of the output in px (default 1200) */
  maxSize?: number;
  /** extra tolerance 0–40: higher keeps fainter strokes (default 12) */
  softness?: number;
}

function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof src === "string" ? src : URL.createObjectURL(src);
    img.onload = () => {
      if (typeof src !== "string") URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Could not read the signature image"));
    img.src = url;
  });
}

/** Otsu threshold on a 0–255 luminance histogram: best split between paper and ink. */
function otsu(hist: number[], total: number) {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, t = 128;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * hist[i];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) { best = between; t = i; }
  }
  return t;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export async function cleanSignature(src: Blob | string, opts: CleanSignatureOptions = {}): Promise<string> {
  const { ink = "#1a237e", maxSize = 1200, softness = 12 } = opts;
  const img = await loadImage(src);

  const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // luminance + histogram (ignore pixels that are already transparent)
  const lum = new Uint8ClampedArray(w * h);
  const hist = new Array(256).fill(0);
  let counted = 0;
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    const l = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    lum[p] = l;
    if (px[i + 3] > 10) { hist[lum[p]]++; counted++; }
  }

  // Paper is the bright majority. Uneven light (grey photo, shadow) is handled by Otsu;
  // the soft band above the threshold keeps anti-aliased stroke edges smooth.
  const t = otsu(hist, counted || 1);
  const hard = t - softness;          // darker than this → full ink
  const soft = t + softness;          // lighter than this → fully transparent
  const fixed = ink === "original" ? null : hexToRgb(ink);

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x, i = p * 4;
      const l = lum[p];
      let a = l <= hard ? 255 : l >= soft ? 0 : Math.round((255 * (soft - l)) / (soft - hard));
      a = Math.min(a, px[i + 3]);
      if (a < 8) { px[i + 3] = 0; continue; }
      if (fixed) { px[i] = fixed[0]; px[i + 1] = fixed[1]; px[i + 2] = fixed[2]; }
      px[i + 3] = a;
      if (a > 60) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(data, 0, 0);

  if (maxX < 0) throw new Error("No signature found in the image. Try a clearer photo on white paper.");

  // crop to the ink + small margin
  const pad = Math.round(Math.max(w, h) * 0.02);
  const cx = Math.max(0, minX - pad), cy = Math.max(0, minY - pad);
  const cw = Math.min(w, maxX + pad + 1) - cx, ch = Math.min(h, maxY + pad + 1) - cy;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d")!.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
  return out.toDataURL("image/png");
}
