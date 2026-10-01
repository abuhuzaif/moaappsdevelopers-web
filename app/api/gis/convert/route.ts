import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

type Pair = { code: number; value: string };
type Point = [number, number];
type Geometry =
  | { type: "point"; point: Point; name?: string }
  | { type: "line"; points: Point[] }
  | { type: "polygon"; points: Point[] }
  | { type: "circle"; center: Point; radius: number }
  | { type: "arc"; center: Point; radius: number; start: number; end: number };

type Unit = "m" | "ft" | "in";

function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function pairsFromDxf(text: string): Pair[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const pairs: Pair[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = Number(lines[i].trim());
    if (!Number.isFinite(code)) continue;
    pairs.push({ code, value: lines[i + 1].trim() });
  }
  return pairs;
}

function num(value: string | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function entityValues(entity: Pair[]) {
  const values = new Map<number, string[]>();
  for (const pair of entity) {
    const list = values.get(pair.code) ?? [];
    list.push(pair.value);
    values.set(pair.code, list);
  }
  return values;
}

function pointFrom(values: Map<number, string[]>, xCode: number, yCode: number, index = 0): Point | null {
  const x = num(values.get(xCode)?.[index]);
  const y = num(values.get(yCode)?.[index]);
  return x === undefined || y === undefined ? null : [x, y];
}

function parseEntities(pairs: Pair[]): Geometry[] {
  const geometries: Geometry[] = [];
  let inEntities = false;

  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].code !== 0) continue;
    const type = pairs[i].value.toUpperCase();
    if (type === "SECTION") {
      const next = pairs[i + 1];
      inEntities = next?.code === 2 && next.value.toUpperCase() === "ENTITIES";
      continue;
    }
    if (type === "ENDSEC") {
      inEntities = false;
      continue;
    }
    if (!inEntities) continue;

    const entity: Pair[] = [];
    let j = i + 1;
    while (j < pairs.length && pairs[j].code !== 0) {
      entity.push(pairs[j]);
      j++;
    }
    i = j - 1;
    const values = entityValues(entity);

    if (type === "POINT") {
      const point = pointFrom(values, 10, 20);
      if (point) geometries.push({ type: "point", point });
      continue;
    }

    if (type === "LINE") {
      const a = pointFrom(values, 10, 20);
      const b = pointFrom(values, 11, 21);
      if (a && b) geometries.push({ type: "line", points: [a, b] });
      continue;
    }

    if (type === "LWPOLYLINE") {
      const xs = values.get(10) ?? [];
      const ys = values.get(20) ?? [];
      const points: Point[] = [];
      for (let k = 0; k < Math.min(xs.length, ys.length); k++) {
        const x = num(xs[k]);
        const y = num(ys[k]);
        if (x !== undefined && y !== undefined) points.push([x, y]);
      }
      if (points.length >= 2) {
        const flags = Number(values.get(70)?.[0] ?? "0");
        if ((flags & 1) !== 0 && points.length > 2) points.push(points[0]);
        geometries.push({ type: (flags & 1) !== 0 ? "polygon" : "line", points });
      }
      continue;
    }

    if (type === "CIRCLE") {
      const center = pointFrom(values, 10, 20);
      const radius = num(values.get(40)?.[0]);
      if (center && radius !== undefined && radius > 0) geometries.push({ type: "circle", center, radius });
      continue;
    }

    if (type === "ARC") {
      const center = pointFrom(values, 10, 20);
      const radius = num(values.get(40)?.[0]);
      const start = num(values.get(50)?.[0]);
      const end = num(values.get(51)?.[0]);
      if (center && radius !== undefined && radius > 0 && start !== undefined && end !== undefined) {
        geometries.push({ type: "arc", center, radius, start, end });
      }
      continue;
    }

    if (type === "3DFACE") {
      const points: Point[] = [];
      for (const [xCode, yCode] of [[10, 20], [11, 21], [12, 22], [13, 23]] as const) {
        const point = pointFrom(values, xCode, yCode);
        if (point) points.push(point);
      }
      if (points.length >= 3) {
        if (points.length === 4 && points[3][0] === points[2][0] && points[3][1] === points[2][1]) points.pop();
        points.push(points[0]);
        geometries.push({ type: "polygon", points });
      }
    }
  }

  return geometries;
}

