import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

export const runtime = "nodejs";

const ALLOWED: Record<string, { ext: string; format: string; outExt: string }> = {
  "shp-to-kml": { ext: ".zip", format: "KML", outExt: ".kml" },
  "kml-to-shp": { ext: ".kml", format: "ESRI Shapefile", outExt: ".zip" },
  "shp-to-geojson": { ext: ".zip", format: "GeoJSON", outExt: ".geojson" },
  "geojson-to-kml": { ext: ".geojson", format: "KML", outExt: ".kml" },
  "csv-to-kml": { ext: ".csv", format: "KML", outExt: ".kml" },
  "kml-to-csv": { ext: ".kml", format: "CSV", outExt: ".csv" },
  "dxf-to-kml": { ext: ".dxf", format: "KML", outExt: ".kml" },
  "kml-to-dxf": { ext: ".kml", format: "DXF", outExt: ".dxf" },
};

function run(cmd: string, args: string[], cwd: string) {
  return new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, shell: false });
    let stdout = "", stderr = "";
    p.stdout.on("data", d => stdout += d.toString());
    p.stderr.on("data", d => stderr += d.toString());
    p.on("error", reject);
    p.on("close", code => resolve({ stdout, stderr, code }));
  });
}

export async function POST(req: Request) {
  const form = await req.formData();
  const tool = String(form.get("tool") || "");
  const file = form.get("file");
  const cfg = ALLOWED[tool];

  if (!cfg) return NextResponse.json({ error: "Unsupported GIS conversion." }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Please upload a file." }, { status: 400 });
  if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: "Maximum file size is 100 MB." }, { status: 413 });

  const work = path.join(os.tmpdir(), "myksa-gis-" + crypto.randomUUID());
  await fs.mkdir(work, { recursive: true });

  try {
    const inputName = path.basename(file.name);
    const inputPath = path.join(work, inputName);
    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    // For Shapefile input, a ZIP package is expected. Unzip with the platform's
    // unzip utility. If unavailable, the endpoint returns a clear server error.
    let source = inputPath;
    if (tool.startsWith("shp-to-") && inputName.toLowerCase().endsWith(".zip")) {
      const unzip = await run("unzip", ["-o", inputPath, "-d", path.join(work, "src")], work);
      if (unzip.code !== 0) throw new Error("Could not unzip the Shapefile package. Install the server's unzip utility.");
      const files = await fs.readdir(path.join(work, "src"), { recursive: true });
      const shp = files.find((x: string) => x.toLowerCase().endsWith(".shp"));
      if (!shp) throw new Error("ZIP does not contain an .shp file.");
      source = path.join(work, "src", shp);
    }

    const output = path.join(work, "output" + cfg.outExt);
    let args: string[] = ["-f", cfg.format, output, source];

    // CSV commonly needs geometry column handling; GDAL will inspect the CSV.
    if (tool === "csv-to-kml") args = ["-f", "KML", output, "-oo", "AUTODETECT_TYPE=YES", source];

    const result = await run("ogr2ogr", args, work);
    if (result.code !== 0) {
      throw new Error((result.stderr || result.stdout || "GDAL conversion failed.").slice(-3000));
    }

    if (cfg.outExt === ".zip") {
      const outDir = output;
      // GDAL creates the shapefile datasource directory. Use zip if available.
      const zipResult = await run("zip", ["-r", output, path.basename(outDir)], work);
      if (zipResult.code !== 0) throw new Error("Shapefile was created, but the server could not package it as ZIP. Install the zip utility.");
    }

    const data = await fs.readFile(output);
    const headers = new Headers({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${tool}-converted${cfg.outExt}"`,
      "Cache-Control": "no-store",
    });
    return new NextResponse(data, { headers });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "GIS conversion failed.";
    if (/spawn (ogr2ogr|unzip|zip) ENOENT/i.test(msg)) {
      return NextResponse.json({
        error: "The GIS conversion server is not installed yet. Install GDAL/OGR (ogr2ogr) on the server, plus unzip/zip utilities for Shapefile packages, then restart Next.js."
      }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    await fs.rm(work, { recursive: true, force: true }).catch(() => {});
  }
}
