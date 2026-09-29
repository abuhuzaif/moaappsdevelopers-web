"use client";
import { useEffect, useState } from "react";

export default function SignatureImage({ src, alt, className, style, onLoad }: { src:string; alt:string; className?:string; style?:React.CSSProperties; onLoad?:()=>void }) {
  const [clean, setClean] = useState<string>(src);
  useEffect(()=>{setClean(src);},[src]);
  return <img src={clean} alt={alt} className={className} style={style} onLoad={onLoad}/>;
}
