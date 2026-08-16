"use client";

import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "#apps", label: "Apps" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About Us" },
  { href: "#apps", label: "Our Work" },
  { href: "#contact", label: "Contact Us" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="mobile-nav-panel">
          {LINKS.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="mailto:abuman.moa@gmail.com"
            className="btn btn-gold mobile-nav-cta"
            onClick={() => setOpen(false)}
          >
            Get in Touch
          </a>
        </div>
      )}
    </div>
  );
}