function sampleCircle(center: Point, radius: number, segments = 96): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]);
  }
  return points;
}

function sampleArc(center: Point, radius: number, start: number, end: number): Point[] {
  let finish = end;
  while (finish < start) finish += 360;
  const segments = Math.max(12, Math.min(96, Math.ceil((finish - start) / 5)));
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = ((start + ((finish - start) * i) / segments) * Math.PI) / 180;
    points.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]);
  }
  return points;
}

function kmlCoordinate(point: Point) {
  return `${point[0]},${point[1]},0`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function geometryToKml(geometry: Geometry, index: number) {
  if (geometry.type === "point") {
    return `<Placemark><name>Point ${index + 1}</name><Point><coordinates>${kmlCoordinate(geometry.point)}</coordinates></Point></Placemark>`;
  }

  let points: Point[];
  if (geometry.type === "circle") points = sampleCircle(geometry.center, geometry.radius);
  else if (geometry.type === "arc") points = sampleArc(geometry.center, geometry.radius, geometry.start, geometry.end);
  else points = geometry.points;

  if (geometry.type === "polygon") {
    return `<Placemark><name>Polygon ${index + 1}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${points.map(kmlCoordinate).join(" ")}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }

  return `<Placemark><name>${escapeXml(geometry.type === "circle" ? `Circle ${index + 1}` : geometry.type === "arc" ? `Arc ${index + 1}` : `Line ${index + 1}`)}</name><LineString><tessellate>1</tessellate><coordinates>${points.map(kmlCoordinate).join(" ")}</coordinates></LineString></Placemark>`;
}

function buildKml(geometries: Geometry[]) {
  const placemarks = geometries.map(geometryToKml).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>MYKSA CONNECT DXF conversion</name>\n${placemarks}\n</Document></kml>`;
}

function unitToMeters(unit: Unit) {
  if (unit === "ft") return 0.3048;
  if (unit === "in") return 0.0254;
  return 1;
}

function utmFromLatLon(lat: number, lon: number) {
  const a = 6378137;
  const eccSquared = 0.00669438;
  const k0 = 0.9996;
  const zone = Math.floor((lon + 180) / 6) + 1;
  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const lonOriginRad = (lonOrigin * Math.PI) / 180;
  const N = a / Math.sqrt(1 - eccSquared * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = (eccSquared / (1 - eccSquared)) * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lonRad - lonOriginRad);
  const M = a * ((1 - eccSquared / 4 - (3 * eccSquared ** 2) / 64 - (5 * eccSquared ** 3) / 256) * latRad - ((3 * eccSquared) / 8 + (3 * eccSquared ** 2) / 32 + (45 * eccSquared ** 3) / 1024) * Math.sin(2 * latRad) + ((15 * eccSquared ** 2) / 256 + (45 * eccSquared ** 3) / 1024) * Math.sin(4 * latRad) - ((35 * eccSquared ** 3) / 3072) * Math.sin(6 * latRad));
  const easting = k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T ** 2 + 72 * C - 58 * (eccSquared / (1 - eccSquared))) * A ** 5) / 120) + 500000;
  let northing = k0 * (M + N * Math.tan(latRad) * (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 + ((61 - 58 * T + T ** 2 + 600 * C - 330 * (eccSquared / (1 - eccSquared))) * A ** 6) / 720));
  if (lat < 0) northing += 10000000;
  return { zone, hemisphere: lat < 0 ? "S" : "N", easting, northing };
}

