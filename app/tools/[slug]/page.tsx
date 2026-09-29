import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONVERTER_DEFINITIONS } from "@/lib/converters/converterTypes";
import ConverterClient from "../_components/ConverterClient";
import ServerConverterClient from "../_components/ServerConverterClient";
import AdvancedPdfToolClient from "../_components/AdvancedPdfToolClient";
import TxtToPdfClient from "../_components/TxtToPdfClient";

type Props = { params: Promise<{ slug: string }> };

type SeoCopy = {
  title: string;
  description: string;
  intro: string;
  howTo: string[];
  benefits: string[];
  faqs: Array<{ q: string; a: string }>;
};

const INTERACTIVE_CONVERTER_SLUGS = new Set([
  "jpg-to-webp", "png-to-webp", "webp-to-jpg", "webp-to-png", "image-merger", "image-compressor", "image-resizer",
  "csv-to-json", "json-to-csv", "xml-to-json", "json-to-xml", "json-formatter", "csv-to-excel", "excel-to-csv",
  "txt-to-pdf", "jpg-to-pdf", "images-to-pdf", "merge-pdf", "split-pdf", "rotate-pdf", "extract-pdf-pages",
]);

const SERVER_CONVERTER_SLUGS = new Set([
  "word-to-pdf", "pdf-to-word", "pdf-to-csv", "pdf-to-excel", "pdf-to-text", "pdf-ocr", "pdf-to-html", "pdf-to-markdown",
  "ppt-to-pdf", "pdf-to-ppt",
]);

const ADVANCED_PDF_SLUGS = new Set([
  "add-pdf-page-numbers", "watermark-pdf", "protect-pdf", "unlock-pdf", "remove-pdf-pages", "reorder-pdf-pages",
  "extract-images-from-pdf", "sign-pdf", "compare-pdf", "repair-pdf",
]);

