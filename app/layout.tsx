import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOA Apps Developer's",
  description: "Mobile apps built for Saudi Arabia's community — by MOA Apps Developer's.",
  metadataBase: new URL("https://moaappsdevelopers.com"),
  openGraph: {
    title: "MOA Apps Developer's",
    description: "Mobile apps built for Saudi Arabia's community.",
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
      <body>{children}</body>
    </html>
  );
}
