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

function coordinateValid(point: Point) {
  return point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90;
}

function kmlCoordinate(point: Point) {
  return `${point[0]},${point[1]},0`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
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
  return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>MYKSA CONNECT DXF conversion</name><Style id="cadLine"><LineStyle><width>2</width></LineStyle></Style>\n${placemarks}\n</Document></kml>`;
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

    const buffer = Buffer.from(await value.arrayBuffer());
    const header = buffer.subarray(0, 22).toString("ascii");
    if (header.startsWith("AutoCAD Binary DXF")) {
      return error("Binary DXF is not supported yet. Please save/export the drawing as an ASCII DXF and try again.", 422);
    }

    const text = buffer.toString("utf8");
    const pairs = pairsFromDxf(text);
    const geometries = parseEntities(pairs);
    if (!geometries.length) return error("No supported DXF geometry was found. Supported entities include POINT, LINE, LWPOLYLINE, CIRCLE, ARC and 3DFACE.", 422);

    const allPoints: Point[] = [];
    for (const geometry of geometries) {
      if (geometry.type === "point") allPoints.push(geometry.point);
      else if (geometry.type === "circle") allPoints.push(geometry.center);
      else if (geometry.type === "arc") allPoints.push(geometry.center);
      else allPoints.push(...geometry.points);
    }

    if (!allPoints.every(coordinateValid)) {
      return error("This DXF contains CAD/project coordinates outside the valid longitude/latitude range. DXF → KML currently requires WGS84-style coordinates where X = longitude (-180..180) and Y = latitude (-90..90). A projected CAD drawing needs georeferencing before it can be exported to KML.", 422);
    }

    const kml = buildKml(geometries);
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
