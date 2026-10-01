export type ConverterCategory = "document" | "pdf" | "data" | "image" | "cad";

export type ConverterDefinition = {
  slug: string;
  name: string;
  shortDescription: string;
  category: ConverterCategory;
  input: string;
  output: string;
  clientSide: boolean;
};

export const CONVERTER_DEFINITIONS: ConverterDefinition[] = [
  { slug: "word-to-pdf", name: "Word to PDF", shortDescription: "Convert Word documents to PDF.", category: "document", input: "DOCX", output: "PDF", clientSide: false },
  { slug: "pdf-to-word", name: "PDF to Word", shortDescription: "Convert PDF documents to editable Word files.", category: "pdf", input: "PDF", output: "DOCX", clientSide: false },
  { slug: "pdf-to-csv", name: "PDF to CSV", shortDescription: "Extract tabular PDF data into CSV.", category: "pdf", input: "PDF", output: "CSV", clientSide: false },
  { slug: "pdf-to-excel", name: "PDF to Excel", shortDescription: "Extract PDF tables into an Excel workbook.", category: "pdf", input: "PDF", output: "XLSX", clientSide: false },
  { slug: "pdf-to-text", name: "PDF to Text", shortDescription: "Extract searchable text from PDF pages.", category: "pdf", input: "PDF", output: "TXT", clientSide: false },
  { slug: "pdf-ocr", name: "PDF OCR", shortDescription: "Create a text-extraction copy of a PDF for scanned or image-heavy documents.", category: "pdf", input: "PDF", output: "TXT", clientSide: false },
  { slug: "pdf-to-html", name: "PDF to HTML", shortDescription: "Convert PDF text into a clean HTML document.", category: "pdf", input: "PDF", output: "HTML", clientSide: false },
  { slug: "pdf-to-markdown", name: "PDF to Markdown", shortDescription: "Convert PDF text into Markdown.", category: "pdf", input: "PDF", output: "MD", clientSide: false },
  { slug: "pdf-to-jpg", name: "PDF to JPG", shortDescription: "Convert PDF pages to JPG images.", category: "pdf", input: "PDF", output: "JPG", clientSide: true },
  { slug: "jpg-to-pdf", name: "JPG to PDF", shortDescription: "Combine JPG images into a PDF.", category: "pdf", input: "JPG", output: "PDF", clientSide: true },
  { slug: "ppt-to-pdf", name: "PPT to PDF", shortDescription: "Convert PowerPoint presentations to PDF.", category: "document", input: "PPTX", output: "PDF", clientSide: false },
  { slug: "pdf-to-ppt", name: "PDF to PowerPoint", shortDescription: "Convert PDF documents to PowerPoint presentations.", category: "pdf", input: "PDF", output: "PPTX", clientSide: false },
  { slug: "txt-to-pdf", name: "TXT to PDF", shortDescription: "Turn text files into PDF documents.", category: "document", input: "TXT", output: "PDF", clientSide: true },
  { slug: "merge-pdf", name: "Merge PDF", shortDescription: "Combine multiple PDF files into one PDF.", category: "pdf", input: "PDF", output: "PDF", clientSide: true },
  { slug: "split-pdf", name: "Split PDF", shortDescription: "Split a PDF into selected pages or files.", category: "pdf", input: "PDF", output: "PDF", clientSide: true },
  { slug: "compress-pdf", name: "Compress PDF", shortDescription: "Reduce PDF file size for easier sharing.", category: "pdf", input: "PDF", output: "PDF", clientSide: true },
  { slug: "rotate-pdf", name: "Rotate PDF", shortDescription: "Rotate PDF pages and save a new file.", category: "pdf", input: "PDF", output: "PDF", clientSide: true },
  { slug: "extract-pdf-pages", name: "Extract PDF Pages", shortDescription: "Extract selected pages from a PDF.", category: "pdf", input: "PDF", output: "PDF", clientSide: true },
  { slug: "add-pdf-page-numbers", name: "Add PDF Page Numbers", shortDescription: "Add page numbers to PDF pages.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "watermark-pdf", name: "Watermark PDF", shortDescription: "Add a text watermark to every PDF page.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "protect-pdf", name: "Protect PDF", shortDescription: "Encrypt a PDF with a password.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "unlock-pdf", name: "Unlock PDF", shortDescription: "Remove PDF password protection when the correct password is supplied.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "remove-pdf-pages", name: "Remove PDF Pages", shortDescription: "Remove selected pages from a PDF.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "reorder-pdf-pages", name: "Reorder PDF Pages", shortDescription: "Reorder PDF pages using a page-number sequence.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "extract-images-from-pdf", name: "Extract Images from PDF", shortDescription: "Extract embedded raster images from a PDF as a ZIP file.", category: "pdf", input: "PDF", output: "ZIP", clientSide: false },
  { slug: "sign-pdf", name: "Sign PDF", shortDescription: "Add a signature image, drawn signature or typed signature to a PDF and position it precisely.", category: "pdf", input: "PDF", output: "PDF", clientSide: true },
  { slug: "compare-pdf", name: "Compare PDF", shortDescription: "Compare extracted text from two PDF documents and download a report.", category: "pdf", input: "2 PDFs", output: "TXT", clientSide: false },
  { slug: "repair-pdf", name: "Repair PDF", shortDescription: "Rewrite a readable PDF into a fresh PDF file.", category: "pdf", input: "PDF", output: "PDF", clientSide: false },
  { slug: "images-to-pdf", name: "Images to PDF", shortDescription: "Combine images into a single PDF.", category: "pdf", input: "JPG/PNG/WebP", output: "PDF", clientSide: true },
  { slug: "pdf-to-images", name: "PDF to Images", shortDescription: "Export PDF pages as images.", category: "pdf", input: "PDF", output: "JPG/PNG", clientSide: true },
  { slug: "csv-to-json", name: "CSV to JSON", shortDescription: "Convert CSV data into JSON.", category: "data", input: "CSV", output: "JSON", clientSide: true },
  { slug: "json-to-csv", name: "JSON to CSV", shortDescription: "Convert JSON arrays into CSV.", category: "data", input: "JSON", output: "CSV", clientSide: true },
  { slug: "xml-to-json", name: "XML to JSON", shortDescription: "Convert XML data into JSON.", category: "data", input: "XML", output: "JSON", clientSide: true },
  { slug: "json-to-xml", name: "JSON to XML", shortDescription: "Convert JSON data into XML.", category: "data", input: "JSON", output: "XML", clientSide: true },
  { slug: "json-formatter", name: "JSON Formatter & Validator", shortDescription: "Format, validate and inspect JSON data.", category: "data", input: "JSON", output: "JSON", clientSide: true },
  { slug: "jpg-to-webp", name: "JPG to WebP", shortDescription: "Convert JPG images to WebP.", category: "image", input: "JPG", output: "WebP", clientSide: true },
  { slug: "png-to-webp", name: "PNG to WebP", shortDescription: "Convert PNG images to WebP.", category: "image", input: "PNG", output: "WebP", clientSide: true },
  { slug: "webp-to-jpg", name: "WebP to JPG", shortDescription: "Convert WebP images to JPG.", category: "image", input: "WebP", output: "JPG", clientSide: true },
  { slug: "webp-to-png", name: "WebP to PNG", shortDescription: "Convert WebP images to PNG.", category: "image", input: "WebP", output: "PNG", clientSide: true },
  { slug: "image-merger", name: "Image Merger", shortDescription: "Merge multiple images vertically or horizontally.", category: "image", input: "JPG/PNG/WebP", output: "JPG/PNG/WebP", clientSide: true },
  { slug: "image-compressor", name: "Image Compressor", shortDescription: "Compress images in your browser.", category: "image", input: "JPG/PNG/WebP", output: "JPG/PNG/WebP", clientSide: true },
  { slug: "image-resizer", name: "Image Resizer", shortDescription: "Resize images to custom dimensions.", category: "image", input: "JPG/PNG/WebP", output: "JPG/PNG/WebP", clientSide: true },
  { slug: "cad-tools", name: "CAD Tools", shortDescription: "DWG and DXF conversion tools for CAD drawings.", category: "cad", input: "DWG / DXF", output: "DXF / PDF / SVG", clientSide: false },
];