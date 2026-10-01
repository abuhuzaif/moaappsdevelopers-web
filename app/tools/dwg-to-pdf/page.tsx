import type { Metadata } from "next";
import CadToolPage from "../_components/CadToolPage";

export const metadata: Metadata = {
  title: "DWG to PDF Converter Online | MYKSA CONNECT",
  description: "Convert AutoCAD DWG drawings to PDF online with MYKSA CONNECT.",
  alternates: { canonical: "/tools/dwg-to-pdf/" },
};

export default function Page() {
  return <CadToolPage slug="dwg-to-pdf" title="DWG → PDF" description="Convert AutoCAD DWG drawings to PDF online for sharing and printing." input="DWG" output="PDF" />;
}
