import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import Script from "next/script";

import { Providers } from "@/components/providers";
import { business } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: business.name,
    template: `%s | ${business.shortName}`,
  },
  description: business.description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: business.name,
    title: business.name,
    description: business.description,
  },
  twitter: {
    card: "summary_large_image",
    title: business.name,
    description: business.description,
  },
};

const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        {cfBeaconToken && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
