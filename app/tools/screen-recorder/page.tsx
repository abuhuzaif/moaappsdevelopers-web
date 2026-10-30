import type { Metadata } from "next";
import ScreenRecorder from "./ScreenRecorder";

export const metadata: Metadata = {
  title: "Free Online Screen Recorder – No Watermark, No Signup | MYKSA Connect",
  description:
    "Record your screen, voice, system audio and webcam right in your browser. No install, no signup, no watermark, no time limit. Your video stays on your computer.",
  openGraph: {
    title: "Free Online Screen Recorder – No Watermark, No Signup",
    description: "Record your screen, voice and webcam in your browser. Free, private, no install.",
    type: "website",
  },
};

export default function ScreenRecorderPage() {
  return <ScreenRecorder />;
}
