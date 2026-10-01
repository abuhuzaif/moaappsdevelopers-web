import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
type Point = [number, number];
type Geometry = { type: "point"; point: Point } | { type: "line" | "polygon"; points: Point[] };
type Pair = { code: number; value: string };
type Unit = "m" | "ft" | "in";

function error(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
function xml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;"); }
function kmlCoord(p: Point) { return `${p[0]},${p[1]},0`; }
function buildKml(geometries: Geometry[], name: string) {
  const placemarks = geometries.map((g, i) => {
    if (g.type === "point") return `<Placemark><name>Point ${i + 1}</name><Point><coordinates>${kmlCoord(g.point)}</coordinates></Point></Placemark>`;
    const coords = g.points.map(kmlCoord).join(" ");
    return g.type === "polygon"
      ? `<Placemark><name>Polygon ${i + 1}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`
      : `<Placemark><name>Line ${i + 1}</name><LineString><tessellate>1</tessellate><coordinates>${coords}</coordinates></LineString></Placemark>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>${xml(name)}</name>${placemarks}</Document></kml>`;
}

function shpPoint(buffer: Buffer, offset: number): Point { return [buffer.readDoubleLE(offset), buffer.readDoubleLE(offset + 8)]; }
function readShp(buffer: Buffer): Geometry[] {
  if (buffer.length < 100 || buffer.readInt32BE(0) !== 9994) throw new Error("The uploaded file is not a valid ESRI Shapefile (.SHP).");
  if (buffer.readInt32LE(28) !== 1000) throw new Error("Unsupported Shapefile version. Please use an ESRI Shapefile version 1000.");
  const geometries: Geometry[] = [];
  let offset = 100;
  while (offset + 8 <= buffer.length) {
    const contentBytes = buffer.readInt32BE(offset + 4) * 2, start = offset + 8, end = start + contentBytes;
    if (end > buffer.length || contentBytes < 4) break;
    const shape = buffer.readInt32LE(start);
    try {
      if (shape === 1 || shape === 11 || shape === 21) {
        if (start + 20 <= end) geometries.push({ type: "point", point: shpPoint(buffer, start + 4) });
      } else if (shape === 3 || shape === 5 || shape === 13 || shape === 15 || shape === 23 || shape === 25) {
        if (start + 44 <= end) {
          const partsCount = buffer.readInt32LE(start + 36), pointCount = buffer.readInt32LE(start + 40), partsOffset = start + 44, pointsOffset = partsOffset + partsCount * 4;
          if (partsCount > 0 && partsCount <= 100000 && pointCount >= 2 && pointCount <= 5000000 && pointsOffset + pointCount * 16 <= end) {
            const parts: number[] = []; for (let i = 0; i < partsCount; i++) parts.push(buffer.readInt32LE(partsOffset + i * 4));
            for (let part = 0; part < partsCount; part++) {
              const from = parts[part], to = part + 1 < partsCount ? parts[part + 1] : pointCount, points: Point[] = [];
              for (let i = from; i < to; i++) points.push(shpPoint(buffer, pointsOffset + i * 16));
              if (points.length < 2) continue;
              const polygon = shape === 5 || shape === 15 || shape === 25;
              if (polygon && points.length >= 3) { if (points[0][0] !== points.at(-1)![0] || points[0][1] !== points.at(-1)![1]) points.push(points[0]); geometries.push({ type: "polygon", points }); }
              else geometries.push({ type: "line", points });
            }
          }
        }
      } else if (shape === 8 || shape === 18 || shape === 28) {
        if (start + 40 <= end) { const count = buffer.readInt32LE(start + 36), pointsOffset = start + 40; if (count > 0 && count <= 5000000 && pointsOffset + count * 16 <= end) for (let i = 0; i < count; i++) geometries.push({ type: "point", point: shpPoint(buffer, pointsOffset + i * 16) }); }
      }
    } catch { /* skip malformed record */ }
    offset = end;
  }
  return geometries;
}

function pairsFromDxf(text: string): Pair[] { const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/), pairs: Pair[] = []; for (let i = 0; i + 1 < lines.length; i += 2) { const code = Number(lines[i].trim()); if (Number.isFinite(code)) pairs.push({ code, value: lines[i + 1].trim() }); } return pairs; }
function num(v: string | undefined) { const n = Number(v); return Number.isFinite(n) ? n : undefined; }
function entityValues(entity: Pair[]) { const m = new Map<number, string[]>(); for (const p of entity) m.set(p.code, [...(m.get(p.code) ?? []), p.value]); return m; }
function pointFrom(m: Map<number, string[]>, xCode: number, yCode: number, index = 0): Point | null { const x = num(m.get(xCode)?.[index]), y = num(m.get(yCode)?.[index]); return x === undefined || y === undefined ? null : [x, y]; }
function parseDxf(pairs: Pair[]): Geometry[] {
  const out: Geometry[] = []; let entities = false;
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].code !== 0) continue; const type = pairs[i].value.toUpperCase();
    if (type === "SECTION") { entities = pairs[i + 1]?.code === 2 && pairs[i + 1].value.toUpperCase() === "ENTITIES"; continue; }
    if (type === "ENDSEC") { entities = false; continue; } if (!entities) continue;
    const e: Pair[] = []; let j = i + 1; while (j < pairs.length && pairs[j].code !== 0) { e.push(pairs[j]); j++; } i = j - 1; const m = entityValues(e);
    if (type === "POINT") { const p = pointFrom(m, 10, 20); if (p) out.push({ type: "point", point: p }); }
    else if (type === "LINE") { const a = pointFrom(m, 10, 20), b = pointFrom(m, 11, 21); if (a && b) out.push({ type: "line", points: [a, b] }); }
    else if (type === "LWPOLYLINE") { const xs = m.get(10) ?? [], ys = m.get(20) ?? [], pts: Point[] = []; for (let k = 0; k < Math.min(xs.length, ys.length); k++) { const x = num(xs[k]), y = num(ys[k]); if (x !== undefined && y !== undefined) pts.push([x, y]); } if (pts.length >= 2) { const closed = (Number(m.get(70)?.[0] ?? "0") & 1) !== 0; if (closed && pts.length > 2) pts.push(pts[0]); out.push({ type: closed ? "polygon" : "line", points: pts }); } }
  }
  return out;
}
function unitToMeters(unit: Unit) { return unit === "ft" ? 0.3048 : unit === "in" ? 0.0254 : 1; }
function utmFromLatLon(lat: number, lon: number) {
  const a = 6378137, e = 0.00669438, k = 0.9996, zone = Math.floor((lon + 180) / 6) + 1, lon0 = (zone - 1) * 6 - 180 + 3, lr = lat * Math.PI / 180, dr = lon * Math.PI / 180, or = lon0 * Math.PI / 180, N = a / Math.sqrt(1 - e * Math.sin(lr) ** 2), T = Math.tan(lr) ** 2, C = e / (1 - e) * Math.cos(lr) ** 2, A = Math.cos(lr) * (dr - or);
  const M = a * ((1 - e / 4 - 3 * e ** 2 / 64 - 5 * e ** 3 / 256) * lr - (3 * e / 8 + 3 * e ** 2 / 32 + 45 * e ** 3 / 1024) * Math.sin(2 * lr) + (15 * e ** 2 / 256 + 45 * e ** 3 / 1024) * Math.sin(4 * lr) - 35 * e ** 3 / 3072 * Math.sin(6 * lr));
  let y = k * (M + N * Math.tan(lr) * (A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24 + (61 - 58 * T + T ** 2 + 600 * C - 330 * e / (1 - e)) * A ** 6 / 720)); if (lat < 0) y += 10000000;
  return { zone, hemisphere: lat < 0 ? "S" : "N", easting: k * N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T ** 2 + 72 * C - 58 * e / (1 - e)) * A ** 5 / 120) + 500000, northing: y };
}
function latLonFromUtm(easting: number, northingInput: number, zone: number, hemisphere: string) {
  const a = 6378137, e = 0.00669438, k = 0.9996, e1 = (1 - Math.sqrt(1 - e)) / (1 + Math.sqrt(1 - e)); let y = northingInput; if (hemisphere === "S") y -= 10000000;
  const x = easting - 500000, M = y / k, mu = M / (a * (1 - e / 4 - 3 * e ** 2 / 64 - 5 * e ** 3 / 256)), p = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + 151 * e1 ** 3 / 96 * Math.sin(6 * mu), N = a / Math.sqrt(1 - e * Math.sin(p) ** 2), T = Math.tan(p) ** 2, C = e / (1 - e) * Math.cos(p) ** 2, R = a * (1 - e) / (1 - e * Math.sin(p) ** 2) ** 1.5, D = x / (N * k);
  const lat = p - N * Math.tan(p) / R * (D ** 2 / 2 - (5 + 3 * T + 10 * C - 4 * C ** 2 - 9 * e / (1 - e)) * D ** 4 / 24 + (61 + 90 * T + 298 * C + 45 * T ** 2 - 252 * e / (1 - e) - 3 * C ** 2) * D ** 6 / 720), lon0 = (zone - 1) * 6 - 180 + 3, lon = lon0 + (D - (1 + 2 * T + C) * D ** 3 / 6 + (5 - 2 * C + 28 * T - 3 * C ** 2 + 8 * e / (1 - e) + 24 * T ** 2) * D ** 5 / 120) / Math.cos(p) * 180 / Math.PI;
  return { latitude: lat * 180 / Math.PI, longitude: lon };
}
function georef(geometries: Geometry[], originLat: number, originLon: number, unit: Unit) { const o = utmFromLatLon(originLat, originLon), scale = unitToMeters(unit), tr = (p: Point): Point => { const g = latLonFromUtm(o.easting + p[0] * scale, o.northing + p[1] * scale, o.zone, o.hemisphere); return [g.longitude, g.latitude]; }; return geometries.map(g => g.type === "point" ? { type: "point" as const, point: tr(g.point) } : { type: g.type, points: g.points.map(tr) }); }

