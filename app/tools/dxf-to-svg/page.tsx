import type { Metadata } from "next";
import CadToolPage from "../_components/CadToolPage";

export const metadata: Metadata = {
  title: "DXF to SVG Converter Online | MYKSA CONNECT",
  description: "Convert DXF drawings to SVG online with MYKSA CONNECT.",
  alternates: { canonical: "/tools/dxf-to-svg/" },
};

export default function Page() {
  return <CadToolPage slug="dxf-to-svg" title="DXF → SVG" description="Convert DXF drawings to scalable SVG graphics online." input="DXF" output="SVG" />;
}