function latLonFromUtm(easting: number, northingInput: number, zone: number, hemisphere: string) {
  const a = 6378137;
  const eccSquared = 0.00669438;
  const k0 = 0.9996;
  const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  let northing = northingInput;
  const x = easting - 500000;
  if (hemisphere.toUpperCase() === "S") northing -= 10000000;
  const M = northing / k0;
  const mu = M / (a * (1 - eccSquared / 4 - (3 * eccSquared ** 2) / 64 - (5 * eccSquared ** 3) / 256));
  const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = (eccSquared / (1 - eccSquared)) * Math.cos(phi1) ** 2;
  const R1 = (a * (1 - eccSquared)) / (1 - eccSquared * Math.sin(phi1) ** 2) ** 1.5;
  const D = x / (N1 * k0);
  const lat = phi1 - (N1 * Math.tan(phi1)) / R1 * (D ** 2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (eccSquared / (1 - eccSquared))) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (eccSquared / (1 - eccSquared)) - 3 * C1 ** 2) * D ** 6 / 720);
  const lonOrigin = (zone - 1) * 6 - 180 + 3;
  const lon = lonOrigin + ((D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (eccSquared / (1 - eccSquared)) + 24 * T1 ** 2) * D ** 5 / 120) / Math.cos(phi1)) * (180 / Math.PI);
  return { latitude: (lat * 180) / Math.PI, longitude: lon };
}

function georeferenceGeometries(geometries: Geometry[], originLat: number, originLon: number, unit: Unit) {
  const origin = utmFromLatLon(originLat, originLon);
  const scale = unitToMeters(unit);
  const transformPoint = (point: Point): Point => {
    const geographic = latLonFromUtm(origin.easting + point[0] * scale, origin.northing + point[1] * scale, origin.zone, origin.hemisphere);
    return [geographic.longitude, geographic.latitude];
  };
  return geometries.map((geometry) => {
    if (geometry.type === "point") return { ...geometry, point: transformPoint(geometry.point) };
    if (geometry.type === "line" || geometry.type === "polygon") return { ...geometry, points: geometry.points.map(transformPoint) };
    if (geometry.type === "circle") {
      const center = transformPoint(geometry.center);
      const edge = transformPoint([geometry.center[0] + geometry.radius, geometry.center[1]]);
      const radiusMeters = Math.hypot(edge[0] - center[0], edge[1] - center[1]) * 111320;
      return { ...geometry, center, radius: radiusMeters };
    }
    return { ...geometry, center: transformPoint(geometry.center), radius: geometry.radius * scale };
  });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tool = String(form.get("tool") ?? "");
    const value = form.get("file");

    if (tool !== "dxf-to-kml") return error("Unsupported GIS conversion operation.");
    if (!(value instanceof File)) return error("Please upload a DXF file.");
    if (!value.name.toLowerCase().endsWith(".dxf")) return error("DXF → KML expects a .DXF file.");
    if (value.size === 0) return error("The uploaded DXF file is empty.");
    if (value.size > MAX_FILE_BYTES) return error("Please keep DXF files under 10 MB.", 413);

    const originLat = Number(form.get("originLat"));
    const originLon = Number(form.get("originLon"));
    const unitValue = String(form.get("unit") ?? "m");
    const unit: Unit = unitValue === "ft" || unitValue === "in" ? unitValue : "m";

    if (!Number.isFinite(originLat) || originLat < -80 || originLat > 84 || !Number.isFinite(originLon) || originLon < -180 || originLon > 180) {
      return error("Please enter a valid reference latitude (-80 to 84) and longitude (-180 to 180).", 422);
    }

    const buffer = Buffer.from(await value.arrayBuffer());
    const header = buffer.subarray(0, 22).toString("ascii");
    if (header.startsWith("AutoCAD Binary DXF")) {
      return error("Binary DXF is not supported yet. Please save/export the drawing as an ASCII DXF and try again.", 422);
    }

    const text = buffer.toString("utf8");
    const geometries = parseEntities(pairsFromDxf(text));
    if (!geometries.length) return error("No supported DXF geometry was found. Supported entities include POINT, LINE, LWPOLYLINE, CIRCLE, ARC and 3DFACE.", 422);

    const georeferenced = georeferenceGeometries(geometries, originLat, originLon, unit);
    const kml = buildKml(georeferenced);
    const stem = value.name.replace(/\.dxf$/i, "").replace(/[^A-Za-z0-9._-]+/g, "-") || "converted";

    return new Response(kml, {
      headers: {
        "Content-Type": "application/vnd.google-earth.kml+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${stem}.kml"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (cause) {
    console.error("DXF to KML conversion error", cause);
    return error("Could not process the DXF file. Please verify that it is a valid ASCII DXF.", 500);
  }
}