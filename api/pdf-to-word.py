from __future__ import annotations

import io

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response
from pdf2docx import Converter

app = FastAPI(title="MYKSA CONNECT PDF to Word Engine")
MAX_FILE_BYTES = 4_000_000
DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@app.post("/")
async def pdf_to_word(file: UploadFile = File(...)) -> Response:
    filename = file.filename or "converted.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Please keep the PDF under 4 MB for now.")

    output = io.BytesIO()
    converter = None
    try:
        # pdf2docx reads the PDF's actual text, drawing and geometry information
        # and reconstructs paragraphs, tables, borders, merged cells and images
        # as native DOCX elements. This replaces the old line-by-line extraction
        # that destroyed the original table structure.
        converter = Converter(stream=data)
        converter.convert(
            output,
            multi_processing=False,
            parse_lattice_table=True,
            parse_stream_table=True,
            list_not_table=True,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"PDF layout conversion failed: {exc}",
        ) from exc
    finally:
        if converter is not None:
            converter.close()

    output.seek(0)
    stem = filename.rsplit(".", 1)[0] or "converted"
    safe_stem = "".join(ch if ch.isalnum() or ch in "-_.() " else "_" for ch in stem).strip() or "converted"
    download_name = f"{safe_stem}-pdf-to-word.docx"

    return Response(
        content=output.getvalue(),
        media_type=DOCX_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'},
    )
