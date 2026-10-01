from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response

app = FastAPI(title="MYKSA CONNECT CAD Converter")

# CloudConvert's import/base64 endpoint is intended for files up to 10 MB.
# Keep a little headroom for the base64 request payload.
MAX_FILE_BYTES = 9_000_000

OPERATIONS = {
    "dwg-to-dxf": ("dwg", "dxf", "application/dxf"),
    "dwg-to-pdf": ("dwg", "pdf", "application/pdf"),
    "dwg-to-svg": ("dwg", "svg", "image/svg+xml"),
    "dxf-to-svg": ("dxf", "svg", "image/svg+xml"),
}


def _cloudconvert_request(path: str, method: str, payload: dict | None = None) -> dict:
    token = os.getenv("CLOUDCONVERT_API_TOKEN")
    if not token:
        raise HTTPException(500, "CAD conversion service is not configured yet.")

    body = None
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        f"https://sync.api.cloudconvert.com/v2/{path}",
        data=body,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            raw = response.read()
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

    try:
        return json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise HTTPException(502, "The CAD conversion service returned an invalid response.") from exc


def _download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "MYKSA-CONNECT-CAD-Converter/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.read()
    except urllib.error.URLError as exc:
        raise HTTPException(502, f"Could not download the converted CAD file: {exc.reason}") from exc


def _safe_filename(filename: str | None, output_ext: str) -> str:
    stem = Path(filename or "drawing").stem
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-._") or "drawing"
    return f"{stem}.{output_ext}"


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
        raise HTTPException(413, "For this CAD tool, please keep the file under 9 MB.")

    import_task = {
        "operation": "import/base64",
        "file": __import__("base64").b64encode(data).decode("ascii"),
        "filename": filename,
    }

    payload = {
        "tasks": {
            "import-cad": import_task,
            "convert-cad": {
                "operation": "convert",
                "input": "import-cad",
                "input_format": input_ext,
                "output_format": output_ext,
                "filename": _safe_filename(filename, output_ext),
            },
            "export-cad": {
                "operation": "export/url",
                "input": "convert-cad",
            },
        }
    }

    result = _cloudconvert_request("jobs", "POST", payload)
    job = result.get("data", {})
    if job.get("status") != "finished":
        error_message = "CAD conversion did not finish successfully."
        for task in job.get("tasks", []):
            if task.get("status") == "error":
                error_message = task.get("message") or task.get("code") or error_message
        raise HTTPException(502, error_message)

    output_url = None
    output_filename = _safe_filename(filename, output_ext)
    for task in job.get("tasks", []):
        if task.get("name") == "export-cad":
            files = (task.get("result") or {}).get("files") or []
            if files:
                output_url = files[0].get("url")
                output_filename = files[0].get("filename") or output_filename
            break

    if not output_url:
        raise HTTPException(502, "CAD conversion finished but no output file was returned.")

    output = _download(output_url)
    headers = {
        "Content-Disposition": f'attachment; filename="{output_filename}"',
        "Cache-Control": "no-store",
    }
    return Response(content=output, media_type=media_type, headers=headers)
