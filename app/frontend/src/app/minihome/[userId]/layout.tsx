import type { Metadata } from "next";

interface Props {
  params: { userId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taeja.world";
  const canonicalUrl = `${siteUrl}/minihome/${params.userId}`;

  return {
    title: "미니홈피",
    description: "태자 월드 미니홈피 - 나만의 공간을 꾸며보세요",
    openGraph: {
      title: "미니홈피 | 태자 월드",
      description: "태자 월드 미니홈피 - 나만의 공간을 꾸며보세요",
      url: canonicalUrl,
      type: "profile",
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function MinihomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
