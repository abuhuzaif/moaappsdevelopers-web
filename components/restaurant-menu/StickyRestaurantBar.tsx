"use client";

// When the big cover banner scrolls out of view, a slim bar slides in at the top
// (logo + name + phone + WhatsApp). The menu's sticky search/category bar moves
// down under it via the --rm-header-h CSS variable.

import { useEffect, useRef, useState } from "react";
import "./restaurant-menu.css";

const BAR_H = 56;

export default function StickyRestaurantBar({
  name,
  logoUrl,
  phone,
  whatsapp,
}: {
  name: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const wa = whatsapp?.replace(/[^0-9]/g, "");

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--rm-header-h", show ? `${BAR_H}px` : "0px");
    return () => {
      root.style.removeProperty("--rm-header-h");
    };
  }, [show]);

  return (
    <>
      <div ref={sentinel} aria-hidden style={{ height: 1 }} />
      <div className={`rm-topbar${show ? " is-on" : ""}`} aria-hidden={!show} style={{ height: BAR_H }}>
        <div className="rm-topbar-inner">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="rm-topbar-logo" src={logoUrl} alt="" width={36} height={36} />
          )}
          <span className="rm-topbar-name">{name}</span>
          {phone && (
            <a className="rm-topbar-phone" href={`tel:${phone}`} tabIndex={show ? 0 : -1}>
              📞 <span dir="ltr">{phone}</span>
            </a>
          )}
          {wa && (
            <a
              className="rm-topbar-wa"
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              tabIndex={show ? 0 : -1}
            >
              <svg viewBox="0 0 32 32" width="20" height="20" aria-hidden>
                <path
                  fill="currentColor"
                  d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.2.6 4.4 1.7 6.3L3 29l7.3-1.9c1.8 1 3.8 1.5 5.8 1.5 7 0 12.7-5.7 12.7-12.6C28.8 8.6 23 3 16 3zm0 23.1c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.3 1.1 1.2-4.2-.3-.4c-1.1-1.7-1.6-3.6-1.6-5.6C5.2 9.8 10 5.1 16 5.1s10.7 4.7 10.7 10.5S21.9 26.1 16 26.1zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8 0 1.6 1.2 3.2 1.4 3.4.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </>
  );
}