const SEO_COPY: Record<string, SeoCopy> = {
  "word-to-pdf": {
    title: "Word to PDF Converter Online – Free DOCX to PDF",
    description: "Convert Word DOCX files to PDF online with MYKSA CONNECT. Create a clean PDF from a Word document without installing desktop software.",
    intro: "Use this Word to PDF converter to turn DOCX documents into PDF files for sharing, printing, archiving, applications and professional documents. The conversion runs through the site's server-side document engine.",
    howTo: ["Choose a DOCX Word document.", "Start the conversion and wait for the PDF to be generated.", "Download the resulting PDF and check the layout before sharing it."],
    benefits: ["DOCX to PDF conversion", "Simple browser workflow", "Useful for documents, forms and business files", "No desktop converter required"],
    faqs: [
      { q: "How do I convert Word to PDF?", a: "Upload a DOCX file, start the converter, then download the generated PDF." },
      { q: "Can I use this without Microsoft Word installed?", a: "Yes. The conversion is performed by the site's server-side document engine." },
      { q: "What is the output format?", a: "The converter produces a PDF document from the supplied DOCX file." },
    ],
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Online – Convert PDF to DOCX",
    description: "Convert PDF documents to editable Word DOCX files online. Extract PDF text into an editable document with MYKSA CONNECT.",
    intro: "Convert a text-based PDF into an editable Word document when you need to reuse or update document content. This tool is designed for practical PDF-to-DOCX conversion and document workflows.",
    howTo: ["Select the PDF you want to convert.", "Run the PDF to Word conversion.", "Download the generated DOCX file and review formatting."],
    benefits: ["PDF to DOCX conversion", "Useful for editable document workflows", "Browser-based upload and download", "No Word-to-PDF desktop workflow required"],
    faqs: [
      { q: "Can I edit the converted Word file?", a: "Yes. The output is a DOCX file intended for editing in compatible word-processing software." },
      { q: "Will every PDF layout convert perfectly?", a: "Complex layouts, fonts and graphics can vary, so review the generated document before publishing." },
      { q: "Is this a PDF to DOCX converter?", a: "Yes. The output format is DOCX." },
    ],
  },
  "pdf-to-csv": {
    title: "PDF to CSV Converter – Extract PDF Tables to CSV",
    description: "Extract tabular data from PDF files and convert it to CSV online. Useful for spreadsheets, reports and structured data workflows.",
    intro: "Use PDF to CSV when a PDF contains tables that you need in a simple comma-separated format. The result can be opened in spreadsheet software or processed as structured data.",
    howTo: ["Upload the PDF containing the table.", "Start the extraction and CSV conversion.", "Download the CSV and inspect columns and rows in your spreadsheet application."],
    benefits: ["PDF table extraction", "CSV output for spreadsheets and scripts", "Useful for reports and tabular documents", "Server-side processing"],
    faqs: [
      { q: "What does PDF to CSV extract?", a: "It extracts tabular text from a PDF into a CSV-oriented data file." },
      { q: "Can I open CSV in Excel?", a: "Yes. CSV files can be opened or imported into Excel and other spreadsheet applications." },
      { q: "Are scanned PDFs supported?", a: "Scanned PDFs may require OCR-quality text before reliable table extraction is possible." },
    ],
  },
  "pdf-to-excel": {
    title: "PDF to Excel Converter – Convert PDF Tables to XLSX",
    description: "Convert PDF tables to Excel XLSX online. Extract structured PDF data into an editable spreadsheet with MYKSA CONNECT.",
    intro: "PDF to Excel is designed for users who need table data from PDF reports in an editable XLSX workbook. It is useful for business reports, exported tables and spreadsheet workflows.",
    howTo: ["Upload a PDF containing structured table data.", "Run the PDF to Excel conversion.", "Download the XLSX workbook and verify the extracted cells."],
    benefits: ["PDF to XLSX conversion", "Useful for tables and reports", "Editable spreadsheet output", "Server-side processing"],
    faqs: [
      { q: "Can I convert a PDF table to Excel?", a: "Yes. The tool is intended to extract structured PDF table data into an XLSX workbook." },
      { q: "Can I edit the Excel result?", a: "Yes. XLSX output can be edited in Excel and compatible spreadsheet applications." },
      { q: "Does PDF to Excel work with every PDF?", a: "Results depend on the PDF's text and table structure. Complex or scanned layouts may need additional processing." },
    ],
  },
  "pdf-to-text": {
    title: "PDF to Text Converter – Extract Text from PDF",
    description: "Extract searchable text from PDF files and save it as TXT online. Fast, practical PDF text extraction for documents and reports.",
    intro: "Convert text-based PDF documents into plain TXT files when you need searchable, reusable text for notes, analysis, scripts or document processing.",
    howTo: ["Upload a PDF document.", "Start PDF text extraction.", "Download the TXT file and use the extracted text in your preferred editor."],
    benefits: ["PDF text extraction", "Plain TXT output", "Useful for search and reuse", "Server-side processing"],
    faqs: [
      { q: "What does PDF to Text do?", a: "It extracts readable text from a PDF and returns it as a TXT file." },
      { q: "Can it extract text from scanned PDFs?", a: "Scanned documents may require OCR because they contain images rather than a selectable text layer." },
      { q: "What can I do with the TXT output?", a: "You can search, edit, copy, analyze or process the extracted text with other software." },
    ],
  },
  "pdf-ocr": {
    title: "PDF OCR Online – Extract Text from Scanned PDF",
    description: "Process PDF files for text extraction and scanned-document workflows. Convert readable PDF content into downloadable text with MYKSA CONNECT.",
    intro: "PDF OCR is intended for documents where text extraction is needed from PDF content. For image-only scans, true optical character recognition depends on the OCR runtime available to the deployment; review the output for accuracy.",
    howTo: ["Upload the PDF document.", "Start the PDF text-processing operation.", "Download the text result and verify important names, numbers and formatting."],
    benefits: ["PDF text-processing workflow", "Useful for scanned-document preparation", "Downloadable text output", "Accuracy should be reviewed for image-only scans"],
    faqs: [
      { q: "What is PDF OCR?", a: "OCR means optical character recognition, a process used to turn text in document images into machine-readable text." },
      { q: "Is OCR always accurate?", a: "No. Scan quality, fonts, language and document layout can affect OCR accuracy, so important results should be checked." },
      { q: "What output does this page provide?", a: "The current tool provides a downloadable text-extraction result." },
    ],
  },
  "pdf-to-html": {
    title: "PDF to HTML Converter – Convert PDF Text to HTML",
    description: "Convert PDF text into a clean HTML document online. Useful for web publishing, document reuse and structured content workflows.",
    intro: "PDF to HTML helps turn readable PDF text into a web-friendly HTML document. It is useful when content needs to move from a PDF into a website or HTML-based workflow.",
    howTo: ["Upload a PDF.", "Run the PDF to HTML conversion.", "Download the HTML file and adapt the markup for your website if needed."],
    benefits: ["PDF text to HTML", "Web-friendly output", "Useful for content migration", "Server-side processing"],
    faqs: [
      { q: "Can PDF to HTML preserve the exact PDF design?", a: "The tool focuses on readable HTML content; complex visual layouts may need manual HTML/CSS adjustments." },
      { q: "Can I publish the HTML on a website?", a: "Yes. Review and adapt the generated HTML before publishing it." },
      { q: "Does the tool upload my PDF?", a: "This converter uses server-side processing, so the selected file is sent to the conversion service for processing." },
    ],
  },
  "pdf-to-markdown": {
    title: "PDF to Markdown Converter – Convert PDF Text to MD",
    description: "Convert readable PDF text into Markdown online. Useful for documentation, notes, Git repositories and content workflows.",
    intro: "PDF to Markdown converts document text into a lightweight Markdown file that can be edited in documentation systems, notes apps and developer workflows.",
    howTo: ["Choose a PDF document.", "Run the PDF to Markdown conversion.", "Download the MD file and refine headings or formatting where necessary."],
    benefits: ["PDF to Markdown conversion", "Useful for documentation", "Simple MD output", "Server-side processing"],
    faqs: [
      { q: "What is Markdown?", a: "Markdown is a lightweight text format commonly used for documentation, README files and web content." },
      { q: "Will every PDF heading be preserved?", a: "Simple document structure converts best; complex layouts may need manual formatting adjustments." },
      { q: "Can I use the output in GitHub documentation?", a: "Yes. Markdown is widely used for README and documentation workflows." },
    ],
  },
  "ppt-to-pdf": {
    title: "PowerPoint to PDF Converter – PPTX to PDF Online",
    description: "Convert PowerPoint PPTX presentations to PDF online. Create shareable PDF versions of presentation files with MYKSA CONNECT.",
    intro: "Convert PowerPoint presentations to PDF when you need a portable version for sharing, printing, archiving or document submission.",
    howTo: ["Upload a PPTX presentation.", "Start the conversion to PDF.", "Download and review the generated PDF before distribution."],
    benefits: ["PPTX to PDF conversion", "Useful for presentations and reports", "Easy browser workflow", "Server-side processing"],
    faqs: [
      { q: "Can I convert PPTX to PDF without PowerPoint?", a: "The converter is designed to process the presentation through the site's server-side conversion engine." },
      { q: "Is the output a PDF?", a: "Yes. The generated file is a PDF document." },
      { q: "Should I check the presentation after conversion?", a: "Yes. Review fonts, images, charts and slide layout before using the PDF professionally." },
    ],
  },
  "pdf-to-ppt": {
    title: "PDF to PowerPoint Converter – Convert PDF to PPTX",
    description: "Convert PDF documents to PowerPoint PPTX presentations online. Reuse PDF content in presentation workflows with MYKSA CONNECT.",
    intro: "Use PDF to PowerPoint when PDF content needs to move into a presentation workflow. Review the generated slides because complex PDF layouts may require editing after conversion.",
    howTo: ["Upload the PDF document.", "Start the PDF to PowerPoint conversion.", "Download the PPTX file and edit or review the slides."],
    benefits: ["PDF to PPTX conversion", "Presentation-ready output", "Useful for document reuse", "Server-side processing"],
    faqs: [
      { q: "Can I edit the converted PPTX?", a: "Yes. The output is a PPTX presentation intended for editing in compatible presentation software." },
      { q: "Will PDF graphics and layouts convert perfectly?", a: "Complex layouts may need manual adjustments after conversion." },
      { q: "What is the output format?", a: "The converter produces a PPTX PowerPoint presentation." },
    ],
  },
  "add-pdf-page-numbers": {
    title: "Add Page Numbers to PDF Online – Free PDF Page Number Tool",
    description: "Add page numbers to PDF documents online. Choose a PDF and create a numbered copy for reports, manuals, applications and business documents.",
    intro: "Add page numbers to PDF files when a document needs clearer navigation or professional pagination. The tool creates a new PDF while leaving your original file unchanged.",
    howTo: ["Upload the PDF you want to number.", "Run the page-numbering tool.", "Download the newly generated PDF and check the pagination."],
    benefits: ["PDF page numbering", "Useful for reports and manuals", "Creates a new PDF copy", "No manual page-by-page editing"],
    faqs: [
      { q: "Can I add page numbers to an existing PDF?", a: "Yes. Upload the PDF and the tool adds page numbers to its pages." },
      { q: "Does it change my original PDF?", a: "No. The converter creates a separate output file." },
      { q: "Where are the page numbers placed?", a: "The current engine applies a consistent page-number placement to the PDF pages." },
    ],
  },
  "watermark-pdf": {
    title: "Watermark PDF Online – Add Text Watermark to PDF",
    description: "Add a text watermark to every page of a PDF online. Useful for drafts, confidential documents, samples and branded files.",
    intro: "Watermark PDF helps identify documents as drafts, samples, confidential material or other controlled copies by adding a text watermark to each page.",
    howTo: ["Upload your PDF.", "Enter the watermark text and run the tool.", "Download the watermarked PDF and verify readability."],
    benefits: ["Text watermark on PDF pages", "Useful for draft and confidential documents", "Creates a separate output PDF", "Simple browser workflow"],
    faqs: [
      { q: "Can I watermark every PDF page?", a: "Yes. The current tool applies the supplied text watermark across the PDF pages." },
      { q: "Can I use a company name as a watermark?", a: "Yes. Text such as a company name, Draft or Confidential can be used." },
      { q: "Does watermarking protect a PDF from copying?", a: "A watermark identifies a document but is not a security control by itself." },
    ],
  },
  "protect-pdf": {
    title: "Protect PDF with Password – Encrypt PDF Online",
    description: "Protect a PDF with a password online. Encrypt PDF documents for safer sharing and controlled access with MYKSA CONNECT.",
    intro: "Use Protect PDF to create a password-protected copy of a document. Password protection can help control casual access when sharing PDF files.",
    howTo: ["Choose the PDF to protect.", "Enter a strong password and run the tool.", "Download the protected PDF and store the password securely."],
    benefits: ["Password-protected PDF", "Useful for controlled sharing", "Creates a separate encrypted output", "Browser-based workflow"],
    faqs: [
      { q: "Can I password protect a PDF?", a: "Yes. The tool creates a password-protected PDF from the supplied document." },
      { q: "Should I keep a backup of my password?", a: "Yes. Store the password securely because losing it can prevent access to the protected file." },
      { q: "Is PDF password protection a complete security solution?", a: "No. Use appropriate organizational security controls for sensitive information." },
    ],
  },
  "unlock-pdf": {
    title: "Unlock PDF Online – Remove PDF Password Protection",
    description: "Unlock a password-protected PDF when you know the correct password. Remove PDF protection from documents you are authorized to access.",
    intro: "Unlock PDF is intended for legitimate document owners or users who have the required password. The tool removes password protection from an accessible PDF so it can be used normally.",
    howTo: ["Upload a PDF you are authorized to access.", "Provide the correct password if requested.", "Download the unlocked PDF and verify access."],
    benefits: ["Remove known PDF password protection", "Designed for authorized access", "Creates a new PDF copy", "Simple browser workflow"],
    faqs: [
      { q: "Can I unlock a PDF without the password?", a: "No. The intended workflow requires the correct password for protected documents." },
      { q: "Is it legal to unlock any PDF?", a: "Only unlock documents you own or are authorized to access." },
      { q: "Does the original PDF change?", a: "No. The tool creates a separate output file." },
    ],
  },
  "remove-pdf-pages": {
    title: "Remove Pages from PDF Online – Delete PDF Pages",
    description: "Remove selected pages from a PDF online. Create a new PDF without unwanted pages for cleaner reports and documents.",
    intro: "Remove PDF Pages lets you delete selected pages from a document without rebuilding the entire PDF manually.",
    howTo: ["Upload the PDF.", "Specify the pages to remove.", "Generate and download the revised PDF."],
    benefits: ["Delete unwanted PDF pages", "Useful for reports and document cleanup", "Creates a new PDF", "Simple page-selection workflow"],
    faqs: [
      { q: "Can I remove one page from a PDF?", a: "Yes. Select the page you want to remove and generate the new PDF." },
      { q: "Will the remaining pages stay in order?", a: "The tool keeps the remaining document pages in sequence." },
      { q: "Can I remove multiple pages?", a: "Yes. The page-selection workflow supports removing selected pages." },
    ],
  },
  "reorder-pdf-pages": {
    title: "Reorder PDF Pages Online – Rearrange PDF Pages",
    description: "Reorder PDF pages online using a page-number sequence. Create a new PDF with pages in the order you need.",
    intro: "Reorder PDF Pages is useful when a report, scanned document or combined PDF has pages in the wrong order. Enter the desired sequence and generate a revised PDF.",
    howTo: ["Upload the PDF.", "Enter the desired page-number sequence.", "Generate and download the reordered PDF."],
    benefits: ["Rearrange PDF pages", "Useful for reports and scanned documents", "Creates a new PDF", "Simple page-order workflow"],
    faqs: [
      { q: "Can I change the order of PDF pages?", a: "Yes. Provide the desired page-number sequence and generate a new PDF." },
      { q: "Can I duplicate a page in the sequence?", a: "The current engine is designed around a page-number sequence; review the result for your intended use." },
      { q: "Does the original file change?", a: "No. a new PDF is generated." },
    ],
  },
  "extract-images-from-pdf": {
    title: "Extract Images from PDF Online – Download PDF Images",
    description: "Extract embedded images from a PDF and download them as a ZIP file. Useful for recovering photos, diagrams and graphics from PDF documents.",
    intro: "Extract Images from PDF finds embedded raster images inside a PDF and packages the extracted files into a ZIP archive for convenient download.",
    howTo: ["Upload a PDF containing images.", "Run the image extraction tool.", "Download the ZIP archive and inspect the extracted images."],
    benefits: ["Extract images from PDF", "ZIP download for multiple images", "Useful for graphics and document assets", "Server-side processing"],
    faqs: [
      { q: "Can I extract images from a PDF?", a: "Yes. The tool extracts embedded raster images that are available inside the PDF." },
      { q: "What is the output?", a: "The extracted images are packaged into a ZIP archive." },
      { q: "Will it extract every visual element?", a: "PDFs can contain vector graphics and rendered page content that are not embedded raster images, so results can vary." },
    ],
  },
  "sign-pdf": {
    title: "Sign PDF Online – Add a Signature to PDF",
    description: "Add a typed signature block to a PDF online. Create a signed PDF copy for simple document workflows and approvals.",
    intro: "Sign PDF provides a simple way to add a typed signature block to a PDF. It is suitable for basic document workflows where a typed signature is acceptable.",
    howTo: ["Upload the PDF.", "Enter the signature information and run the tool.", "Download the signed PDF and review the final page."],
    benefits: ["Typed signature block", "Useful for simple approvals", "Creates a new PDF copy", "Fast browser workflow"],
    faqs: [
      { q: "Is this a legally binding digital signature?", a: "A typed signature block is not automatically equivalent to a regulated electronic or digital signature. Use the appropriate signing method for legal requirements." },
      { q: "Where is the signature added?", a: "The current engine adds a typed signature block to the last page." },
      { q: "Can I review the PDF before sharing it?", a: "Yes. Always review the generated document before sending or signing it formally." },
    ],
  },
  "compare-pdf": {
    title: "Compare PDF Files Online – Find Text Differences",
    description: "Compare two PDF documents online and download a text comparison report. Useful for checking revisions and document changes.",
    intro: "Compare PDF compares extracted text from two PDF documents so you can identify differences between revisions, drafts or versions of a report.",
    howTo: ["Select the first PDF.", "Select the second PDF.", "Run the comparison and download the generated report."],
    benefits: ["Compare two PDF documents", "Useful for revision checks", "Text-based difference report", "Server-side processing"],
    faqs: [
      { q: "What does PDF comparison compare?", a: "The current tool compares extracted text from two PDF documents." },
      { q: "Can it compare visual design changes?", a: "It is primarily a text comparison workflow, so visual-only changes may not appear in the report." },
      { q: "Can I compare two versions of a report?", a: "Yes. It is useful for checking text changes between document revisions." },
    ],
  },
  "repair-pdf": {
    title: "Repair PDF Online – Rebuild a Readable PDF",
    description: "Repair a readable PDF by rewriting it into a fresh PDF file. Useful for PDF files that need to be regenerated into a clean document.",
    intro: "Repair PDF attempts to rewrite a readable PDF into a fresh PDF file. It can help with some files that need regeneration, but severely corrupted or encrypted files may require specialized recovery software.",
    howTo: ["Upload the readable or partially problematic PDF.", "Run the repair operation.", "Download the rebuilt PDF and verify all pages and content."],
    benefits: ["Rebuild readable PDF content", "Creates a fresh PDF file", "Useful for some malformed PDF files", "Output should always be verified"],
    faqs: [
      { q: "Can every corrupted PDF be repaired?", a: "No. Repair depends on how much usable PDF structure remains in the file." },
      { q: "What should I do after repair?", a: "Open the output and verify pages, text, images and links before relying on it." },
      { q: "Will the original file be changed?", a: "No. The repair process creates a separate output PDF." },
    ],
  },
};

