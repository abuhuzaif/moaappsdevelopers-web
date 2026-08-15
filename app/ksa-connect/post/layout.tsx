import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Listing — KSA-Connect",
  robots: { index: false, follow: true },
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
