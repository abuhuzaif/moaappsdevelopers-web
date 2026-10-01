import type { Metadata } from "next";
import CadToolPage from "../_components/CadToolPage";

export const metadata: Metadata = {
  title: "DWG to DXF Converter Online | MYKSA CONNECT",
  description: "Convert AutoCAD DWG drawings to DXF online with MYKSA CONNECT.",
  alternates: { canonical: "/tools/dwg-to-dxf/" },
};

export default function Page() {
  return <CadToolPage slug="dwg-to-dxf" title="DWG → DXF" description="Convert AutoCAD DWG drawings to DXF format online." input="DWG" output="DXF" />;
}
