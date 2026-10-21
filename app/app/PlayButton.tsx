"use client";

import type { CSSProperties, ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function PlayButton({ href, style, children }: { href: string; style: CSSProperties; children: ReactNode }) {
  return (
    <a href={href} style={style} onClick={() => track("app_download_click", { method: "play_button" })}>
      {children}
    </a>
  );
}
