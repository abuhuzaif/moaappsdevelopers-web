// Central SEO content for tool pages.
//
// - Calculator pages (EssentialCalculator) read intro / howTo / benefits / faqs / related.
// - Converter pages (app/tools/[slug]/page.tsx) also use `title` and `description`
//   when an entry exists here. Tools without an entry keep their old copy.
//
// To improve a page later, edit only its entry in this file.

export type ToolSeo = {
  title?: string;
  description?: string;
  intro: string;
  howTo: string[];
  benefits: string[];
  faqs: Array<{ q: string; a: string }>;
  related: string[];
};

export const TOOL_LABELS: Record<string, string> = {
  "gaz-square-meter-converter": "Gaz to Square Meter Converter",
  "square-feet-square-meter-converter": "Square Feet to Square Meter Converter",
  "marla-converter": "Marla Converter",
  "acre-hectare-square-meter-converter": "Acre, Hectare & Square Meter Converter",
  "feet-inches-centimeter-converter": "Feet & Inches to Centimeter Converter",
  "bmi-calculator": "BMI Calculator",
  "age-calculator": "Age Calculator",
  "percentage-calculator": "Percentage Calculator",
  "loan-emi-calculator": "Loan / EMI Calculator",
  "saudi-vat-calculator": "Saudi VAT Calculator",
  "vat-calculator": "VAT Calculator",
  "days-between-dates": "Days Between Dates Calculator",
  "hijri-gregorian-converter": "Hijri / Gregorian Converter",
  "iqama-expiry-calculator": "Iqama Expiry Calculator",
  "salary-calculator": "Salary Calculator",
  "sar-currency-converter": "Currency Converter",
  "jpg-to-pdf": "JPG to PDF",
  "images-to-pdf": "Images to PDF",
  "pdf-to-jpg": "PDF to JPG",
  "txt-to-pdf": "TXT to PDF",
  "merge-pdf": "Merge PDF",
  "split-pdf": "Split PDF",
  "compress-pdf": "Compress PDF",
  "rotate-pdf": "Rotate PDF",
  "extract-pdf-pages": "Extract PDF Pages",
  "remove-pdf-pages": "Remove PDF Pages",
  "reorder-pdf-pages": "Reorder PDF Pages",
  "pdf-to-word": "PDF to Word",
  "csv-to-json": "CSV to JSON",
  "json-to-csv": "JSON to CSV",
  "xml-to-json": "XML to JSON",
  "json-to-xml": "JSON to XML",
  "json-formatter": "JSON Formatter & Validator",
  "jpg-to-webp": "JPG to WebP",
  "png-to-webp": "PNG to WebP",
  "webp-to-jpg": "WebP to JPG",
  "webp-to-png": "WebP to PNG",
  "image-merger": "Image Merger",
  "image-compressor": "Image Compressor",
  "image-resizer": "Image Resizer",
};

