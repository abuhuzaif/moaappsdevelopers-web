import type { Metadata } from "next";
import CadToolPage from "../_components/CadToolPage";

export const metadata: Metadata = {
  title: "PDF to DXF Converter Online | MYKSA CONNECT",
  description: "Convert vector PDF drawings to AutoCAD DXF format online with MYKSA CONNECT.",
  alternates: { canonical: "/tools/pdf-to-dxf/" },
};

export default function Page() {
  return (
    <CadToolPage
      slug="pdf-to-dxf"
      title="PDF → DXF"
      description="Convert vector PDF drawings to DXF format online."
      input="PDF"
      output="DXF"
    />
  );
}
