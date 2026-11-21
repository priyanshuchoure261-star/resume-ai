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
    "Build a 100% free, ATS-optimized, job-targeted resume in 2 minutes. Tailored for top tech companies (Google, Microsoft, Amazon, TCS, Infosys, Tech Mahindra). 10 professional templates, instant PDF download.",
  keywords: [
    "AI Resume Builder",
    "Free Resume Builder",
    "ATS Resume Checker",
    "Job Targeted Resume",
    "Software Engineer Resume Builder",
    "TCS Resume Builder",
    "Infosys Resume Format",
    "Google SDE Resume Builder",
    "Tech Mahindra Developer Resume",
    "Fresher Resume Builder India",
    "Tech Jobs Resume Maker",
    "Free PDF Resume Download",
    "Honest Resume AI",
    "Resume AI",
  ],
  authors: [{ name: "ResumeAI Team" }],
  creator: "ResumeAI",
  publisher: "ResumeAI",
  verification: {
    google: "waTZHXXeDhmagsBaVatXG8AJV6fowxIRCMDw2RdXFBg",
  },
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
    title: "ResumeAI — Free AI Resume Builder & ATS Checker for Tech Jobs",
    description:
      "Craft tailored, ATS-ready resumes designed for your dream company (Google, TCS, Infosys, Tech Mahindra). 10 modern templates, zero candidate fees, instant PDF export.",
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
    description: "Build job-targeted, ATS-proof resumes for tech roles in minutes with AI. 100% free forever.",
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

// JSON-LD Structured Data Schema for Google Search Rich Snippets & People Also Ask
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
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I build a resume for specific tech companies like Google, TCS, Infosys, and Tech Mahindra?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "With ResumeAI, simply select or type your target company and job position. Our AI analyzes the company requirements, job descriptions, and matches your genuine profile with honest ATS scoring and relevant keyword optimization.",
          },
        },
        {
          "@type": "Question",
          name: "How does ResumeAI ensure high ATS match scores for software engineering jobs?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ResumeAI extracts the core technical competencies (React, Next.js, Node.js, Python, AWS, SQL, etc.) from the job description and helps you align your genuine projects, experience, and certifications without fabricating fake claims.",
          },
        },
        {
          "@type": "Question",
          name: "Is ResumeAI really 100% free for candidates and freshers?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, candidates and job seekers can create, match, and export unlimited resumes in all 10 executive templates completely free with zero watermark.",
          },
        },
      ],
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
        <meta name="google-site-verification" content="waTZHXXeDhmagsBaVatXG8AJV6fowxIRCMDw2RdXFBg" />
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
