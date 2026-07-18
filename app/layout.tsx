import type { Metadata, Viewport } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { SITE } from "@/lib/data";
// import NewsletterPopup from "@/components/NewsletterPopup";
import Script from "next/script";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Trade Press for Procurement & Supply Chain Leaders`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: SITE.baseKeywords,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Trade Press for Procurement & Supply Chain Leaders`,
    description: SITE.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // SITE.twitter is currently "@" in lib/data.ts — not a valid handle.
    // Set it to your real handle (e.g. "@apscmag") or omit site/creator
    // entirely until you have one; an invalid handle can cause Twitter's
    // card validator to reject the card outright.
    site: SITE.twitter,
    creator: SITE.twitter,
    title: `${SITE.name} — Trade Press for Procurement & Supply Chain Leaders`,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/assets/logo.png", type: "image/png" }],
    shortcut: ["/assets/logo.png"],
    apple: [{ url: "/assets/logo.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0E1A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE.name,
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/assets/logo.png`,
      width: 512,
      height: 512,
    },
    description: SITE.description,
    // Replace with your real profile URLs once you have them. Linking to
    // bare platform homepages (https://linkedin.com etc.) actively hurts
    // entity disambiguation rather than helping it — omit until real.
    sameAs: [] as string[],
  };

  return (
    <html lang="en" className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main id="main">{children}</main>
        {/* <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" /> */}
        {/* <NewsletterPopup /> */}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}