import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    default: "FEMXO ERP — India ka Naya Business ERP Platform",
    template: "%s | FEMXO ERP",
  },
  description:
    "FEMXO ERP — Multi-portal platform for dealers, sub-dealers, and customers. Manage inventory, commissions, orders, and settlements at scale.",
  keywords: [
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
    siteName: "FEMXO ERP",
    title: "FEMXO ERP — India ka Naya Business ERP Platform",
    description:
      "Multi-portal ERP for dealers, sub-dealers, and customers. Scale from 0 to 1M+ users.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "FEMXO ERP Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FEMXO ERP — India ka Naya Business ERP Platform",
    description: "Multi-portal ERP for dealers, sub-dealers, and customers.",
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
    icon: "/favicon.ico?v=20261012",
    apple: "/femxo-favicon.png?v=20261012",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6C35A5" },
    { media: "(prefers-color-scheme: dark)", color: "#45216F" },
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href="/fonts/inter-latin-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}