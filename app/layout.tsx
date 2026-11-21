import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://resume-ai-one-ebon.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ResumeAI — Free AI Resume Builder, ATS Score & Career Assistant",
    template: "%s | ResumeAI",
  },
  description:
    "Build a 100% free, ATS-optimized, job-targeted resume in 2 minutes. Features honest skill matching, 10 executive templates, real-time PDF download, and AI career guidance.",
  keywords: [
    "AI Resume Builder",
    "Free Resume Builder",
    "ATS Resume Checker",
    "Job Targeted Resume",
    "Free PDF Resume Download",
    "Resume Maker Online",
    "Honest Resume AI",
    "Software Engineer Resume Builder",
    "Fresher Resume Builder India",
    "Professional Resume Templates 2026",
    "Resume AI",
  ],
  authors: [{ name: "ResumeAI Team" }],
  creator: "ResumeAI",
  publisher: "ResumeAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ResumeAI",
    title: "ResumeAI — 100% Free AI Resume Builder & ATS Checker",
    description:
      "Craft tailored, ATS-ready resumes designed for your dream company. 10 modern templates, zero fees for job seekers, instant PDF export.",
    images: [
      {
        url: "/next.svg",
        width: 1200,
        height: 630,
        alt: "ResumeAI — Intelligent Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeAI — Free AI Resume Builder & ATS Checker",
    description: "Build job-targeted, ATS-proof resumes in minutes with AI. 100% free forever for candidates.",
    images: ["/next.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD Structured Data Schema for Google Search Rich Snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ResumeAI",
      description: "AI-powered job-targeted resume builder and ATS analyzer",
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/create?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "ResumeAI Career Suite",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1250",
        bestRating: "5",
        worstRating: "1",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
