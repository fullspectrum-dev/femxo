import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CONTACT, SITE } from "@/lib/constants";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const themeInitializationScript = `
  try {
    const storedTheme = localStorage.getItem("femxo-theme");
    const isDark = storedTheme
      ? storedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }
`;

const DESCRIPTION =
  "Femxo Consultancy Services is a Bihar-based commerce, distribution and technology network. E-commerce, ERP and agentic AI to build 1 lakh+ local entrepreneurs across all 38 districts of Bihar.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    "Femxo",
    "Femxo Consultancy Services",
    "Bihar business network",
    "ERP India",
    "dealer management",
    "commission management",
    "GST billing",
    "supply chain",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: DESCRIPTION,
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: DESCRIPTION,
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  // Google's result favicon needs a square icon of 48px or more; the .ico
  // only carries 16 and 32, so the PNGs are listed first.
  icons: {
    icon: [
      { url: "/icons/icon-192.png?v=20261022", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=20261022", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=20261022", sizes: "any" },
    ],
    apple: "/femxo-favicon.png?v=20261022",
  },
};

// Tells Google the site's name ("Femxo Consultancy Services") and logo.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      alternateName: [SITE.shortName, "Femxo", "femxo.in"],
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: SITE.shortName,
      url: SITE.url,
      logo: `${SITE.url}/icons/icon-512.png`,
      description: DESCRIPTION,
      telephone: CONTACT.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "College Road, Near Kaudihar Chowk",
        addressLocality: "Raxaul",
        addressRegion: "Bihar",
        postalCode: "845305",
        addressCountry: "IN",
      },
      areaServed: { "@type": "State", name: "Bihar" },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5EDFB" },
    { media: "(prefers-color-scheme: dark)", color: "#130A1F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}