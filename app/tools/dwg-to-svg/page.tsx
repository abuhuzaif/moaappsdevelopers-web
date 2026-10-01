import type { Metadata } from "next";
import CadToolPage from "../_components/CadToolPage";

export const metadata: Metadata = {
  title: "DWG to SVG Converter Online | MYKSA CONNECT",
  description: "Convert AutoCAD DWG drawings to SVG online with MYKSA CONNECT.",
  alternates: { canonical: "/tools/dwg-to-svg/" },
};

export default function Page() {
  return <CadToolPage slug="dwg-to-svg" title="DWG → SVG" description="Convert AutoCAD DWG drawings to scalable SVG graphics online." input="DWG" output="SVG" />;
}
