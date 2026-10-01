import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
type Point = [number, number];
type Geometry =
  | { type: "point"; point: Point; name?: string }
  | { type: "line"; points: Point[]; name?: string }
  | { type: "polygon"; points: Point[]; name?: string };
type Unit = "m" | "ft" | "in";

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
function safeBase(filename: string) {
  return filename.replace(/\.[^.\\/]+$/, "").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[-_.]+|[-_.]+$/g, "") || "converted";
}
function escXml(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function coords(s: string): Point[] {
  return s.trim().split(/\s+/).map(t => t.split(",")).filter(a => a.length >= 2).map(a => [Number(a[0]), Number(a[1])] as Point).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
}
function kmlCoordinates(points: Point[]) { return points.map(p => `${p[0]},${p[1]},0`).join(" "); }
function buildKml(gs: Geometry[], name: string) {
  const body = gs.map((g, i) => {
    const n = escXml(g.name || `${g.type[0].toUpperCase()}${g.type.slice(1)} ${i + 1}`);
    if (g.type === "point") return `<Placemark><name>${n}</name><Point><coordinates>${kmlCoordinates([g.point])}</coordinates></Point></Placemark>`;
    if (g.type === "line") return `<Placemark><name>${n}</name><LineString><tessellate>1</tessellate><coordinates>${kmlCoordinates(g.points)}</coordinates></LineString></Placemark>`;
    return `<Placemark><name>${n}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${kmlCoordinates(g.points)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${escXml(name)}</name>${body}</Document></kml>`;
}
function parseKml(text: string): Geometry[] {
  const out: Geometry[] = [];
  const placemarks = [...text.matchAll(/<Placemark\b[^>]*>([\s\S]*?)<\/Placemark>/gi)].map(m => m[1]);
  const blocks = placemarks.length ? placemarks : [text];
  for (const block of blocks) {
    const name = (block.match(/<name\b[^>]*>([\s\S]*?)<\/name>/i)?.[1] || "").replace(/<[^>]+>/g, "").trim();
    for (const m of block.matchAll(/<Point\b[\s\S]*?<coordinates\b[^>]*>([\s\S]*?)<\/coordinates>[\s\S]*?<\/Point>/gi)) { const p = coords(m[1])[0]; if (p) out.push({ type: "point", point: p, name }); }
    for (const m of block.matchAll(/<LineString\b[\s\S]*?<coordinates\b[^>]*>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LineString>/gi)) { const p = coords(m[1]); if (p.length >= 2) out.push({ type: "line", points: p, name }); }
    for (const m of block.matchAll(/<Polygon\b[\s\S]*?<outerBoundaryIs\b[\s\S]*?<LinearRing\b[\s\S]*?<coordinates\b[^>]*>([\s\S]*?)<\/coordinates>[\s\S]*?<\/LinearRing>[\s\S]*?<\/outerBoundaryIs>[\s\S]*?<\/Polygon>/gi)) {
      const p = coords(m[1]); if (p.length >= 3) { if (p[0][0] !== p.at(-1)![0] || p[0][1] !== p.at(-1)![1]) p.push(p[0]); out.push({ type: "polygon", points: p, name }); }
    }
  }
  return out;
}
function parseGeoJson(text: string): Geometry[] {
  const root = JSON.parse(text), out: Geometry[] = [];
  const add = (g: any, name = "") => {
    if (!g) return;
    if (g.type === "FeatureCollection") return (g.features || []).forEach((f: any) => add(f, f?.properties?.name || f?.properties?.Name || ""));
    if (g.type === "Feature") return add(g.geometry, name);
    if (g.type === "Point" && Array.isArray(g.coordinates)) out.push({ type: "point", point: [Number(g.coordinates[0]), Number(g.coordinates[1])], name });
    else if (g.type === "MultiPoint") (g.coordinates || []).forEach((p: any) => out.push({ type: "point", point: [Number(p[0]), Number(p[1])], name }));
    else if (g.type === "LineString") out.push({ type: "line", points: (g.coordinates || []).map((p: any) => [Number(p[0]), Number(p[1])] as Point).filter((p: Point) => Number.isFinite(p[0]) && Number.isFinite(p[1])), name });
    else if (g.type === "MultiLineString") (g.coordinates || []).forEach((p: any) => out.push({ type: "line", points: p.map((q: any) => [Number(q[0]), Number(q[1])] as Point), name }));
    else if (g.type === "Polygon") { const p = (g.coordinates?.[0] || []).map((q: any) => [Number(q[0]), Number(q[1])] as Point); if (p.length >= 3) out.push({ type: "polygon", points: p, name }); }
    else if (g.type === "MultiPolygon") (g.coordinates || []).forEach((poly: any) => { const p = (poly?.[0] || []).map((q: any) => [Number(q[0]), Number(q[1])] as Point); if (p.length >= 3) out.push({ type: "polygon", points: p, name }); });
  };
  add(root);
  return out.filter(g => g.type === "point" ? Number.isFinite(g.point[0]) && Number.isFinite(g.point[1]) : g.points.length >= 2);
}
function parseCsv(text: string): Geometry[] {
  const rows = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(r => r.trim()).map(line => {
    const cells: string[] = []; let cur = "", quoted = false;
    for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted; } else if (c === "," && !quoted) { cells.push(cur.trim()); cur = ""; } else cur += c; }
    cells.push(cur.trim()); return cells;
  });
  if (!rows.length) return [];
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const headers = rows[0].map(norm), lat = headers.findIndex(x => ["lat", "latitude", "y"].includes(x)), lon = headers.findIndex(x => ["lon", "lng", "longitude", "x"].includes(x));
  const start = lat >= 0 && lon >= 0 ? 1 : 0, li = lat >= 0 ? lat : 0, oi = lon >= 0 ? lon : 1, ni = headers.findIndex(x => x === "name");
  return rows.slice(start).map((r, i) => { const y = Number(r[li]), x = Number(r[oi]); return Number.isFinite(x) && Number.isFinite(y) ? { type: "point" as const, point: [x, y] as Point, name: ni >= 0 ? r[ni] : `Point ${i + 1}` } : null; }).filter(Boolean) as Geometry[];
}
function buildDxf(gs: Geometry[]) {
  const e: string[] = ["0", "SECTION", "2", "ENTITIES"];
  for (const g of gs) {
    if (g.type === "point") e.push("0", "POINT", "8", "0", "10", String(g.point[0]), "20", String(g.point[1]), "30", "0");
    else { e.push("0", "LWPOLYLINE", "8", "0", "90", String(g.points.length), "70", g.type === "polygon" ? "1" : "0"); for (const p of g.points) e.push("10", String(p[0]), "20", String(p[1])); }
  }
  e.push("0", "ENDSEC", "0", "EOF"); return e.join("\r\n") + "\r\n";
}
function bbox(points: Point[]) { const xs = points.map(p => p[0]), ys = points.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
function writeShpHeader(b: Buffer, type: number, bb: number[], length: number) { b.writeInt32BE(9994, 0); b.writeInt32BE(length / 2, 24); b.writeInt32LE(1000, 28); b.writeInt32LE(type, 32); for (let i = 0; i < 4; i++) b.writeDoubleLE(bb[i], 36 + i * 8); }
function buildDbf(names: string[]) {
  const headerLen = 65, recLen = 81, b = Buffer.alloc(headerLen + recLen * names.length + 1), d = new Date();
  b[0] = 3; b[1] = d.getFullYear() - 2000; b[2] = d.getMonth() + 1; b[3] = d.getDate(); b.writeUInt32LE(names.length, 4); b.writeUInt16LE(headerLen, 8); b.writeUInt16LE(recLen, 10);
  Buffer.from("NAME").copy(b, 32); b[43] = 67; b[48] = 80; b[64] = 13;
  names.forEach((n, i) => { const off = headerLen + i * recLen; b[off] = 32; Buffer.from(String(n).slice(0, 80), "utf8").copy(b, off + 1); }); b[b.length - 1] = 0x1a; return b;
}
function wgs84Prj() { return 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]'; }
function shpFiles(gs: Geometry[], base: string) {
  const groups = [
    { type: 1, key: "point", list: gs.filter(g => g.type === "point") as Extract<Geometry, { type: "point" }>[] },
    { type: 3, key: "line", list: gs.filter(g => g.type === "line") as Extract<Geometry, { type: "line" }>[] },
    { type: 5, key: "polygon", list: gs.filter(g => g.type === "polygon") as Extract<Geometry, { type: "polygon" }>[] },
  ];
  const files: { name: string; data: Buffer }[] = [];
  for (const group of groups) {
    if (!group.list.length) continue;
    const records: Buffer[] = [], allPoints = group.list.flatMap(g => g.type === "point" ? [g.point] : g.points), bb = bbox(allPoints);
    for (let i = 0; i < group.list.length; i++) {
      const g: any = group.list[i]; let content: Buffer;
      if (group.type === 1) { content = Buffer.alloc(20); content.writeInt32LE(1, 0); content.writeDoubleLE(g.point[0], 4); content.writeDoubleLE(g.point[1], 12); }
      else { const pts = g.points, contentLen = 44 + 4 + 16 * pts.length; content = Buffer.alloc(contentLen); content.writeInt32LE(group.type, 0); const b = bbox(pts); b.forEach((v, j) => content.writeDoubleLE(v, 4 + j * 8)); content.writeInt32LE(1, 36); content.writeInt32LE(pts.length, 40); content.writeInt32LE(0, 44); pts.forEach((p, j) => { content.writeDoubleLE(p[0], 48 + j * 16); content.writeDoubleLE(p[1], 56 + j * 16); }); }
      const h = Buffer.alloc(8); h.writeInt32BE(i + 1, 0); h.writeInt32BE(content.length / 2, 4); records.push(Buffer.concat([h, content]));
    }
    const shpLength = 100 + records.reduce((n, b) => n + b.length, 0), shp = Buffer.alloc(shpLength); writeShpHeader(shp, group.type, bb, shpLength); let off = 100; for (const r of records) { r.copy(shp, off); off += r.length; }
    const shxLength = 100 + records.length * 8, shx = Buffer.alloc(shxLength); writeShpHeader(shx, group.type, bb, shxLength); off = 50; let shpOff = 50; for (const r of records) { shx.writeInt32BE(shpOff, off); shx.writeInt32BE(r.length / 2, off + 4); off += 8; shpOff += r.length / 2; }
    const stem = group.list.length === gs.length ? base : `${base}_${group.key}`;
    files.push({ name: `${stem}.shp`, data: shp }, { name: `${stem}.shx`, data: shx }, { name: `${stem}.dbf`, data: buildDbf(group.list.map(g => g.name || "")) }, { name: `${stem}.prj`, data: Buffer.from(wgs84Prj()) });
  }
  return files;
}
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b: Buffer) { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function zipStore(files: { name: string; data: Buffer }[]) {
  const locals: Buffer[] = [], centrals: Buffer[] = []; let offset = 0;
  for (const f of files) {
    const n = Buffer.from(f.name), d = f.data, c = crc32(d), h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt32LE(c, 14); h.writeUInt32LE(d.length, 18); h.writeUInt32LE(d.length, 22); h.writeUInt16LE(n.length, 26); const local = Buffer.concat([h, n, d]); locals.push(local);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt32LE(c, 16); ch.writeUInt32LE(d.length, 20); ch.writeUInt32LE(d.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(offset, 42); centrals.push(Buffer.concat([ch, n])); offset += local.length;
  }
  const central = Buffer.concat(centrals), body = Buffer.concat(locals), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(centrals.length, 8); end.writeUInt16LE(centrals.length, 10); end.writeUInt32LE(central.length, 12); end.writeUInt32LE(body.length, 16); return Buffer.concat([body, central, end]);
}
function utmFromLatLon(lat: number, lon: number) { const a = 6378137, e = 0.00669438, k = 0.9996, z = Math.floor((lon + 180) / 6) + 1, o = (z - 1) * 6 - 180 + 3, lr = lat * Math.PI / 180, dr = lon * Math.PI / 180, or = o * Math.PI / 180, N = a / Math.sqrt(1 - e * Math.sin(lr) ** 2), T = Math.tan(lr) ** 2, C = e / (1 - e) * Math.cos(lr) ** 2, A = Math.cos(lr) * (dr - or), M = a * ((1 - e / 4 - 3 * e ** 2 / 64 - 5 * e ** 3 / 256) * lr - (3 * e / 8 + 3 * e ** 2 / 32 + 45 * e ** 3 / 1024) * Math.sin(2 * lr) + (15 * e ** 2 / 256 + 45 * e ** 3 / 1024) * Math.sin(4 * lr) - 35 * e ** 3 / 3072 * Math.sin(6 * lr)); let y = k * (M + N * Math.tan(lr) * (A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24 + (61 - 58 * T + T ** 2 + 600 * C - 330 * e / (1 - e)) * A ** 6 / 720)); if (lat < 0) y += 1e7; return { zone: z, hemisphere: lat < 0 ? "S" : "N", easting: k * N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T ** 2 + 72 * C - 58 * e / (1 - e)) * A ** 5 / 120) + 5e5, northing: y }; }
function latLonFromUtm(easting: number, northingInput: number, zone: number, hemisphere: string) { const a = 6378137, e = 0.00669438, k = 0.9996, e1 = (1 - Math.sqrt(1 - e)) / (1 + Math.sqrt(1 - e)); let y = northingInput; if (hemisphere === "S") y -= 1e7; const x = easting - 5e5, M = y / k, mu = M / (a * (1 - e / 4 - 3 * e ** 2 / 64 - 5 * e ** 3 / 256)), p = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + 151 * e1 ** 3 / 96 * Math.sin(6 * mu), N = a / Math.sqrt(1 - e * Math.sin(p) ** 2), T = Math.tan(p) ** 2, C = e / (1 - e) * Math.cos(p) ** 2, R = a * (1 - e) / (1 - e * Math.sin(p) ** 2) ** 1.5, D = x / (N * k), lat = p - N * Math.tan(p) / R * (D ** 2 / 2 - (5 + 3 * T + 10 * C - 4 * C ** 2 - 9 * e / (1 - e)) * D ** 4 / 24 + (61 + 90 * T + 298 * C + 45 * T ** 2 - 252 * e / (1 - e) - 3 * C ** 2) * D ** 6 / 720), o = (zone - 1) * 6 - 180 + 3, lon = o + (D - (1 + 2 * T + C) * D ** 3 / 6 + (5 - 2 * C + 28 * T - 3 * C ** 2 + 8 * e / (1 - e) + 24 * T ** 2) * D ** 5 / 120) / Math.cos(p) * 180 / Math.PI; return { latitude: lat * 180 / Math.PI, longitude: lon }; }
function unitMeters(u: Unit) { return u === "ft" ? 0.3048 : u === "in" ? 0.0254 : 1; }
function georef(gs: Geometry[], lat: number, lon: number, unit: Unit) { const o = utmFromLatLon(lat, lon), s = unitMeters(unit), tr = (p: Point): Point => { const g = latLonFromUtm(o.easting + p[0] * s, o.northing + p[1] * s, o.zone, o.hemisphere); return [g.longitude, g.latitude]; }; return gs.map(g => g.type === "point" ? { ...g, point: tr(g.point) } : { ...g, points: g.points.map(tr) }); }
function shpPoint(b: Buffer, o: number): Point { return [b.readDoubleLE(o), b.readDoubleLE(o + 8)]; }
function readShp(b: Buffer): Geometry[] { if (b.length < 100 || b.readInt32BE(0) !== 9994) throw new Error("The uploaded file is not a valid ESRI Shapefile."); const out: Geometry[] = []; let off = 100; while (off + 8 <= b.length) { const n = b.readInt32BE(off + 4) * 2, s = off + 8, end = s + n; if (end > b.length) break; const type = b.readInt32LE(s); try { if (type === 1) out.push({ type: "point", point: shpPoint(b, s + 4) }); else if (type === 3 || type === 5) { const pc = b.readInt32LE(s + 36), count = b.readInt32LE(s + 40), po = s + 44 + pc * 4; if (count >= 2 && po + count * 16 <= end) { const p: number[] = []; for (let i = 0; i < pc; i++) p.push(b.readInt32LE(s + 44 + i * 4)); for (let j = 0; j < pc; j++) { const from = p[j], to = j + 1 < pc ? p[j + 1] : count, pts: Point[] = []; for (let i = from; i < to; i++) pts.push(shpPoint(b, po + i * 16)); if (pts.length >= 2) out.push({ type: type === 5 ? "polygon" : "line", points: pts }); } } } } catch {} off = end; } return out; }

export async function POST(req: Request) {
  try {
    const form = await req.formData(), tool = String(form.get("tool") || ""), file = form.get("file");
    if (!(file instanceof File)) return fail("Please upload a file.");
    if (file.size === 0) return fail("The uploaded file is empty.");
    if (file.size > MAX_FILE_BYTES) return fail("Please keep GIS files under 25 MB.", 413);
    const name = file.name || "converted", base = safeBase(name), lower = name.toLowerCase(), data = Buffer.from(await file.arrayBuffer());
    let out: Buffer | string, filename = base;
    if (tool === "shp-to-kml" || tool === "shp-to-geojson") {
      if (!lower.endsWith(".shp")) return fail("Please upload the .shp file for this converter.");
      const gs = readShp(data); if (!gs.length) return fail("No supported geometry found in the Shapefile.", 422);
      if (tool === "shp-to-kml") { out = buildKml(gs, base); filename += ".kml"; }
      else { const features = gs.map(g => g.type === "point" ? { type: "Feature", properties: { name: g.name || "" }, geometry: { type: "Point", coordinates: g.point } } : { type: "Feature", properties: { name: g.name || "" }, geometry: { type: g.type === "polygon" ? "Polygon" : "LineString", coordinates: g.type === "polygon" ? [g.points] : g.points } }); out = JSON.stringify({ type: "FeatureCollection", features }, null, 2); filename += ".geojson"; }
    } else if (tool === "kml-to-shp") {
      if (!lower.endsWith(".kml")) return fail("KML → SHP expects a .kml file."); const gs = parseKml(data.toString("utf8")); if (!gs.length) return fail("No supported Point, LineString or Polygon geometry was found in the KML.", 422); out = zipStore(shpFiles(gs, base)); filename += ".zip";
    } else if (tool === "kml-to-csv") {
      if (!lower.endsWith(".kml")) return fail("KML → CSV expects a .kml file."); const gs = parseKml(data.toString("utf8")); if (!gs.length) return fail("No supported geometry was found in the KML.", 422); const rows = ["name,type,longitude,latitude"]; for (const g of gs) { const p = g.type === "point" ? g.point : g.points[0]; rows.push([g.name || "", g.type, p[0], p[1]].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")); } out = rows.join("\r\n") + "\r\n"; filename += ".csv";
    } else if (tool === "geojson-to-kml") {
      if (!/\.geojson$|\.json$/.test(lower)) return fail("GeoJSON → KML expects a .geojson or .json file."); let gs: Geometry[]; try { gs = parseGeoJson(data.toString("utf8")); } catch { return fail("The uploaded file is not valid GeoJSON.", 422); } if (!gs.length) return fail("No supported geometry was found in the GeoJSON.", 422); out = buildKml(gs, base); filename += ".kml";
    } else if (tool === "csv-to-kml") {
      if (!lower.endsWith(".csv")) return fail("CSV → KML expects a .csv file."); const gs = parseCsv(data.toString("utf8")); if (!gs.length) return fail("Could not find valid latitude/longitude rows in the CSV.", 422); out = buildKml(gs, base); filename += ".kml";
    } else if (tool === "kml-to-dxf") {
      if (!lower.endsWith(".kml")) return fail("KML → DXF expects a .kml file."); const gs = parseKml(data.toString("utf8")); if (!gs.length) return fail("No supported geometry was found in the KML.", 422); out = buildDxf(gs); filename += ".dxf";
    } else if (tool === "dxf-to-kml") {
      if (!lower.endsWith(".dxf")) return fail("DXF → KML expects a .dxf file."); const lines = data.toString("utf8").replace(/^\uFEFF/, "").split(/\r?\n/), gs: Geometry[] = []; let entities = false;
      for (let i = 0; i + 1 < lines.length; i += 2) { const code = Number(lines[i].trim()), v = lines[i + 1]?.trim(); if (code === 0 && v === "SECTION") { entities = Number(lines[i + 2]?.trim()) === 2 && lines[i + 3]?.trim() === "ENTITIES"; } else if (code === 0 && v === "ENDSEC") entities = false; else if (entities && code === 0 && v === "POINT") { const x = Number(lines[i + 2]?.trim()), y = Number(lines[i + 4]?.trim()); if (Number.isFinite(x) && Number.isFinite(y)) gs.push({ type: "point", point: [x, y] }); } else if (entities && code === 0 && v === "LINE") { const x1 = Number(lines[i + 2]?.trim()), y1 = Number(lines[i + 4]?.trim()), x2 = Number(lines[i + 6]?.trim()), y2 = Number(lines[i + 8]?.trim()); if ([x1, y1, x2, y2].every(Number.isFinite)) gs.push({ type: "line", points: [[x1, y1], [x2, y2]] }); } else if (entities && code === 0 && v === "LWPOLYLINE") { const pts: Point[] = []; let j = i + 2; while (j + 1 < lines.length && Number(lines[j].trim()) !== 0) { const c = Number(lines[j].trim()); if (c === 10) { const x = Number(lines[j + 1].trim()), y = Number(lines[j + 3]?.trim()); if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]); } j += 2; } if (pts.length >= 2) gs.push({ type: "line", points: pts }); } }
      if (!gs.length) return fail("No supported DXF geometry found. Supported entities: POINT, LINE and LWPOLYLINE.", 422);
      const la = Number(form.get("originLat") ?? 24.7136), lo = Number(form.get("originLon") ?? 46.6753), unit = String(form.get("unit") ?? "in") as Unit; if (!Number.isFinite(la) || !Number.isFinite(lo)) return fail("Invalid reference coordinates."); out = buildKml(georef(gs, la, lo, unit), base); filename += ".kml";
    } else return fail("Unsupported GIS conversion operation.");
    const body = typeof out === "string" ? Buffer.from(out, "utf8") : out;
    const mime = filename.endsWith(".zip") ? "application/zip" : filename.endsWith(".kml") ? "application/vnd.google-earth.kml+xml" : filename.endsWith(".csv") ? "text/csv;charset=utf-8" : filename.endsWith(".geojson") ? "application/geo+json" : "application/dxf";
    return new NextResponse(body, { headers: { "Content-Type": mime, "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" } });
  } catch (e) { return fail(e instanceof Error ? e.message : "GIS conversion failed.", 500); }
}