export async function POST(request: Request) {
  try {
    const form = await request.formData(), tool = String(form.get("tool") ?? ""), value = form.get("file");
    if (!(value instanceof File)) return error("Please upload a file."); if (value.size === 0) return error("The uploaded file is empty."); if (value.size > MAX_FILE_BYTES) return error("Please keep GIS files under 10 MB.", 413);
    const buffer = Buffer.from(await value.arrayBuffer()), filename = value.name.toLowerCase();
    if (tool === "shp-to-kml" || tool === "shp-to-geojson") {
      if (!filename.endsWith(".shp")) return error("SHP conversion currently expects the .SHP file itself. Please select the .shp file.");
      let geometries: Geometry[]; try { geometries = readShp(buffer); } catch (e) { return error(e instanceof Error ? e.message : "Could not read the Shapefile.", 422); }
      if (!geometries.length) return error("No supported geometry was found in this Shapefile. Supported types include Point, PolyLine, Polygon and MultiPoint.", 422);
      if (tool === "shp-to-kml") { const content = buildKml(geometries, "MYKSA CONNECT SHP conversion"); return new NextResponse(content, { headers: { "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8", "Content-Disposition": 'attachment; filename="converted.kml"', "Cache-Control": "no-store" } }); }
      const features = geometries.map(g => g.type === "point" ? { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: g.point } } : { type: "Feature", properties: {}, geometry: { type: g.type === "polygon" ? "Polygon" : "LineString", coordinates: g.type === "polygon" ? [g.points] : g.points } });
      return new NextResponse(JSON.stringify({ type: "FeatureCollection", features }), { headers: { "Content-Type": "application/geo+json; charset=utf-8", "Content-Disposition": 'attachment; filename="converted.geojson"', "Cache-Control": "no-store" } });
    }
    if (tool !== "dxf-to-kml") return error("Unsupported GIS conversion operation.");
    if (!filename.endsWith(".dxf")) return error("DXF → KML expects a .DXF file.");
    const originLat = Number(form.get("originLat")), originLon = Number(form.get("originLon")), unitValue = String(form.get("unit") ?? "m"), unit: Unit = unitValue === "ft" || unitValue === "in" ? unitValue : "m";
    if (!Number.isFinite(originLat) || originLat < -80 || originLat > 84 || !Number.isFinite(originLon) || originLon < -180 || originLon > 180) return error("Please enter a valid reference latitude and longitude.", 422);
    if (buffer.subarray(0, 22).toString("ascii").startsWith("AutoCAD Binary DXF")) return error("Binary DXF is not supported yet. Please save/export as ASCII DXF and try again.", 422);
    const geometries = parseDxf(pairsFromDxf(buffer.toString("utf8"))); if (!geometries.length) return error("No supported DXF geometry was found. Supported entities include POINT, LINE and LWPOLYLINE.", 422);
    const content = buildKml(georef(geometries, originLat, originLon, unit), "MYKSA CONNECT DXF conversion");
    return new NextResponse(content, { headers: { "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8", "Content-Disposition": 'attachment; filename="converted.kml"', "Cache-Control": "no-store" } });
  } catch (e) { console.error("GIS conversion error", e); return error(e instanceof Error ? e.message : "GIS conversion failed.", 500); }
}
