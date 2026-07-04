import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "iGenius Classroom Booking",
  description: "ระบบจองห้องเรียน iGenius โรงเรียนสอนภาษา เชียงใหม่",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
