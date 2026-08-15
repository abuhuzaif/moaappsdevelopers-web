import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOA Apps Developer's",
  description: "Mobile apps and digital tools built to help people around the world.",
  metadataBase: new URL("https://moaappsdevelopers.com"),
  openGraph: {
    title: "MOA Apps Developer's",
    description: "Mobile apps and digital tools built to help people around the world.",
    type: "website",
    url: "https://moaappsdevelopers.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
