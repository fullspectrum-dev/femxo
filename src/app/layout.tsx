import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://femxo.com"),
  title: {
    default: "Femxo - Digitising Bihar's Local Businesses",
    template: "%s | Femxo",
  },
  description:
    "Femxo connects distribution, ERP and AI in one system, built to help 1,00,000 businesses across Bihar's 38 districts grow.",
  keywords: [
    "Bihar business network",
    "ERP India",
    "dealer management",
    "commission management",
    "GST billing",
    "supply chain",
    "FEMXO",
  ],
  authors: [{ name: "Femxo Consultancy Services" }],
  creator: "FEMXO",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://femxo.com",
    siteName: "Femxo",
    title: "Femxo - Digitising Bihar's Local Businesses",
    description:
      "Distribution, ERP and AI in one connected system for Bihar's local businesses.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Femxo Consultancy Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Femxo - Digitising Bihar's Local Businesses",
    description: "Distribution, ERP and AI in one connected system for Bihar's local businesses.",
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
  icons: {
    icon: "/favicon.ico?v=20261022",
    apple: "/femxo-favicon.png?v=20261022",
  },
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
        {children}
      </body>
    </html>
  );
}