import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPERATIONS: Record<string, { input: string; output: string; extension: string; contentType: string }> = {
  "dwg-to-dxf": { input: "dwg", output: "dxf", extension: "dxf", contentType: "application/dxf" },
  "dwg-to-pdf": { input: "dwg", output: "pdf", extension: "pdf", contentType: "application/pdf" },
  "dwg-to-svg": { input: "dwg", output: "svg", extension: "svg", contentType: "image/svg+xml" },
  "dxf-to-svg": { input: "dxf", output: "svg", extension: "svg", contentType: "image/svg+xml" },
};

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const API_BASE = "https://api.cloudconvert.com/v2";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ detail: message }, { status });
}

async function cloudConvertRequest(path: string, init: RequestInit = {}) {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) throw new Error("CAD conversion is not configured yet. Add CLOUDCONVERT_API_KEY in the Hostinger environment variables.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Accept", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const operation = String(form.get("operation") || "");
    const config = OPERATIONS[operation];
    const file = form.get("file");

    if (!config) return errorResponse("Unsupported CAD conversion operation.");
    if (!(file instanceof File)) return errorResponse("Please upload a CAD file.");
    if (!file.size) return errorResponse("The uploaded CAD file is empty.");
    if (file.size > MAX_FILE_BYTES) return errorResponse("Please keep CAD files under 25 MB.");

    const filename = file.name || `drawing.${config.input}`;
    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith(`.${config.input}`)) {
      return errorResponse(`This tool expects a .${config.input} file.`);
    }

    const createResponse = await cloudConvertRequest("/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tasks: {
          "upload-my-file": { operation: "import/upload" },
          "convert-my-file": {
            operation: "convert",
            input: "upload-my-file",
            input_format: config.input,
            output_format: config.output,
            filename: `${filename.replace(/\.[^.]+$/, "")}.${config.extension}`,
          },
          "export-my-file": {
            operation: "export/url",
            input: "convert-my-file",
          },
        },
      }),
    });

    if (!createResponse.ok) {
      const body = await createResponse.text();
      console.error("CloudConvert job creation failed", createResponse.status, body);
      return errorResponse("The CAD conversion service could not start the job. Please try again later.", 502);
    }

    const created = await createResponse.json();
    const job = created?.data;
    const uploadTask = job?.tasks?.find((task: any) => task.operation === "import/upload");
    const uploadForm = uploadTask?.result?.form;

    if (!job?.id || !uploadTask?.id || !uploadForm?.url || !uploadForm?.parameters) {
      console.error("CloudConvert returned an unexpected upload response", created);
      return errorResponse("The CAD conversion service returned an unexpected response.", 502);
    }

    const uploadBody = new FormData();
    for (const [key, value] of Object.entries(uploadForm.parameters)) {
      uploadBody.append(key, String(value));
    }
    uploadBody.append("file", file, filename);

    const uploadResponse = await fetch(uploadForm.url, {
      method: "POST",
      body: uploadBody,
      cache: "no-store",
    });

    if (!uploadResponse.ok) {
      const body = await uploadResponse.text();
      console.error("CloudConvert upload failed", uploadResponse.status, body);
      return errorResponse("The CAD file could not be uploaded to the conversion service.", 502);
    }

    const deadline = Date.now() + 55_000;
    let latestJob = job;

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const statusResponse = await cloudConvertRequest(`/jobs/${job.id}`);
      if (!statusResponse.ok) continue;
      const statusPayload = await statusResponse.json();
      latestJob = statusPayload?.data ?? latestJob;

      if (latestJob.status === "error") {
        console.error("CloudConvert CAD job failed", latestJob);
        return errorResponse("The CAD conversion failed. The drawing may use features or objects that are not supported by the conversion engine.", 422);
      }

      if (latestJob.status === "finished") break;
    }

    if (latestJob.status !== "finished") {
      return errorResponse("The CAD conversion is taking longer than expected. Please try the conversion again.", 504);
    }

    const exportTask = latestJob.tasks?.find((task: any) => task.operation === "export/url");
    const outputFile = exportTask?.result?.files?.[0];
    if (!outputFile?.url) {
      console.error("CloudConvert finished without an output URL", latestJob);
      return errorResponse("The conversion finished without producing a downloadable file.", 502);
    }

    const outputResponse = await fetch(outputFile.url, { cache: "no-store" });
    if (!outputResponse.ok) {
      return errorResponse("The converted file could not be downloaded from the conversion service.", 502);
    }

    const outputBuffer = await outputResponse.arrayBuffer();
    const outputName = outputFile.filename || `${filename.replace(/\.[^.]+$/, "")}.${config.extension}`;

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": config.contentType,
        "Content-Disposition": `attachment; filename="${outputName.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CAD conversion error", error);
    const message = error instanceof Error ? error.message : "CAD conversion failed.";
    return errorResponse(message, message.includes("CLOUDCONVERT_API_KEY") ? 503 : 500);
  }
}
