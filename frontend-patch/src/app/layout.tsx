import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "태국에 살자 | 태자 커뮤니티",
  description: "태국 한인들의 사건·사고, 번개장터, 커뮤니티를 한 번에",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FFE812",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
