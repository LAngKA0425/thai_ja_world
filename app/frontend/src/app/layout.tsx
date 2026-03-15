import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const safeMetadataBase = (() => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = raw
    ? raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`
    : "https://taeja.world";

  try {
    return new URL(candidate);
  } catch {
    return new URL("https://taeja.world");
  }
})();

export const metadata: Metadata = {
  title: {
    default: "태국에 살자 | 태자 커뮤니티",
    template: "%s | 태자 월드",
  },
  description: "태국 한인들의 사건·사고, 번개장터, 커뮤니티를 한 번에. 태국 한인 생활 정보, 맛집, 마사지, 구인구직, 모임.",
  manifest: "/manifest.json",
  metadataBase: safeMetadataBase,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "태자 월드",
    title: "태국에 살자 | 태자 커뮤니티",
    description: "태국 한인들의 사건·사고, 번개장터, 커뮤니티를 한 번에",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "태국에 살자 | 태자 커뮤니티",
    description: "태국 한인들의 사건·사고, 번개장터, 커뮤니티를 한 번에",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
    languages: {
      "ko": "/",
      "th": "/th",
      "en": "/en",
    },
  },
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
