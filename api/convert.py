from __future__ import annotations

import csv
import io
import re
from pathlib import Path
from typing import Annotated
from xml.sax.saxutils import escape

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from docx import Document
from docx.shared import Inches, Pt
from pypdf import PdfReader
from pptx import Presentation
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
import pdfplumber

app = FastAPI(title="MYKSA CONNECT Converter Engine")
MAX_FILE_BYTES = 4_000_000
ALLOWED = {
    "word-to-pdf": {".docx"},
    "pdf-to-word": {".pdf"},
    "pdf-to-csv": {".pdf"},
    "ppt-to-pdf": {".pptx"},
    "pdf-to-ppt": {".pdf"},
}


def safe_name(name: str | None, fallback: str) -> str:
    stem = Path(name or fallback).stem
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-._")
    return stem or fallback


def check_upload(operation: str, upload: UploadFile, data: bytes) -> None:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in ALLOWED[operation]:
        raise HTTPException(400, f"{operation} expects: {', '.join(sorted(ALLOWED[operation]))}")
    if not data:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(413, "Please keep files under 4 MB in this first server-side version.")


def make_pdf_from_docx(data: bytes) -> bytes:
    doc = Document(io.BytesIO(data))
    out = io.BytesIO()
    pdf = SimpleDocTemplate(out, pagesize=A4, rightMargin=42, leftMargin=42, topMargin=42, bottomMargin=42)
    styles = getSampleStyleSheet()
    story = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            story.append(Spacer(1, 7))
            continue
        style = styles["Title"] if p.style and p.style.name.lower().startswith("title") else styles["BodyText"]
        story.append(Paragraph(escape(text), style))
        story.append(Spacer(1, 5))
    for table in doc.tables:
        rows = [[cell.text.strip() for cell in row.cells] for row in table.rows]
        if rows:
            t = Table(rows, repeatRows=1)
            t.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef7f3")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
            ]))
            story.extend([Spacer(1, 8), t, Spacer(1, 8)])
    if not story:
        story.append(Paragraph("No readable text was found in this Word document.", styles["BodyText"]))
    pdf.build(story)
    return out.getvalue()


def make_docx_from_pdf(data: bytes) -> bytes:
    reader = PdfReader(io.BytesIO(data))
    doc = Document()
    doc.add_heading("Converted PDF", level=1)
    for page_no, page in enumerate(reader.pages, start=1):
        doc.add_heading(f"Page {page_no}", level=2)
        for line in (page.extract_text() or "").replace("\r", "").split("\n"):
            if line.strip():
                doc.add_paragraph(line.strip())
    out = io.BytesIO()
    doc.save(out)
    return out.getvalue()


def make_csv_from_pdf(data: bytes) -> bytes:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    found_table = False
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            for table in page.extract_tables() or []:
                found_table = True
                for row in table:
                    writer.writerow([cell or "" for cell in row])
                writer.writerow([])
        if not found_table:
            writer.writerow(["page", "text"])
            for page_no, page in enumerate(pdf.pages, start=1):
                for line in (page.extract_text() or "").splitlines():
                    if line.strip():
                        writer.writerow([page_no, line.strip()])
    return output.getvalue().encode("utf-8-sig")


def make_pdf_from_pptx(data: bytes) -> bytes:
    prs = Presentation(io.BytesIO(data))
    out = io.BytesIO()
    pdf = SimpleDocTemplate(out, pagesize=landscape(A4), rightMargin=28, leftMargin=28, topMargin=28, bottomMargin=28)
    styles = getSampleStyleSheet()
    story = []
    for index, slide in enumerate(prs.slides, start=1):
        story.append(Paragraph(f"Slide {index}", styles["Heading1"]))
        for shape in slide.shapes:
            if not hasattr(shape, "text"):
                continue
            text = (shape.text or "").strip()
            if text:
                story.append(Paragraph(escape(text), styles["BodyText"]))
                story.append(Spacer(1, 7))
        if index < len(prs.slides):
            story.append(Spacer(1, 18))
    if not story:
        story.append(Paragraph("No readable slide text was found.", styles["BodyText"]))
    pdf.build(story)
    return out.getvalue()


def make_pptx_from_pdf(data: bytes) -> bytes:
    reader = PdfReader(io.BytesIO(data))
    prs = Presentation()
    blank = prs.slide_layouts[6]
    for page_no, page in enumerate(reader.pages, start=1):
        slide = prs.slides.add_slide(blank)
        title = slide.shapes.add_textbox(Inches(0.6), Inches(0.35), Inches(12.1), Inches(0.45))
        title.text_frame.paragraphs[0].text = f"Page {page_no}"
        body = slide.shapes.add_textbox(Inches(0.6), Inches(0.95), Inches(12.1), Inches(6.0))
        body.text_frame.word_wrap = True
        body.text_frame.paragraphs[0].text = page.extract_text() or ""
        for paragraph in body.text_frame.paragraphs:
            paragraph.font.size = Pt(15)
    out = io.BytesIO()
    prs.save(out)
    return out.getvalue()


@app.get("/api/convert")
def converter_health():
    return {"ok": True, "service": "myksa-converter-engine", "operations": sorted(ALLOWED), "max_file_bytes": MAX_FILE_BYTES}


@app.post("/api/convert")
async def convert(operation: Annotated[str, Form(...)], file: Annotated[UploadFile, File(...)]):
    if operation not in ALLOWED:
        raise HTTPException(400, "Unsupported conversion operation.")
    data = await file.read()
    check_upload(operation, file, data)
    base = safe_name(file.filename, "converted")
    try:
        if operation == "word-to-pdf":
            payload, media, ext = make_pdf_from_docx(data), "application/pdf", "pdf"
        elif operation == "pdf-to-word":
            payload, media, ext = make_docx_from_pdf(data), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"
        elif operation == "pdf-to-csv":
            payload, media, ext = make_csv_from_pdf(data), "text/csv; charset=utf-8", "csv"
        elif operation == "ppt-to-pdf":
            payload, media, ext = make_pdf_from_pptx(data), "application/pdf", "pdf"
        elif operation == "pdf-to-ppt":
            payload, media, ext = make_pptx_from_pdf(data), "application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"
        else:
            raise HTTPException(400, "Unsupported conversion operation.")
        return Response(payload, media_type=media, headers={"Content-Disposition": f'attachment; filename="{base}.{ext}"'})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"Conversion failed: {type(exc).__name__}") from exc
