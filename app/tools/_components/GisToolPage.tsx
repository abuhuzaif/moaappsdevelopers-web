"use client";

import { useMemo, useState } from "react";

type ToolConfig = { title: string; description: string; inputLabel: string; accept: string; outputName: string; mode: "file" | "coordinate"; fromLabel?: string; toLabel?: string };

const CONFIG: Record<string, ToolConfig> = {
  "shp-to-kml": { title: "SHP → KML", description: "Convert ESRI Shapefile data to KML for Google Earth and mapping workflows.", inputLabel: "Shapefile package (.zip)", accept: ".zip,.shp,.shx,.dbf,.prj", outputName: "converted.kml", mode: "file" },
  "kml-to-shp": { title: "KML → SHP", description: "Convert KML vector layers to an ESRI Shapefile package.", inputLabel: "KML file", accept: ".kml", outputName: "converted-shapefile.zip", mode: "file" },
  "shp-to-geojson": { title: "SHP → GeoJSON", description: "Convert ESRI Shapefile data to GeoJSON for web maps and GIS applications.", inputLabel: "Shapefile package (.zip)", accept: ".zip,.shp,.shx,.dbf,.prj", outputName: "converted.geojson", mode: "file" },
  "geojson-to-kml": { title: "GeoJSON → KML", description: "Convert GeoJSON features to KML.", inputLabel: "GeoJSON file", accept: ".geojson,.json", outputName: "converted.kml", mode: "file" },
  "csv-to-kml": { title: "CSV → KML", description: "Convert coordinate CSV data to KML. CSV should contain latitude/longitude columns.", inputLabel: "CSV file", accept: ".csv", outputName: "converted.kml", mode: "file" },
  "kml-to-csv": { title: "KML → CSV", description: "Export KML point coordinates and basic attributes to CSV.", inputLabel: "KML file", accept: ".kml", outputName: "converted.csv", mode: "file" },
  "dxf-to-kml": { title: "DXF → KML", description: "Convert CAD/DXF geometry to georeferenced KML using a reference location and CAD drawing units.", inputLabel: "DXF file", accept: ".dxf", outputName: "converted.kml", mode: "file" },
  "kml-to-dxf": { title: "KML → DXF", description: "Convert supported KML vector geometry to DXF.", inputLabel: "KML file", accept: ".kml", outputName: "converted.dxf", mode: "file" },
  "latlon-to-utm": { title: "Lat/Lon → UTM", description: "Convert latitude and longitude to UTM coordinates.", inputLabel: "", accept: "", outputName: "", mode: "coordinate", fromLabel: "Latitude / Longitude", toLabel: "UTM" },
  "utm-to-latlon": { title: "UTM → Lat/Lon", description: "Convert UTM coordinates back to latitude and longitude.", inputLabel: "", accept: "", outputName: "", mode: "coordinate", fromLabel: "UTM", toLabel: "Latitude / Longitude" },
};

