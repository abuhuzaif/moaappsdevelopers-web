from __future__ import annotations

import base64
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response

app = FastAPI(title="MYKSA CONNECT CAD Converter")

# CloudConvert import/base64 is intended for files up to 10 MB.
# Keep a little headroom for the encoded request payload.
MAX_FILE_BYTES = 9_000_000

OPERATIONS = {
    "dwg-to-dxf": ("dwg", "dxf", "application/dxf"),
    "dwg-to-pdf": ("dwg", "pdf", "application/pdf"),
    "dwg-to-svg": ("dwg", "svg", "image/svg+xml"),
    "dxf-to-svg": ("dxf", "svg", "image/svg+xml"),
}


def cloudconvert_job(payload: dict) -> dict:
    token = os.getenv("CLOUDCONVERT_API_TOKEN")
    if not token:
        raise HTTPException(500, "CAD conversion service is not configured yet.")

    request = urllib.request.Request(
        "https://sync.api.cloudconvert.com/v2/jobs",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(detail)
            detail = parsed.get("message") or parsed.get("error") or detail
        except Exception:
            pass
        raise HTTPException(exc.code, f"CloudConvert error: {detail[:500]}") from exc
    except urllib.error.URLError as exc:
        raise HTTPException(502, f"Could not reach the CAD conversion service: {exc.reason}") from exc


def download_output(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "MYKSA-CONNECT-CAD-Converter/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.read()
    except urllib.error.URLError as exc:
        raise HTTPException(502, f"Could not download the converted CAD file: {exc.reason}") from exc


def safe_filename(filename: str | None, extension: str) -> str:
    stem = Path(filename or "drawing").stem
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-._") or "drawing"
    return f"{stem}.{extension}"


@app.post("/", response_class=Response)
async def convert_cad(file: UploadFile = File(...), operation: str = ""):
    if operation not in OPERATIONS:
        raise HTTPException(400, "Unsupported CAD conversion operation.")

    input_ext, output_ext, media_type = OPERATIONS[operation]
    filename = file.filename or "drawing"
    if Path(filename).suffix.lower() != f".{input_ext}":
        raise HTTPException(400, f"{operation} expects a .{input_ext.upper()} file.")

    data = await file.read()
    if not data:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(413, "For this CAD tool, please keep the file under 9 MB for now.")

    payload = {
        "tasks": {
            "import-cad": {
                "operation": "import/base64",
                "file": base64.b64encode(data).decode("ascii"),
                "filename": filename,
            },
            "convert-cad": {
                "operation": "convert",
                "input": "import-cad",
                "input_format": input_ext,
                "output_format": output_ext,
                "filename": safe_filename(filename, output_ext),
            },
            "export-cad": {
                "operation": "export/url",
                "input": "convert-cad",
            },
        }
    }

    result = cloudconvert_job(payload)
    job = result.get("data", {})
    if job.get("status") != "finished":
        message = "CAD conversion did not finish successfully."
        for task in job.get("tasks", []):
            if task.get("status") == "error":
                message = task.get("message") or task.get("code") or message
        raise HTTPException(502, message)

    output_url = None
    output_filename = safe_filename(filename, output_ext)
    for task in job.get("tasks", []):
        if task.get("name") == "export-cad":
            files = (task.get("result") or {}).get("files") or []
            if files:
                output_url = files[0].get("url")
                output_filename = files[0].get("filename") or output_filename
            break

    if not output_url:
        raise HTTPException(502, "CAD conversion finished but no output file was returned.")

    output = download_output(output_url)
    return Response(
        content=output,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{output_filename}"',
            "Cache-Control": "no-store",
        },
    )