export const TOOL_SEO: Record<string, ToolSeo> = {
  // ───────────────────────── Essential calculators ─────────────────────────
  "gaz-square-meter-converter": {
    intro:
      "Convert Gaz (also written Gaj) to square meters, or square meters back to Gaz, with this free converter. It is useful for plot and property sizes quoted in Gaz in India and Pakistan, and for comparing them with Saudi property sizes, which are given in square meters. Here 1 Gaz is treated as 1 square yard, which equals 9 square feet or 0.83612736 square meters.",
    howTo: [
      "Choose the direction: Gaz to m² or m² to Gaz.",
      "Enter the amount you want to convert.",
      "Read the converted value instantly in the Result box.",
    ],
    benefits: [
      "Gaz to square meter and square meter to Gaz",
      "Uses 1 Gaz = 0.83612736 m² (1 square yard)",
      "Free to use, no login needed",
      "Works on phone, tablet and desktop",
    ],
    faqs: [
      { q: "How many square meters are in 1 Gaz?", a: "1 Gaz is 0.83612736 square meters, because this converter treats 1 Gaz as 1 square yard." },
      { q: "How many square feet is 1 Gaz?", a: "1 Gaz equals 9 square feet." },
      { q: "What is the difference between Gaz and Gaj?", a: "They are two spellings of the same unit. In many property listings it simply means one square yard." },
      { q: "How do I convert square meters to Gaz?", a: "Divide the area in square meters by 0.83612736, or switch the converter to the m² to Gaz option." },
    ],
    related: ["square-feet-square-meter-converter", "marla-converter", "acre-hectare-square-meter-converter"],
  },

  "square-feet-square-meter-converter": {
    intro:
      "Convert square feet to square meters, or square meters to square feet, instantly. Saudi Arabia uses the metric system, so apartments, villas and offices are usually described in square meters, while many listings from India, Pakistan and the UK use square feet. This converter helps you compare both. 1 square foot equals exactly 0.09290304 square meters.",
    howTo: [
      "Choose ft² to m² or m² to ft².",
      "Type the area you want to convert.",
      "Read the result straight away under Result.",
    ],
    benefits: [
      "Sq ft to sq m and sq m to sq ft",
      "Exact factor: 1 ft² = 0.09290304 m²",
      "Handy for comparing apartment and villa sizes",
      "Free, fast and mobile friendly",
    ],
    faqs: [
      { q: "How do I convert square feet to square meters?", a: "Multiply the area in square feet by 0.09290304. For example, 1,000 sq ft is about 92.9 square meters." },
      { q: "How many square feet are in a square meter?", a: "One square meter is about 10.764 square feet." },
      { q: "Is this conversion exact?", a: "Yes. A foot is defined as exactly 0.3048 meters, so 0.09290304 is the exact factor for square feet to square meters." },
      { q: "Which unit is used for property in Saudi Arabia?", a: "Saudi Arabia uses the metric system, so property areas are normally given in square meters." },
    ],
    related: ["gaz-square-meter-converter", "marla-converter", "acre-hectare-square-meter-converter"],
  },

  "marla-converter": {
    intro:
      "Convert Marla to square feet and square meters, or square feet back to Marla, with a choice of standard. A Marla is a traditional land unit used in Pakistan and parts of India, and its size is not the same everywhere. This converter lets you pick 272.25 sq ft (the Pakistan standard) or 225 sq ft (a common local standard), so the result matches your property document.",
    howTo: [
      "Choose Marla to Area, or ft² to Marla.",
      "Select the Marla standard that matches your document or listing.",
      "Enter the value and read the result in square feet and square meters.",
    ],
    benefits: [
      "Marla to square feet and square meters",
      "Choose between 272.25 sq ft and 225 sq ft standards",
      "Reverse conversion from square feet to Marla",
      "Free and works on mobile",
    ],
    faqs: [
      { q: "How many square feet is 1 Marla?", a: "It depends on the standard. With the Pakistan standard 1 Marla is 272.25 sq ft, and with the other option here it is 225 sq ft." },
      { q: "How many square meters is 1 Marla?", a: "1 Marla of 272.25 sq ft is about 25.29 m², and 1 Marla of 225 sq ft is about 20.90 m²." },
      { q: "Why do Marla sizes differ?", a: "Marla is a traditional unit and its size varies by region and by local development authority, so always check the figure in your title or listing." },
      { q: "How many Marla make a Kanal?", a: "In Pakistan 1 Kanal is traditionally 20 Marla. This tool converts Marla only, not Kanal." },
    ],
    related: ["square-feet-square-meter-converter", "gaz-square-meter-converter", "acre-hectare-square-meter-converter"],
  },

  "acre-hectare-square-meter-converter": {
    intro:
      "Convert land area between acres, hectares and square meters in one step. Enter an amount, choose acre, hectare or square meter as the input unit, and the tool shows all three results together. 1 acre is 4,046.8564224 square meters and 1 hectare is 10,000 square meters.",
    howTo: [
      "Enter the land area you have.",
      "Select the input unit: acre, hectare or square meter.",
      "Read the result in square meters, acres and hectares together.",
    ],
    benefits: [
      "Acre, hectare and square meter in one result",
      "Uses 1 acre = 4,046.8564224 m²",
      "Useful for farm, plot and land comparisons",
      "Free, no login",
    ],
    faqs: [
      { q: "How many square meters are in an acre?", a: "One acre is 4,046.8564224 square meters." },
      { q: "How many acres are in a hectare?", a: "One hectare is about 2.471 acres." },
      { q: "How many hectares are in an acre?", a: "One acre is about 0.4047 hectares." },
      { q: "When should I use hectares instead of acres?", a: "Hectares are the metric land unit used in most countries and in government and scientific work. Acres are still common in India, Pakistan, the US and the UK." },
    ],
    related: ["square-feet-square-meter-converter", "marla-converter", "gaz-square-meter-converter"],
  },

  "feet-inches-centimeter-converter": {
    intro:
      "Convert height and length between feet and inches and centimeters. Enter feet and inches to get centimeters, or enter centimeters to see feet and inches. It is useful for forms that ask for height in cm, such as visa, medical, job or ID applications, when you only know your height in feet and inches.",
    howTo: [
      "Choose Feet & Inches to cm, or cm to Feet & Inches.",
      "Enter your measurement.",
      "Read the converted height instantly.",
    ],
    benefits: [
      "Feet and inches to centimeters, and back",
      "Exact factor: 1 inch = 2.54 cm",
      "Good for forms that ask for height in cm",
      "Free and mobile friendly",
    ],
    faqs: [
      { q: "How many centimeters are in 5 feet 10 inches?", a: "5 feet 10 inches is 70 inches, which equals 177.8 cm." },
      { q: "How many centimeters are in 1 inch?", a: "One inch is exactly 2.54 centimeters." },
      { q: "How do I convert cm to feet and inches?", a: "Divide the centimeters by 2.54 to get inches, then divide by 12 for feet. The remainder is the inches. Or just use the cm option in this tool." },
      { q: "Is 6 feet equal to 183 cm?", a: "6 feet is 72 inches, which is 182.88 cm, usually rounded to 183 cm." },
    ],
    related: ["bmi-calculator", "square-feet-square-meter-converter", "age-calculator"],
  },

  "bmi-calculator": {
    intro:
      "Calculate your Body Mass Index (BMI) from your weight in kilograms and your height in centimeters. BMI is a quick screening number that compares weight with height. This calculator uses the standard formula, weight in kg divided by height in meters squared, and shows whether the result falls in the underweight, healthy, overweight or obesity range.",
    howTo: [
      "Enter your weight in kilograms.",
      "Enter your height in centimeters.",
      "Read your BMI and its category in the Result box.",
    ],
    benefits: [
      "Instant BMI with category",
      "Standard formula: kg / m²",
      "Works for adults using kg and cm",
      "Free, private and mobile friendly",
    ],
    faqs: [
      { q: "What is a healthy BMI?", a: "For most adults, a BMI from 18.5 to 24.9 is considered the healthy range." },
      { q: "How is BMI calculated?", a: "Divide your weight in kilograms by your height in meters squared. For example, 70 kg at 175 cm gives a BMI of about 22.9." },
      { q: "What BMI is overweight or obese?", a: "A BMI from 25 to 29.9 is usually called overweight, and 30 or above is in the obesity range." },
      { q: "Is BMI accurate for everyone?", a: "No. BMI is a screening measure, not a diagnosis. It does not account for muscle mass, age, sex or body fat distribution, so speak to a doctor about your health." },
    ],
    related: ["age-calculator", "feet-inches-centimeter-converter", "percentage-calculator"],
  },

  "age-calculator": {
    intro:
      "Find your exact age in years, months and days from your date of birth. You can also pick another date to see how old someone was, or will be, on that day. This helps with application forms, school admission cut-off dates, document checks and planning. The calculator uses the Gregorian calendar.",
    howTo: [
      "Enter the date of birth.",
      "Leave \"Age on date\" as today, or choose a different date.",
      "Read the exact age in years, months and days.",
    ],
    benefits: [
      "Exact age in years, months and days",
      "Calculate age on any past or future date",
      "Handles leap years and month lengths",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I calculate my age from my date of birth?", a: "Enter your date of birth. The second date is set to today, so the tool shows your current age in years, months and days." },
      { q: "Can I calculate age on a past or future date?", a: "Yes. Change the \"Age on date\" field to any date on or after the date of birth." },
      { q: "Does it count leap years?", a: "Yes. It works with calendar dates, so leap years and different month lengths are handled." },
      { q: "Does this show my Hijri age?", a: "No, it uses the Gregorian calendar. To convert dates to the Hijri calendar, use the Hijri / Gregorian Converter." },
    ],
    related: ["days-between-dates", "hijri-gregorian-converter", "iqama-expiry-calculator"],
  },

  "percentage-calculator": {
    intro:
      "Work out percentages quickly: find X% of a number, find what percent one number is of another, or calculate a percentage increase or decrease. It is handy for discounts, salary raises, marks, VAT and everyday maths, and it shows the answer as soon as you enter the numbers.",
    howTo: [
      "Choose the type of calculation from the list.",
      "Enter the two values that the form asks for.",
      "Read the percentage or amount in the Result box.",
    ],
    benefits: [
      "X% of a number",
      "What percent one number is of another",
      "Percentage increase and decrease",
      "Free and instant",
    ],
    faqs: [
      { q: "How do I calculate X% of a number?", a: "Multiply the number by X and divide by 100. For example, 15% of 1,000 is 150." },
      { q: "How do I calculate percentage increase?", a: "Subtract the original value from the new value, divide by the original value, then multiply by 100. A positive result is an increase." },
      { q: "How do I calculate percentage decrease?", a: "Use the same formula. If the result is negative, the value has decreased by that percentage." },
      { q: "How do I work out a discount?", a: "Find the discount amount with \"What is X% of Y\", then subtract it from the price. For example, 20% off 500 SAR is a discount of 100 SAR, so you pay 400 SAR." },
    ],
    related: ["saudi-vat-calculator", "salary-calculator", "loan-emi-calculator"],
  },

  "loan-emi-calculator": {
    intro:
      "Estimate your monthly loan instalment (EMI) from the loan amount, the annual interest rate and the term in months. The calculator shows the monthly EMI, the total repayment and the total interest in SAR, using the standard reducing-balance formula. Use it to compare car, personal or home loan offers before you apply.",
    howTo: [
      "Enter the loan amount in SAR.",
      "Enter the annual interest rate and the loan term in months.",
      "Read the monthly EMI, total repayment and total interest.",
    ],
    benefits: [
      "Monthly EMI, total payment and total interest",
      "Standard reducing-balance formula",
      "Compare different amounts, rates and terms",
      "Free, no login",
    ],
    faqs: [
      { q: "How is EMI calculated?", a: "EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12) and n is the number of months." },
      { q: "Will my bank charge exactly this amount?", a: "Not necessarily. Banks may add processing fees or insurance, and some lenders quote a flat rate instead of a reducing-balance rate. Ask your lender for the full cost before you sign." },
      { q: "How does a longer loan term change the EMI?", a: "A longer term lowers the monthly EMI but increases the total interest you pay." },
      { q: "Can I use this for car and personal loans?", a: "Yes, for any loan that uses equal monthly instalments. Enter the amount, rate and months from your offer." },
    ],
    related: ["percentage-calculator", "salary-calculator", "saudi-vat-calculator"],
  },

  "saudi-vat-calculator": {
    intro:
      "Calculate Saudi VAT at 15% in seconds. Add VAT to a net price, or extract VAT from a VAT-inclusive total, and see the net amount, the VAT amount and the gross amount in SAR. The standard VAT rate in Saudi Arabia is 15%, and you can change the rate in the tool if you need a different calculation.",
    howTo: [
      "Choose \"Add VAT to net amount\" or \"Extract VAT from VAT-inclusive amount\".",
      "Enter the amount in SAR and keep the 15% rate, or change it.",
      "Read the net, VAT and gross amounts.",
    ],
    benefits: [
      "Add VAT or remove VAT",
      "Default 15% Saudi VAT rate",
      "Net, VAT and gross amounts in SAR",
      "Free, no login",
    ],
    faqs: [
      { q: "What is the VAT rate in Saudi Arabia?", a: "The standard rate is 15%, increased from 5% in July 2020. Always confirm the current rules with ZATCA." },
      { q: "How do I calculate 15% VAT?", a: "Multiply the net price by 0.15 to get the VAT. Add it to the net price for the total, which is the same as net × 1.15." },
      { q: "How do I remove VAT from a total?", a: "Divide the VAT-inclusive total by 1.15 to get the net amount. The VAT is the total minus the net amount." },
      { q: "Is this the same as the VAT Calculator?", a: "They do the same kind of calculation. This page defaults to the Saudi 15% rate, and the VAT Calculator is listed with the professional business tools." },
    ],
    related: ["vat-calculator", "percentage-calculator", "salary-calculator"],
  },

  // ───────────────────────── Converters (title + description used by [slug] page) ─────────────────────────
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Online – Free Image to PDF",
    description: "Convert JPG images to PDF online for free. Combine photos and scans into a single PDF in your browser, with no software to install.",
    intro:
      "Turn JPG photos and scans into a PDF file directly in your browser. It is useful when a website or office asks for one PDF instead of several images, for example ID copies, receipts, certificates and forms.",
    howTo: [
      "Select one or more JPG images from your device.",
      "Start the conversion.",
      "Download the PDF and check the page order and orientation before you upload or share it.",
    ],
    benefits: [
      "JPG to PDF in your browser",
      "Combine several images into one PDF",
      "No software or sign-up",
      "Useful for ID copies, receipts and forms",
    ],
    faqs: [
      { q: "How do I convert JPG to PDF?", a: "Select your JPG image, run the converter, then download the PDF." },
      { q: "Can I combine multiple JPG files into one PDF?", a: "Yes. Select several images and they are combined into a single PDF." },
      { q: "Will the image quality change?", a: "Quality depends on your original files. Use clear, high-resolution photos for sharp results." },
      { q: "Is this JPG to PDF converter free?", a: "Yes. It is free and works in your browser, with no login." },
    ],
    related: ["images-to-pdf", "pdf-to-jpg", "compress-pdf", "merge-pdf"],
  },

  "images-to-pdf": {
    title: "Images to PDF Converter – JPG, PNG & WebP to PDF",
    description: "Combine JPG, PNG and WebP images into one PDF online. A free browser-based images to PDF converter with no software to install.",
    intro:
      "Combine several images into a single PDF. This tool accepts JPG, PNG and WebP files, so you can put photos, screenshots and scanned pages into one document for sharing, printing or uploading.",
    howTo: [
      "Select your JPG, PNG or WebP images.",
      "Run the converter to build one PDF.",
      "Download the PDF and check that the pages are in the right order.",
    ],
    benefits: [
      "Supports JPG, PNG and WebP",
      "Many images in one PDF",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "Which image formats can I convert to PDF?", a: "You can use JPG, PNG and WebP images." },
      { q: "Can I put multiple pictures in one PDF?", a: "Yes. Select several images and they are combined into one PDF." },
      { q: "What is the difference between Images to PDF and JPG to PDF?", a: "JPG to PDF is for JPG files. Images to PDF also accepts PNG and WebP." },
      { q: "How can I make the PDF smaller?", a: "Use the Compress PDF tool on the result, or compress your images first with the Image Compressor." },
    ],
    related: ["jpg-to-pdf", "compress-pdf", "image-compressor", "merge-pdf"],
  },

  "txt-to-pdf": {
    title: "TXT to PDF Converter Online – Text File to PDF",
    description: "Convert plain text (.txt) files to PDF online for free. Turn notes, logs and simple documents into a PDF in your browser.",
    intro:
      "Convert plain text (.txt) files to PDF in your browser. It is helpful for turning notes, logs, scripts or simple documents into a PDF that is easy to share and print.",
    howTo: [
      "Choose a .txt file from your device.",
      "Run the converter.",
      "Download the PDF and review it before sharing.",
    ],
    benefits: [
      "TXT to PDF in your browser",
      "Good for notes, logs and simple documents",
      "No software to install",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I convert a text file to PDF?", a: "Choose your .txt file, run the converter, then download the PDF." },
      { q: "Will formatting be kept?", a: "A TXT file holds plain text only, so there is no bold text, images or fonts to carry over. The PDF contains the text." },
      { q: "Does it work with non-English text?", a: "If your text uses non-English characters, open the PDF and check that every character appears correctly." },
      { q: "Is the conversion free?", a: "Yes. It runs in your browser and does not need a login." },
    ],
    related: ["jpg-to-pdf", "merge-pdf", "compress-pdf", "pdf-to-word"],
  },

  "rotate-pdf": {
    title: "Rotate PDF Online – Free PDF Page Rotator",
    description: "Rotate PDF pages online for free. Fix sideways or upside-down scans and save a new, correctly oriented PDF in your browser.",
    intro:
      "Rotate PDF pages online when a scan or document opens sideways or upside down. Choose the rotation and save a corrected copy as a new PDF, all in your browser.",
    howTo: [
      "Choose the PDF you want to fix.",
      "Select how you want to rotate the pages.",
      "Download the new PDF and check the orientation.",
    ],
    benefits: [
      "Fix sideways and upside-down pages",
      "Saves a new PDF file",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I rotate a PDF?", a: "Upload the PDF, choose the rotation, then download the new file." },
      { q: "Will my original file change?", a: "The rotated version is saved as a new file, so keep your original if you need it." },
      { q: "Why does my scanned PDF open sideways?", a: "Scanners and phone cameras can save pages in the wrong orientation. Rotating the PDF fixes this." },
      { q: "Is rotating a PDF free here?", a: "Yes. It is free and needs no sign-up." },
    ],
    related: ["extract-pdf-pages", "merge-pdf", "split-pdf", "compress-pdf"],
  },

  "extract-pdf-pages": {
    title: "Extract Pages from PDF Online – Save Selected Pages",
    description: "Extract selected pages from a PDF and save them as a new PDF. A free online tool that runs in your browser, with no software needed.",
    intro:
      "Pull out only the pages you need from a PDF and save them as a new file. It is useful for sending a single form, a few contract pages or one section of a long report without sharing the whole document.",
    howTo: [
      "Choose the PDF.",
      "Enter the pages you want to keep.",
      "Download the new PDF with just those pages.",
    ],
    benefits: [
      "Keep only the pages you need",
      "Creates a new PDF",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I extract pages from a PDF?", a: "Upload the PDF, enter the page numbers you want, then download the new PDF." },
      { q: "Does this delete pages from my original PDF?", a: "No. A new PDF is created and your original stays as it is." },
      { q: "What is the difference between extracting and splitting?", a: "Extracting keeps the pages you choose in one new PDF. Use Split PDF if you want to divide a document into parts." },
      { q: "Can I extract pages from a large PDF?", a: "Processing happens in your browser, so very large files may be slow on older devices." },
    ],
    related: ["split-pdf", "remove-pdf-pages", "reorder-pdf-pages", "merge-pdf"],
  },

  "csv-to-json": {
    title: "CSV to JSON Converter Online – Free Data Converter",
    description: "Convert CSV data to JSON online for free. A quick browser-based converter for spreadsheet exports, APIs and developer workflows.",
    intro:
      "Convert CSV data into JSON in your browser. CSV is how spreadsheets and exports store tables, while JSON is the format most web apps and APIs expect. This tool helps you move data from one to the other quickly.",
    howTo: [
      "Add your CSV data.",
      "Run the conversion.",
      "Check the JSON result before using it in your project.",
    ],
    benefits: [
      "CSV to JSON in your browser",
      "Useful for spreadsheet exports and APIs",
      "No software to install",
      "Free, no login",
    ],
    faqs: [
      { q: "What is CSV to JSON used for?", a: "It moves spreadsheet or export data into web apps, APIs and databases that use JSON." },
      { q: "What should my CSV look like?", a: "Use consistent columns with a header row that names each column, so the JSON fields are meaningful." },
      { q: "Can I convert JSON back to CSV?", a: "Yes. Use the JSON to CSV converter." },
      { q: "Is my data sent to a server?", a: "This converter runs in your browser. Even so, avoid pasting passwords or secret keys into any online tool." },
    ],
    related: ["json-to-csv", "json-formatter", "xml-to-json", "json-to-xml"],
  },

  "json-to-csv": {
    title: "JSON to CSV Converter Online – Free Data Converter",
    description: "Convert JSON arrays to CSV online for free. Open the result in Excel or Google Sheets. A quick browser-based JSON to CSV converter.",
    intro:
      "Convert JSON arrays into CSV in your browser, so you can open the data in Excel, Google Sheets or any spreadsheet program. It is useful for turning API responses and exported records into tables.",
    howTo: [
      "Add your JSON data.",
      "Run the conversion.",
      "Download or copy the CSV and open it in your spreadsheet app.",
    ],
    benefits: [
      "JSON to CSV in your browser",
      "Opens in Excel and Google Sheets",
      "Good for API responses and exports",
      "Free, no login",
    ],
    faqs: [
      { q: "What kind of JSON works best?", a: "An array of objects with similar keys converts most cleanly into rows and columns." },
      { q: "Can I open the CSV in Excel?", a: "Yes. CSV files open in Excel, Google Sheets and other spreadsheet programs." },
      { q: "What about nested JSON?", a: "Deeply nested objects do not map neatly to flat rows and columns, so flatten them first or check the output carefully." },
      { q: "How do I check that my JSON is valid first?", a: "Paste it into the JSON Formatter & Validator to find syntax errors." },
    ],
    related: ["csv-to-json", "json-formatter", "json-to-xml", "xml-to-json"],
  },

  "xml-to-json": {
    title: "XML to JSON Converter Online – Free Data Converter",
    description: "Convert XML to JSON online for free. A fast browser-based XML to JSON converter for developers, APIs and data work.",
    intro:
      "Convert XML data into JSON in your browser. JSON is lighter and easier to use in JavaScript and modern APIs, so this is handy when you need to work with older XML feeds or exports.",
    howTo: [
      "Add your XML data.",
      "Run the conversion.",
      "Check the JSON result before using it.",
    ],
    benefits: [
      "XML to JSON in your browser",
      "Useful for feeds, exports and APIs",
      "No software to install",
      "Free, no login",
    ],
    faqs: [
      { q: "Why convert XML to JSON?", a: "JSON is shorter and easier to use in JavaScript and modern web APIs." },
      { q: "Does my XML need to be valid?", a: "Yes. Make sure the XML is well-formed, with every tag properly closed, before converting." },
      { q: "Can I convert JSON to XML?", a: "Yes. Use the JSON to XML converter." },
      { q: "How can I check the JSON output?", a: "Paste it into the JSON Formatter & Validator to read it and check the syntax." },
    ],
    related: ["json-to-xml", "json-formatter", "csv-to-json", "json-to-csv"],
  },

  "json-to-xml": {
    title: "JSON to XML Converter Online – Free Data Converter",
    description: "Convert JSON to XML online for free. A fast browser-based JSON to XML converter for developers and system integrations.",
    intro:
      "Convert JSON data into XML in your browser. Some older systems, feeds and integrations still expect XML, and this tool helps you produce it from JSON quickly.",
    howTo: [
      "Add your JSON data.",
      "Run the conversion.",
      "Check the XML result before using it.",
    ],
    benefits: [
      "JSON to XML in your browser",
      "Useful for integrations and legacy systems",
      "No software to install",
      "Free, no login",
    ],
    faqs: [
      { q: "Why convert JSON to XML?", a: "Some older systems, feeds and integrations still require XML instead of JSON." },
      { q: "Does my JSON need to be valid?", a: "Yes. Check it first in the JSON Formatter & Validator if you are not sure." },
      { q: "Can I convert XML back to JSON?", a: "Yes. Use the XML to JSON converter." },
      { q: "Is the conversion free?", a: "Yes. It runs in your browser and needs no login." },
    ],
    related: ["xml-to-json", "json-formatter", "json-to-csv", "csv-to-json"],
  },

  "json-formatter": {
    title: "JSON Formatter & Validator Online – Beautify JSON",
    description: "Format, validate and beautify JSON online for free. Find syntax errors and make JSON easy to read, in your browser.",
    intro:
      "Format and validate JSON in your browser. The tool adds indentation and line breaks so data is easy to read, and it flags syntax errors so you can fix them before using the JSON in an app or an API request.",
    howTo: [
      "Paste or add your JSON.",
      "Run the formatter to beautify and validate it.",
      "Fix any error shown, then copy the clean JSON.",
    ],
    benefits: [
      "Beautify and indent JSON",
      "Validate syntax and find errors",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "What does a JSON formatter do?", a: "It adds indentation and line breaks so JSON is easy to read, and it reports syntax errors." },
      { q: "How do I fix invalid JSON?", a: "Common causes are missing or extra commas, single quotes instead of double quotes, and keys that are not in double quotes." },
      { q: "Is it safe to paste my data here?", a: "The tool runs in your browser. Still, avoid pasting passwords or API keys into any online tool." },
      { q: "Can I convert JSON to CSV or XML?", a: "Yes. Use the JSON to CSV or JSON to XML converters." },
    ],
    related: ["json-to-csv", "csv-to-json", "xml-to-json", "json-to-xml"],
  },

  "jpg-to-webp": {
    title: "JPG to WebP Converter Online – Free Image Converter",
    description: "Convert JPG images to WebP online for free. Get smaller image files for faster websites, converted in your browser.",
    intro:
      "Convert JPG images to WebP, a modern format that usually gives smaller files at similar visual quality. Smaller images help web pages load faster, which is good for visitors and for search rankings.",
    howTo: [
      "Select your JPG image.",
      "Run the conversion.",
      "Download the WebP file and compare it with the original.",
    ],
    benefits: [
      "JPG to WebP in your browser",
      "Usually smaller files than JPG",
      "Good for faster websites",
      "Free, no login",
    ],
    faqs: [
      { q: "Why convert JPG to WebP?", a: "WebP files are usually smaller than JPG at similar quality, so pages load faster." },
      { q: "Do all browsers support WebP?", a: "All current major browsers support WebP. Some very old software and print services may not." },
      { q: "Will I lose image quality?", a: "WebP compression can be lossy, so keep your original JPG and compare the result." },
      { q: "Can I convert WebP back to JPG?", a: "Yes. Use the WebP to JPG converter." },
    ],
    related: ["webp-to-jpg", "png-to-webp", "image-compressor", "image-resizer"],
  },

  "png-to-webp": {
    title: "PNG to WebP Converter Online – Free Image Converter",
    description: "Convert PNG images to WebP online for free. Reduce file size for faster web pages, converted in your browser.",
    intro:
      "Convert PNG images to WebP to reduce file size for websites, apps and sharing. WebP supports transparency, so it is a common replacement for PNG graphics, logos and screenshots.",
    howTo: [
      "Select your PNG image.",
      "Run the conversion.",
      "Download the WebP file and check how it looks.",
    ],
    benefits: [
      "PNG to WebP in your browser",
      "Usually smaller files than PNG",
      "WebP supports transparency",
      "Free, no login",
    ],
    faqs: [
      { q: "Why convert PNG to WebP?", a: "WebP files are usually smaller than PNG, which helps web pages load faster." },
      { q: "Is transparency kept?", a: "WebP supports transparency, but check the result when your PNG has a transparent background." },
      { q: "Should I delete my original PNG?", a: "No. Keep the original in case you need lossless quality later." },
      { q: "Can I convert WebP to PNG?", a: "Yes. Use the WebP to PNG converter." },
    ],
    related: ["webp-to-png", "jpg-to-webp", "image-compressor", "image-resizer"],
  },

  "webp-to-jpg": {
    title: "WebP to JPG Converter Online – Free Image Converter",
    description: "Convert WebP images to JPG online for free. Make WebP pictures work in any app, email or print service, right in your browser.",
    intro:
      "Convert WebP images to JPG so they open almost anywhere. Some older apps, email programs and print services do not accept WebP, while JPG is supported on practically every device.",
    howTo: [
      "Select your WebP image.",
      "Run the conversion.",
      "Download the JPG and check it before sharing.",
    ],
    benefits: [
      "WebP to JPG in your browser",
      "JPG works almost everywhere",
      "Good for email, forms and printing",
      "Free, no login",
    ],
    faqs: [
      { q: "Why convert WebP to JPG?", a: "Some apps, forms and print services only accept JPG, while WebP is mainly a web format." },
      { q: "Does JPG support transparency?", a: "No. JPG cannot keep transparent areas, so check the result if your WebP has a transparent background." },
      { q: "Will the picture look different?", a: "It should look very similar, though JPG compression can slightly reduce quality." },
      { q: "Can I go from JPG back to WebP?", a: "Yes. Use the JPG to WebP converter." },
    ],
    related: ["jpg-to-webp", "webp-to-png", "image-compressor", "image-resizer"],
  },

  "webp-to-png": {
    title: "WebP to PNG Converter Online – Free Image Converter",
    description: "Convert WebP images to PNG online for free. Get a widely supported lossless image, converted in your browser.",
    intro:
      "Convert WebP images to PNG, a lossless format that supports transparency and works in almost every editor and app. Use it when you need to edit an image or when a tool does not accept WebP.",
    howTo: [
      "Select your WebP image.",
      "Run the conversion.",
      "Download the PNG and open it in your editor.",
    ],
    benefits: [
      "WebP to PNG in your browser",
      "PNG is lossless and supports transparency",
      "Opens in almost every editor",
      "Free, no login",
    ],
    faqs: [
      { q: "Why convert WebP to PNG?", a: "PNG is accepted by almost every image editor and app, and it keeps transparency." },
      { q: "Will the PNG be bigger than the WebP?", a: "Often yes, because PNG is lossless and WebP is usually more compact." },
      { q: "Is transparency preserved?", a: "PNG supports transparency, so a transparent WebP can stay transparent. Check the result to be sure." },
      { q: "Can I convert PNG to WebP?", a: "Yes. Use the PNG to WebP converter." },
    ],
    related: ["png-to-webp", "webp-to-jpg", "image-compressor", "image-resizer"],
  },

  "image-merger": {
    title: "Merge Images Online – Combine Images into One",
    description: "Merge multiple images vertically or horizontally into one picture. A free image merger for JPG, PNG and WebP that runs in your browser.",
    intro:
      "Combine several images into a single picture, stacked vertically or placed side by side. It works with JPG, PNG and WebP, and is useful for before-and-after photos, receipts, screenshots, or the front and back of an ID card.",
    howTo: [
      "Select the images you want to combine.",
      "Choose vertical or horizontal layout.",
      "Download the merged image.",
    ],
    benefits: [
      "Merge vertically or horizontally",
      "Supports JPG, PNG and WebP",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I combine two photos into one?", a: "Select both images, choose side by side or stacked, then download the merged picture." },
      { q: "Which image formats can I merge?", a: "JPG, PNG and WebP." },
      { q: "Can I put the front and back of an ID in one image?", a: "Yes. Merge the two photos vertically or horizontally to get a single image." },
      { q: "Can I turn the merged image into a PDF?", a: "Yes. Use the Images to PDF converter." },
    ],
    related: ["images-to-pdf", "image-resizer", "image-compressor", "jpg-to-pdf"],
  },

  "image-compressor": {
    title: "Image Compressor Online – Reduce JPG, PNG & WebP Size",
    description: "Compress images online for free. Reduce JPG, PNG and WebP file size for uploads and faster websites, right in your browser.",
    intro:
      "Compress images in your browser to reduce their file size. Smaller images are easier to email, quicker to upload to forms and portals that have size limits, and help web pages load faster. It supports JPG, PNG and WebP.",
    howTo: [
      "Select your image.",
      "Run the compressor.",
      "Download the smaller file and compare it with the original.",
    ],
    benefits: [
      "Reduce JPG, PNG and WebP file size",
      "Helps with upload size limits",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I reduce an image's file size?", a: "Select the image, run the compressor, then download the smaller version." },
      { q: "Will compression reduce quality?", a: "Stronger compression gives smaller files but can reduce quality, so compare the result with the original." },
      { q: "Why compress images for a website?", a: "Smaller images load faster, which improves the experience for visitors on mobile networks." },
      { q: "Can I also change the dimensions?", a: "Yes. Use the Image Resizer to set a custom width and height." },
    ],
    related: ["image-resizer", "jpg-to-webp", "png-to-webp", "compress-pdf"],
  },

  "image-resizer": {
    title: "Image Resizer Online – Resize JPG, PNG & WebP",
    description: "Resize images to custom dimensions online for free. Change the width and height of JPG, PNG and WebP files in your browser.",
    intro:
      "Resize images to the exact width and height you need, for forms, profile photos, websites or social media. It works with JPG, PNG and WebP and runs in your browser.",
    howTo: [
      "Select your image.",
      "Enter the new width and height.",
      "Download the resized image.",
    ],
    benefits: [
      "Custom width and height",
      "Supports JPG, PNG and WebP",
      "Runs in your browser",
      "Free, no login",
    ],
    faqs: [
      { q: "How do I resize an image to specific pixels?", a: "Select the image, enter the width and height in pixels, then download the result." },
      { q: "Will resizing affect quality?", a: "Making an image much larger than the original can make it look blurry. Scaling down is safer." },
      { q: "How do I avoid a stretched image?", a: "Change width and height by the same proportion so the shape of the picture stays the same." },
      { q: "How can I also reduce the file size?", a: "Use the Image Compressor after resizing." },
    ],
    related: ["image-compressor", "image-merger", "jpg-to-webp", "images-to-pdf"],
  },
};