const GENERIC_COPY = (toolName: string, shortDescription: string): SeoCopy => ({
  title: `${toolName} Online | Free MYKSA CONNECT Tool`,
  description: `${shortDescription} Use the free online ${toolName.toLowerCase()} tool from MYKSA CONNECT.`,
  intro: `${shortDescription} This browser-friendly MYKSA CONNECT tool is designed to make common file conversion and document tasks simple without requiring a separate desktop utility.`,
  howTo: ["Choose or upload the supported input file.", `Run ${toolName.toLowerCase()} and wait for processing to finish.`, "Download the generated result and review it before using it professionally."],
  benefits: ["Simple online workflow", "Useful for everyday document and file tasks", "Clear input and output formats", "Designed for quick browser access"],
  faqs: [
    { q: `What does ${toolName} do?`, a: shortDescription },
    { q: "How do I use this tool?", a: "Upload or select the supported input, start the tool, then download the generated result." },
    { q: "Should I check the output?", a: "Yes. Always review converted files before publishing, submitting or relying on important information." },
  ],
});

export function generateStaticParams() {
  return CONVERTER_DEFINITIONS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = CONVERTER_DEFINITIONS.find((item) => item.slug === slug);
  if (!tool) return {};
  const seo = SEO_COPY[slug] ?? GENERIC_COPY(tool.name, tool.shortDescription);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/tools/${tool.slug}/` },
    robots: { index: true, follow: true },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      url: `/tools/${tool.slug}/`,
    },
  };
}

export default async function ConverterToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = CONVERTER_DEFINITIONS.find((item) => item.slug === slug);
  if (!tool) notFound();

  const interactive = INTERACTIVE_CONVERTER_SLUGS.has(slug);
  const serverSide = SERVER_CONVERTER_SLUGS.has(slug);
  const advancedPdf = ADVANCED_PDF_SLUGS.has(slug);
  const seo = SEO_COPY[slug] ?? GENERIC_COPY(tool.name, tool.shortDescription);
  const siteUrl = "https://www.myksaconnect.com";
  const pageUrl = `${siteUrl}/tools/${tool.slug}/`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "MYKSA CONNECT", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${siteUrl}/tools/` },
      { "@type": "ListItem", position: 3, name: "Converters", item: `${siteUrl}/tools/converters/` },
      { "@type": "ListItem", position: 4, name: tool.name, item: pageUrl },
    ],
  };

  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: seo.description,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "Organization", name: "MYKSA CONNECT", url: siteUrl },
  };

  return (
    <main style={{ minHeight: "70vh", padding: "56px 20px", background: "#fbfaf7" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", border: "1px solid #dfe7e3", borderRadius: 24, padding: "40px 28px", boxShadow: "0 12px 32px rgba(6,23,42,.06)" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, marginBottom: 22 }}>
          <a href="/" style={{ color: "#005744", textDecoration: "none" }}>MYKSA CONNECT</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/" style={{ color: "#005744", textDecoration: "none" }}>Tools</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <a href="/tools/converters/" style={{ color: "#005744", textDecoration: "none" }}>Converters</a>
          <span style={{ color: "#8a9693", margin: "0 7px" }}>/</span>
          <span style={{ color: "#52605d" }}>{tool.name}</span>
        </nav>

        <p style={{ color: "#005744", fontWeight: 800, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>MYKSA CONNECT • {tool.category} tool</p>
        <h1 style={{ color: "#06172a", fontSize: "clamp(30px,5vw,46px)", margin: "8px 0 12px" }}>{tool.name}</h1>
        <p style={{ color: "#5d6a68", fontSize: 16, lineHeight: 1.7 }}>{tool.shortDescription}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0" }}>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#eef7f3", color: "#005744", fontWeight: 700 }}>Input: {tool.input}</span>
          <span style={{ padding: "9px 13px", borderRadius: 999, background: "#fff7df", color: "#725600", fontWeight: 700 }}>Output: {tool.output}</span>
          {(serverSide || advancedPdf) && <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Server-side</span>}
          {!serverSide && !advancedPdf && tool.clientSide && <span style={{ padding: "9px 13px", borderRadius: 999, background: "#edf3fb", color: "#174a78", fontWeight: 700 }}>Browser-based</span>}
        </div>

        {advancedPdf ? (
          <AdvancedPdfToolClient slug={slug} />
        ) : serverSide ? (
          <ServerConverterClient slug={slug} />
        ) : slug === "txt-to-pdf" ? (
          <TxtToPdfClient />
        ) : interactive ? (
          <ConverterClient slug={slug} input={tool.input} output={tool.output} />
        ) : (
          <div style={{ padding: 20, borderRadius: 16, background: "#f6f8f7", border: "1px dashed #cbd8d3" }}>
            <strong style={{ color: "#06172a" }}>Tool page is live</strong>
            <p style={{ margin: "8px 0 0", color: "#65716f", lineHeight: 1.6 }}>The processing engine for this format is not enabled yet.</p>
          </div>
        )}

        <article style={{ marginTop: 42, color: "#33413f", lineHeight: 1.75 }}>
          <h2 style={{ color: "#06172a", fontSize: 28, marginBottom: 12 }}>{seo.title.split(" – ")[0]}</h2>
          <p>{seo.intro}</p>

          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>How to use this tool</h2>
          <ol style={{ paddingLeft: 22 }}>
            {seo.howTo.map((step) => <li key={step} style={{ marginBottom: 8 }}>{step}</li>)}
          </ol>

          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Key features</h2>
          <ul style={{ paddingLeft: 22 }}>
            {seo.benefits.map((benefit) => <li key={benefit} style={{ marginBottom: 8 }}>{benefit}</li>)}
          </ul>

          <h2 style={{ color: "#06172a", fontSize: 24, marginTop: 30 }}>Frequently asked questions</h2>
          <div>
            {seo.faqs.map((faq) => (
              <section key={faq.q} style={{ borderTop: "1px solid #e4ebe8", padding: "16px 0" }}>
                <h3 style={{ color: "#06172a", fontSize: 17, margin: 0 }}>{faq.q}</h3>
                <p style={{ margin: "7px 0 0" }}>{faq.a}</p>
              </section>
            ))}
          </div>
        </article>

        <a href="/tools/converters/" style={{ display: "inline-block", marginTop: 24, color: "#005744", fontWeight: 800, textDecoration: "none" }}>← Back to all converters</a>
      </section>
    </main>
  );
}
