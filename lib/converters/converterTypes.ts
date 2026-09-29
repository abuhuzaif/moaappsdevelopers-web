export type ConverterCategory = "document" | "pdf" | "data" | "image";

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
  { slug: "csv-to-excel", name: "CSV to Excel", shortDescription: "Convert CSV files to Excel workbooks.", category: "data", input: "CSV", output: "XLSX", clientSide: true },
  { slug: "excel-to-csv", name: "Excel to CSV", shortDescription: "Convert Excel worksheets to CSV.", category: "data", input: "XLSX", output: "CSV", clientSide: true },
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
];
