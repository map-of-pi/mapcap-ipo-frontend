import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import PiInit from "@/pi/PiInit";

export const metadata: Metadata = {
  title: "MapCapIPO",
  description: "MapCap IPO — Pi Network community investment app",
  icons: {
    icon: "/token-logo.png",
    apple: "/token-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
        <PiInit />
        {children}
      </body>
    </html>
  );
}
