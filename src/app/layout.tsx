import type { Metadata, Viewport } from "next";
import { Unbounded, Space_Grotesk } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "fittrack — five taps a day",
  description: "Log five daily habits in under five seconds. Track weekly streaks.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="flex min-h-full justify-center bg-[#0a0813]">{children}</body>
    </html>
  );
}