function utmFromLatLon(lat: number, lon: number) {
  const a = 6378137, eccSquared = 0.00669438, k0 = 0.9996, zone = Math.floor((lon + 180) / 6) + 1, lonOrigin = (zone - 1) * 6 - 180 + 3;
  const latRad = (lat * Math.PI) / 180, lonRad = (lon * Math.PI) / 180, lonOriginRad = (lonOrigin * Math.PI) / 180;
  const N = a / Math.sqrt(1 - eccSquared * Math.sin(latRad) ** 2), T = Math.tan(latRad) ** 2, C = (eccSquared / (1 - eccSquared)) * Math.cos(latRad) ** 2, A = Math.cos(latRad) * (lonRad - lonOriginRad);
  const M = a * ((1 - eccSquared / 4 - (3 * eccSquared ** 2) / 64 - (5 * eccSquared ** 3) / 256) * latRad - ((3 * eccSquared) / 8 + (3 * eccSquared ** 2) / 32 + (45 * eccSquared ** 3) / 1024) * Math.sin(2 * latRad) + ((15 * eccSquared ** 2) / 256 + (45 * eccSquared ** 3) / 1024) * Math.sin(4 * latRad) - ((35 * eccSquared ** 3) / 3072) * Math.sin(6 * latRad));
  const easting = k0 * N * (A + ((1 - T + C) * A ** 3) / 6 + ((5 - 18 * T + T ** 2 + 72 * C - 58 * (eccSquared / (1 - eccSquared))) * A ** 5) / 120) + 500000;
  let northing = k0 * (M + N * Math.tan(latRad) * (A ** 2 / 2 + ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 + ((61 - 58 * T + T ** 2 + 600 * C - 330 * (eccSquared / (1 - eccSquared))) * A ** 6) / 720));
  let hemisphere = "N"; if (lat < 0) { northing += 10000000; hemisphere = "S"; }
  return { zone, hemisphere, easting, northing };
}
function latLonFromUtm(easting: number, northingInput: number, zone: number, hemisphere: string) {
  const a = 6378137, eccSquared = 0.00669438, k0 = 0.9996, e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  let northing = northingInput; const x = easting - 500000; if (hemisphere.toUpperCase() === "S") northing -= 10000000;
  const M = northing / k0, mu = M / (a * (1 - eccSquared / 4 - (3 * eccSquared ** 2) / 64 - (5 * eccSquared ** 3) / 256));
  const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1) ** 2), T1 = Math.tan(phi1) ** 2, C1 = (eccSquared / (1 - eccSquared)) * Math.cos(phi1) ** 2, R1 = (a * (1 - eccSquared)) / (1 - eccSquared * Math.sin(phi1) ** 2) ** 1.5, D = x / (N1 * k0);
  const lat = phi1 - (N1 * Math.tan(phi1)) / R1 * (D ** 2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (eccSquared / (1 - eccSquared))) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (eccSquared / (1 - eccSquared)) - 3 * C1 ** 2) * D ** 6 / 720);
  const lonOrigin = (zone - 1) * 6 - 180 + 3, lon = lonOrigin + ((D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (eccSquared / (1 - eccSquared)) + 24 * T1 ** 2) * D ** 5 / 120) / Math.cos(phi1)) * (180 / Math.PI);
  return { latitude: (lat * 180) / Math.PI, longitude: lon };
}
function downloadText(text: string, filename: string, type: string) { const blob = new Blob([text], { type }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

export default function GisToolPage({ slug }: { slug: string }) {
  const config = CONFIG[slug];
  const [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const [lat, setLat] = useState(""), [lon, setLon] = useState(""), [zone, setZone] = useState(""), [hemisphere, setHemisphere] = useState("N"), [easting, setEasting] = useState(""), [northing, setNorthing] = useState("");
  const [originLat, setOriginLat] = useState("24.7136"), [originLon, setOriginLon] = useState("46.6753"), [cadUnit, setCadUnit] = useState("in");
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const isValidSlug = Boolean(config);
  const coordinateResult = useMemo(() => {
    if (slug === "latlon-to-utm" && lat && lon) { const la = Number(lat), lo = Number(lon); if (Number.isFinite(la) && Number.isFinite(lo) && la >= -80 && la <= 84 && lo >= -180 && lo <= 180) return utmFromLatLon(la, lo); }
    if (slug === "utm-to-latlon" && easting && northing && zone) { const e = Number(easting), n = Number(northing), z = Number(zone); if (Number.isFinite(e) && Number.isFinite(n) && Number.isFinite(z) && z >= 1 && z <= 60 && e >= 100000 && e <= 900000 && n >= 0 && n <= 10000000) return latLonFromUtm(e, n, z, hemisphere); }
    return null;
  }, [slug, lat, lon, zone, hemisphere, easting, northing]);
  if (!isValidSlug) return <main style={{padding:40}}>Tool not found.</main>;

  async function convertFile() {
    if (!file) { setMessage("Please select a file first."); return; }
    if (slug === "dxf-to-kml") {
      const la = Number(originLat), lo = Number(originLon);
      if (!Number.isFinite(la) || la < -80 || la > 84 || !Number.isFinite(lo) || lo < -180 || lo > 180) { setMessage("Please enter a valid reference latitude and longitude."); return; }
    }
    setBusy(true); setMessage("");
    try {
      const form = new FormData(); form.append("file", file); form.append("tool", slug);
      if (slug === "dxf-to-kml") { form.append("originLat", originLat); form.append("originLon", originLon); form.append("unit", cadUnit); }
      const res = await fetch("/api/gis/convert", { method: "POST", body: form });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || "Conversion failed."); }
      const blob = await res.blob(), disposition = res.headers.get("content-disposition") || "", match = disposition.match(/filename="?([^\"]+)"?/i), name = match?.[1] || config.outputName;
      const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
      setMessage("Conversion completed. Your download should start automatically.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Conversion failed."); } finally { setBusy(false); }
  }
  const shellStyle: React.CSSProperties = { maxWidth: 1120, margin: "0 auto" };

  return (
    <main style={{minHeight:"100vh",background:"#fbfaf7",color:"#0b1719",padding:"0 20px 70px",fontFamily:"Inter, Arial, sans-serif"}}><div style={shellStyle}>
      <div style={{padding:"28px 0 18px",fontSize:13,color:"#5d6a68"}}><a href="/" style={{color:"#005744",fontWeight:800,textDecoration:"none"}}>MYKSA CONNECT</a>{" › "}<a href="/tools/" style={{color:"#005744",fontWeight:800,textDecoration:"none"}}>Saudi Expat Tools</a>{" › "}{config.title}</div>
      <section style={{textAlign:"center",padding:"24px 20px 34px"}}><div style={{color:"#005744",fontSize:12,fontWeight:900,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>🗺️ GIS / ENGINEERING TOOL</div><h1 style={{fontFamily:"Plus Jakarta Sans,Inter,Arial,sans-serif",fontSize:"clamp(34px,5vw,48px)",lineHeight:1.08,margin:"0 0 12px",color:"#06172a"}}>🗺️ {config.title}</h1><p style={{margin:"0 auto",color:"#5d6a68",fontSize:16,lineHeight:1.7,maxWidth:760}}>{config.description} Free, fast and designed for GIS and engineering workflows.</p></section>
      <section style={{borderRadius:18,overflow:"hidden",background:"#fff",boxShadow:"0 10px 30px rgba(6,23,42,.08)",border:"1px solid #dfe7e3"}}><img src="/images/myksa-tools-banner.png" alt="MYKSA CONNECT Saudi Expat Tools" style={{width:"100%",height:"auto",display:"block",objectFit:"contain"}}/></section>
      <section style={{marginTop:28,background:"#fff",border:"1px solid #dfe7e3",borderRadius:20,padding:26,boxShadow:"0 8px 25px rgba(6,23,42,.06)"}}>
        {config.mode === "coordinate" ? <>
          <h2 style={{margin:"0 0 6px",color:"#06172a"}}>{config.title}</h2><p style={{margin:"0 0 22px",color:"#65716f",fontSize:14}}>Enter the coordinates below. The calculation runs directly in your browser.</p>
          {slug === "latlon-to-utm" ? <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:16}}><Field label="Latitude" value={lat} onChange={setLat} placeholder="e.g. 24.7136"/><Field label="Longitude" value={lon} onChange={setLon} placeholder="e.g. 46.6753"/></div> : <><div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:16}}><Field label="Easting (m)" value={easting} onChange={setEasting} placeholder="e.g. 466000"/><Field label="Northing (m)" value={northing} onChange={setNorthing} placeholder="e.g. 2735000"/><Field label="UTM Zone (1–60)" value={zone} onChange={setZone} placeholder="e.g. 38"/></div><div style={{marginTop:16}}><label style={labelStyle}>Hemisphere</label><select value={hemisphere} onChange={e=>setHemisphere(e.target.value)} style={inputStyle}><option value="N">Northern</option><option value="S">Southern</option></select></div></>}
          {coordinateResult && <div style={{marginTop:22,padding:20,borderRadius:16,background:"#eef7f3",border:"1px solid #cfe4dc"}}>{slug === "latlon-to-utm" ? (()=>{const r=coordinateResult as {zone:number;hemisphere:string;easting:number;northing:number};return <div style={gridResult}><Result label="UTM Zone" value={`${r.zone}${r.hemisphere}`}/><Result label="Easting" value={Number(r.easting).toFixed(3)+" m"}/><Result label="Northing" value={Number(r.northing).toFixed(3)+" m"}/></div>})() : (()=>{const r=coordinateResult as {latitude:number;longitude:number};return <div style={gridResult}><Result label="Latitude" value={Number(r.latitude).toFixed(8)+"°"}/><Result label="Longitude" value={Number(r.longitude).toFixed(8)+"°"}/></div>})()}</div>}
        </> : <>
          <h2 style={{margin:"0 0 6px",color:"#06172a"}}>{config.inputLabel}</h2>
          {slug === "dxf-to-kml" && <div style={{marginBottom:20,padding:18,borderRadius:14,background:"#eef7f3",border:"1px solid #cfe4dc"}}>
            <div style={{fontWeight:900,color:"#005744",marginBottom:6}}>Georeference your CAD drawing</div>
            <div style={{fontSize:13,color:"#5d6a68",lineHeight:1.6,marginBottom:14}}>DXF drawings normally use local CAD coordinates. Enter the real-world location that represents the drawing origin (X=0, Y=0), then select the units used by the drawing.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:14}}><Field label="Reference Latitude" value={originLat} onChange={setOriginLat} placeholder="e.g. 24.7136"/><Field label="Reference Longitude" value={originLon} onChange={setOriginLon} placeholder="e.g. 46.6753"/></div>
            <div style={{marginTop:14}}><label style={labelStyle}>CAD drawing unit</label><select value={cadUnit} onChange={e=>setCadUnit(e.target.value)} style={inputStyle}><option value="in">Inches — common for imperial drawings</option><option value="ft">Feet</option><option value="m">Meters</option></select></div>
            <div style={{marginTop:10,fontSize:12,color:"#65716f"}}>Default test location: Riyadh. Change it to the actual survey/site reference before using the KML for real GIS work.</div>
          </div>}
          <p style={{margin:"0 0 18px",color:"#65716f",fontSize:14}}>{slug === "dxf-to-kml" ? "Upload an ASCII DXF containing supported CAD geometry such as LINE, LWPOLYLINE, CIRCLE, ARC, POINT or 3DFACE." : "Select your source file. For Shapefile conversion, upload a ZIP containing the complete .shp, .shx, .dbf and .prj package when available."}</p>
          <input type="file" accept={config.accept} onChange={e=>setFile(e.target.files?.[0] || null)} style={{display:"block",width:"100%",padding:18,border:"1px dashed #9bbab1",borderRadius:14,background:"#fbfaf7"}}/>
          <button onClick={convertFile} disabled={busy} style={{marginTop:18,border:0,borderRadius:12,padding:"13px 20px",background:busy?"#9bbab1":"#005744",color:"#fff",fontWeight:800,cursor:busy?"wait":"pointer"}}>{busy?"Converting…":"Convert & Download"}</button>
          {message && <div style={{marginTop:16,padding:14,borderRadius:12,background:message.toLowerCase().includes("completed")?"#eef7f3":"#fff9e8",border:"1px solid #f0dfaa",color:"#5d5231",fontSize:13,lineHeight:1.55}}>{message}</div>}
          <div style={{marginTop:18,padding:14,borderRadius:12,background:"#f4f8f6",color:"#5d6a68",fontSize:12,lineHeight:1.55}}>{slug === "dxf-to-kml" ? "The server parses the DXF geometry and georeferences it from the supplied origin using WGS84/UTM math. Your DXF is not sent to a third-party CAD conversion service." : "File conversion uses the MYKSA server-side GIS conversion endpoint."}</div>
        </>}
      </section>
      <section style={{marginTop:22,background:"#fff",border:"1px solid #dfe7e3",borderRadius:18,padding:22}}><h2 style={{fontSize:21,margin:"0 0 8px",color:"#06172a"}}>How to Use</h2><ol style={{margin:0,paddingLeft:22,color:"#5d6a68",fontSize:14,lineHeight:1.8}}><li>Open the tool and enter or select your source data.</li><li>For DXF → KML, enter the real-world location for the CAD drawing origin and select the CAD units.</li><li>Upload the supported file.</li><li>Click <strong>Convert &amp; Download</strong>.</li><li>Check the downloaded output in Google Earth or your GIS software.</li></ol></section>
      <section style={{marginTop:28,background:"#fff",border:"1px solid #dfe7e3",borderRadius:18,padding:22}}><h2 style={{fontSize:22,margin:"0 0 16px",color:"#06172a"}}>More GIS / Engineering Tools</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>{Object.entries(CONFIG).filter(([key])=>key!==slug).map(([key,tool])=><a key={key} href={`/tools/${key}/`} style={{textDecoration:"none",color:"#0b1719",border:"1px solid #dfe7e3",borderRadius:12,padding:"14px 16px",background:"#fff",fontSize:13,fontWeight:800}}><span style={{display:"block",fontSize:20,marginBottom:6}}>🗺️</span>{tool.title}</a>)}</div></section>
      <div style={{marginTop:28,textAlign:"center",fontSize:12,color:"#6a7673"}}><a href="/tools/" style={{color:"#005744",fontWeight:800,textDecoration:"none"}}>← Back to GIS / Engineering Tools</a></div>
    </div></main>
  );
}

const labelStyle: React.CSSProperties = {display:"block",fontSize:13,fontWeight:800,color:"#0b1719",marginBottom:7};
const inputStyle: React.CSSProperties = {width:"100%",boxSizing:"border-box",border:"1px solid #dfe7e3",borderRadius:10,padding:"12px 13px",fontSize:14,background:"#fff",color:"#0b1719"};
const gridResult: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14};
function Field({label,value,onChange,placeholder}:{label:string,value:string,onChange:(v:string)=>void,placeholder:string}) { return <label style={{display:"block"}}><span style={labelStyle}>{label}</span><input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/></label>; }
function Result({label,value}:{label:string,value:string}) { return <div><div style={{fontSize:11,color:"#5d6a68",fontWeight:800,textTransform:"uppercase",letterSpacing:.6}}>{label}</div><div style={{marginTop:4,fontSize:20,fontWeight:900,color:"#005744"}}>{value}</div></div>; }
