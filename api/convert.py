from __future__ import annotations

import csv
import io
import re
import zipfile
from html import escape as html_escape
from pathlib import Path
from typing import Annotated
from xml.sax.saxutils import escape

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from docx import Document
from docx.shared import Inches, Pt
from openpyxl import Workbook
from pypdf import PdfReader, PdfWriter
from pptx import Presentation
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
import pdfplumber

app = FastAPI(title="MYKSA CONNECT Converter Engine")
MAX_FILE_BYTES = 4_000_000
ALLOWED = {
    "word-to-pdf": {".docx"},
    "pdf-to-word": {".pdf"},
    "pdf-to-csv": {".pdf"},
    "pdf-to-excel": {".pdf"},
    "pdf-to-text": {".pdf"},
    "pdf-ocr": {".pdf"},
    "pdf-to-html": {".pdf"},
    "pdf-to-markdown": {".pdf"},
    "ppt-to-pdf": {".pptx"},
    "pdf-to-ppt": {".pdf"},
    "add-pdf-page-numbers": {".pdf"},
    "watermark-pdf": {".pdf"},
    "protect-pdf": {".pdf"},
    "unlock-pdf": {".pdf"},
    "remove-pdf-pages": {".pdf"},
    "reorder-pdf-pages": {".pdf"},
    "extract-images-from-pdf": {".pdf"},
    "sign-pdf": {".pdf"},
    "compare-pdf": {".pdf"},
    "repair-pdf": {".pdf"},
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
        raise HTTPException(413, "Please keep files under 4 MB in this server-side version.")


def pdf_reader(data: bytes, password: str | None = None) -> PdfReader:
    reader = PdfReader(io.BytesIO(data))
    if reader.is_encrypted:
        if not password:
            raise HTTPException(400, "This PDF is password protected. Please provide the password.")
        if reader.decrypt(password) == 0:
            raise HTTPException(401, "Incorrect PDF password.")
    return reader


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


def extract_pdf_text(data: bytes, password: str | None = None) -> str:
    reader = pdf_reader(data, password)
    chunks: list[str] = []
    for page_no, page in enumerate(reader.pages, start=1):
        chunks.append(f"Page {page_no}")
        chunks.append(page.extract_text() or "")
        chunks.append("")
    return "\n".join(chunks).strip() + "\n"


def make_docx_from_pdf(data: bytes) -> bytes:
    reader = pdf_reader(data)
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


def make_excel_from_pdf(data: bytes) -> bytes:
    output = io.BytesIO()
    wb = Workbook()
    wb.remove(wb.active)
    table_count = 0
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables() or []
            for table_no, table in enumerate(tables, start=1):
                table_count += 1
                ws = wb.create_sheet(title=f"P{page_no}-T{table_no}"[:31])
                for row in table:
                    ws.append([cell or "" for cell in row])
                for column in ws.columns:
                    width = min(max(len(str(cell.value or "")) for cell in column) + 2, 50)
                    ws.column_dimensions[column[0].column_letter].width = width
        if table_count == 0:
            ws = wb.create_sheet(title="Extracted Text")
            ws.append(["Page", "Text"])
            for page_no, page in enumerate(pdf.pages, start=1):
                for line in (page.extract_text() or "").splitlines():
                    if line.strip():
                        ws.append([page_no, line.strip()])
    wb.save(output)
    return output.getvalue()


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
    reader = pdf_reader(data)
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


def make_pdf_text(data: bytes) -> bytes:
    return extract_pdf_text(data).encode("utf-8")


def make_html_from_pdf(data: bytes) -> bytes:
    reader = pdf_reader(data)
    parts = ["<!doctype html><html><head><meta charset=\"utf-8\"><title>PDF Text</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;line-height:1.6}pre{white-space:pre-wrap}h2{border-bottom:1px solid #ddd;padding-bottom:6px}</style></head><body>"]
    for page_no, page in enumerate(reader.pages, start=1):
        parts.append(f"<h2>Page {page_no}</h2><pre>{html_escape(page.extract_text() or '')}</pre>")
    parts.append("</body></html>")
    return "".join(parts).encode("utf-8")


def make_markdown_from_pdf(data: bytes) -> bytes:
    reader = pdf_reader(data)
    parts = ["# PDF Text\n"]
    for page_no, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or "No text extracted."
        parts.append(f"## Page {page_no}\n\n{text}\n")
    return "\n".join(parts).encode("utf-8")


def parse_pages(spec: str, total: int) -> list[int]:
    pages: list[int] = []
    for token in re.split(r"[,\s]+", spec.strip()):
        if not token:
            continue
        if "-" in token:
            start_s, end_s = token.split("-", 1)
            start, end = int(start_s), int(end_s)
            if start > end:
                raise HTTPException(400, "Invalid page range.")
            pages.extend(range(start, end + 1))
        else:
            pages.append(int(token))
    if not pages or any(page < 1 or page > total for page in pages):
        raise HTTPException(400, f"Pages must be between 1 and {total}.")
    return pages


def overlay_pdf(data: bytes, mode: str, value: str = "") -> bytes:
    reader = pdf_reader(data)
    writer = PdfWriter()
    for index, page in enumerate(reader.pages, start=1):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        overlay = io.BytesIO()
        c = canvas.Canvas(overlay, pagesize=(width, height))
        if mode == "numbers":
            c.setFont("Helvetica", 9)
            c.setFillColor(colors.HexColor("#555555"))
            c.drawRightString(width - 24, 18, str(index))
        elif mode == "watermark":
            c.saveState()
            c.translate(width / 2, height / 2)
            c.rotate(35)
            c.setFillColor(colors.Color(0.3, 0.3, 0.3, alpha=0.16))
            c.setFont("Helvetica-Bold", max(22, min(52, width / 12)))
            c.drawCentredString(0, 0, value[:80])
            c.restoreState()
        elif mode == "signature" and index == len(reader.pages):
            c.setFillColor(colors.black)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(48, 48, "Signed by:")
            c.setFont("Helvetica", 11)
            c.drawString(110, 48, value[:120])
            c.setFont("Helvetica", 8)
            c.drawString(48, 34, "Digital signature added by MYKSA CONNECT")
        c.save()
        overlay.seek(0)
        overlay_page = PdfReader(overlay).pages[0]
        page.merge_page(overlay_page)
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def write_pdf_pages(reader: PdfReader, indexes: list[int]) -> bytes:
    writer = PdfWriter()
    for index in indexes:
        writer.add_page(reader.pages[index])
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def protect_pdf(data: bytes, password: str) -> bytes:
    if not password:
        raise HTTPException(400, "Password is required.")
    reader = PdfReader(io.BytesIO(data))
    if reader.is_encrypted:
        raise HTTPException(400, "This PDF is already password protected.")
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    writer.encrypt(password)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def unlock_pdf(data: bytes, password: str) -> bytes:
    reader = pdf_reader(data, password)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def extract_images_zip(data: bytes) -> bytes:
    reader = pdf_reader(data)
    out = io.BytesIO()
    count = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
        for page_no, page in enumerate(reader.pages, start=1):
            try:
                images = page.images
            except Exception:
                images = []
            for image_no, image in enumerate(images, start=1):
                name = Path(getattr(image, "name", "image.png")).name
                suffix = Path(name).suffix or ".png"
                filename = f"page-{page_no}-image-{image_no}{suffix}"
                archive.writestr(filename, image.data)
                count += 1
        if count == 0:
            archive.writestr("README.txt", "No embedded raster images were found in this PDF.")
    return out.getvalue()


def compare_pdfs(data1: bytes, data2: bytes) -> bytes:
    left = extract_pdf_text(data1).splitlines()
    right = extract_pdf_text(data2).splitlines()
    import difflib
    diff = difflib.unified_diff(left, right, fromfile="PDF 1", tofile="PDF 2", lineterm="")
    body = "\n".join(diff)
    if not body:
        body = "No extracted-text differences were found."
    return ("MYKSA CONNECT PDF comparison\n\n" + body + "\n").encode("utf-8")


def repair_pdf(data: bytes) -> bytes:
    reader = pdf_reader(data)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


@app.get("/api/convert")
def converter_health():
    return {"ok": True, "service": "myksa-converter-engine", "operations": sorted(ALLOWED), "max_file_bytes": MAX_FILE_BYTES}


@app.post("/api/convert")
async def convert(
    operation: Annotated[str, Form(...)],
    file: Annotated[UploadFile, File(...)],
    file2: Annotated[UploadFile | None, File()] = None,
    value: Annotated[str, Form()] = "",
):
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
        elif operation == "pdf-to-excel":
            payload, media, ext = make_excel_from_pdf(data), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"
        elif operation in {"pdf-to-text", "pdf-ocr"}:
            payload, media, ext = make_pdf_text(data), "text/plain; charset=utf-8", "txt"
        elif operation == "pdf-to-html":
            payload, media, ext = make_html_from_pdf(data), "text/html; charset=utf-8", "html"
        elif operation == "pdf-to-markdown":
            payload, media, ext = make_markdown_from_pdf(data), "text/markdown; charset=utf-8", "md"
        elif operation == "ppt-to-pdf":
            payload, media, ext = make_pdf_from_pptx(data), "application/pdf", "pdf"
        elif operation == "pdf-to-ppt":
            payload, media, ext = make_pptx_from_pdf(data), "application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"
        elif operation == "add-pdf-page-numbers":
            payload, media, ext = overlay_pdf(data, "numbers"), "application/pdf", "pdf"
        elif operation == "watermark-pdf":
            payload, media, ext = overlay_pdf(data, "watermark", value or "MYKSA CONNECT"), "application/pdf", "pdf"
        elif operation == "protect-pdf":
            payload, media, ext = protect_pdf(data, value), "application/pdf", "pdf"
        elif operation == "unlock-pdf":
            payload, media, ext = unlock_pdf(data, value), "application/pdf", "pdf"
        elif operation == "remove-pdf-pages":
            reader = pdf_reader(data)
            remove = set(parse_pages(value, len(reader.pages)))
            keep = [i for i in range(len(reader.pages)) if i + 1 not in remove]
            if not keep:
                raise HTTPException(400, "You cannot remove every page from the PDF.")
            payload, media, ext = write_pdf_pages(reader, keep), "application/pdf", "pdf"
        elif operation == "reorder-pdf-pages":
            reader = pdf_reader(data)
            order = parse_pages(value, len(reader.pages))
            if len(order) != len(reader.pages) or sorted(order) != list(range(1, len(reader.pages) + 1)):
                raise HTTPException(400, "Reorder must contain every page exactly once.")
            payload, media, ext = write_pdf_pages(reader, [p - 1 for p in order]), "application/pdf", "pdf"
        elif operation == "extract-images-from-pdf":
            payload, media, ext = extract_images_zip(data), "application/zip", "zip"
        elif operation == "sign-pdf":
            payload, media, ext = overlay_pdf(data, "signature", value), "application/pdf", "pdf"
        elif operation == "compare-pdf":
            if file2 is None:
                raise HTTPException(400, "A second PDF is required for comparison.")
            data2 = await file2.read()
            check_upload(operation, file2, data2)
            payload, media, ext = compare_pdfs(data, data2), "text/plain; charset=utf-8", "txt"
        elif operation == "repair-pdf":
            payload, media, ext = repair_pdf(data), "application/pdf", "pdf"
        else:
            raise HTTPException(400, "Unsupported conversion operation.")
        return Response(payload, media_type=media, headers={"Content-Disposition": f'attachment; filename="{base}.{ext}"'})
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"Conversion failed: {type(exc).__name__}") from exc
