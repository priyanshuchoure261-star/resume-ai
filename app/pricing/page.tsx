"use client";

import React, { useState } from "react";
import Link from "next/link";
import NavAuthButton from "@/components/auth/NavAuthButton";

type AdPackage = {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  popular?: boolean;
  description: string;
  features: string[];
};

const ADVERTISER_PACKAGES: AdPackage[] = [
  {
    id: "starter",
    name: "Starter Banner Slot",
    price: "₹1,999",
    period: "per month ($25)",
    description: "Great for EdTech startups, newsletter promotions, or student tools.",
    features: [
      "Leaderboard banner on Homepage & Dashboard",
      "Estimated 25,000+ targeted candidate impressions",
      "Direct link with dofollow/sponsored tag",
      "Monthly click & CTR analytics report",
      "Standard sponsor badge",
    ],
  },
  {
    id: "targeted",
    name: "Skill Match & Roadmap Sponsor",
    price: "₹4,999",
    period: "per month ($59)",
    popular: true,
    badge: "Most Popular",
    description: "Perfect for Coding Bootcamps, Certifications, and Mock Interview platforms.",
    features: [
      "Featured on high-intent Job Match & Skill Gap pages",
      "Sidebar banner on Candidate Workspace & Builder",
      "Estimated 60,000+ high-converting impressions",
      "Audience: Active job seekers preparing for interviews",
      "Priority customer inquiry routing",
      "Bi-weekly performance review",
    ],
  },
  {
    id: "recruiter",
    name: "Exclusive Hiring Partner",
    price: "₹9,999",
    period: "per month ($119)",
    badge: "Enterprise",
    description: "Ideal for Hiring agencies, tech companies, and career accelerators looking for talent.",
    features: [
      "Prominent placement across ALL platform pages",
      "Featured Partner logo on Homepage brand wall",
      "Direct 'Apply to Open Roles' recruiter link",
      "100,000+ monthly impressions guarantee",
      "Custom banner design support included",
      "Dedicated account manager & instant ad rotation",
    ],
  },
];

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<"candidates" | "advertisers">("candidates");

  // Booking inquiry state
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneOrWebsite, setPhoneOrWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleOpenBooking = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactEmail.includes("@")) {
      try {
        await fetch("/api/ads/inquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: companyName,
            email: contactEmail,
            phone: phoneOrWebsite,
            productType: "Selected Package: " + selectedPackage,
            packageType: selectedPackage || "Advertiser Package",
            adDescription: message,
          }),
        });
      } catch {
        // continue
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowModal(false);
        setCompanyName("");
        setContactEmail("");
        setPhoneOrWebsite("");
        setMessage("");
      }, 3500);
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <Link href="/" style={styles.brand}>
            <span style={styles.brandMark}>
              <span />
              <span />
              <span />
            </span>
            <span style={styles.brandName}>
              Resume<span style={{ color: "#a78bfa" }}>AI</span>
            </span>
          </Link>

          <nav style={styles.navLinks}>
            <Link href="/" style={styles.navLink}>Home</Link>
            <Link href="/dashboard" style={styles.navLink}>Dashboard</Link>
            <Link href="/match" style={styles.navLink}>Job Matching</Link>
            <Link href="/pricing" style={{ ...styles.navLink, color: "#a78bfa", fontWeight: 700 }}>
              Pricing & Ads
            </Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <NavAuthButton />
            <Link href="/create" style={styles.primaryBtn}>
              Build Resume Free →
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main style={styles.main}>
        <div style={styles.heroSection}>
          <span style={styles.kicker}>TRANSPARENT & HONEST PRICING</span>
          <h1 style={styles.title}>
            100% Free for Candidates.
            <br />
            <span style={styles.gradientText}>Funded by Quality Sponsors.</span>
          </h1>
          <p style={styles.subtitle}>
            We believe no fresher or job seeker should be forced to pay to format their resume.
            ResumeAI remains completely free for users, funded by tech partners and corporate sponsors who advertise relevant career tools.
          </p>

          {/* TAB TOGGLE */}
          <div style={styles.tabToggle}>
            <button
              onClick={() => setActiveTab("candidates")}
              style={activeTab === "candidates" ? styles.tabBtnActive : styles.tabBtnInactive}
            >
              🎓 For Job Seekers & Freshers (Free)
            </button>
            <button
              onClick={() => setActiveTab("advertisers")}
              style={activeTab === "advertisers" ? styles.tabBtnActive : styles.tabBtnInactive}
            >
              📢 For Advertisers & Recruiters (Promote)
            </button>
          </div>
        </div>

        {/* =========================================================
            TAB 1: FOR CANDIDATES (100% FREE FOREVER + OPTIONAL SUPPORTER)
            ========================================================= */}
        {activeTab === "candidates" && (
          <div style={styles.plansContainer}>
            {/* Free Forever Core Plan */}
            <div style={styles.freeCard}>
              <div style={styles.badgeFree}>100% FREE FOREVER</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: "14px 0 6px 0" }}>
                Candidate Free Pass
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
                Every single core feature is completely free for all job seekers. No hidden fees or watermarks.
              </p>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: "#22c55e" }}>₹0</span>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>/ always free</span>
              </div>

              <Link href="/create" style={styles.freeBtn}>
                Start Building Free Now →
              </Link>

              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>All 10 Professional Templates</strong> (Classic, Modern, Tech, Executive, etc.)</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>AI Resume & Job Matching</strong> with explainable score and reason breakdown</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>Context-Aware Career Chatbot</strong> with interview prep & roadmap guidance</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>High-Resolution PDF Download & Print</strong> (clean, zero ads on resume)</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>ATS Keywords Optimization</strong> & Skill Gap Roadmap</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>Multi-Resume Workspace Dashboard</strong> to save resumes for different companies</span>
                </div>
              </div>
            </div>

            {/* Optional Voluntary Supporter Card */}
            <div style={styles.supporterCard}>
              <div style={styles.badgeSupporter}>OPTIONAL VOLUNTARY PLAN</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "14px 0 6px 0" }}>
                Community Supporter
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
                Completely optional! If you love ResumeAI and want to support our server and AI API costs.
              </p>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: "#a78bfa" }}>₹99</span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>/ one-time ($1.99)</span>
              </div>

              <button
                onClick={() => alert("Thank you for your generous support! Community donation gateway will be active soon.")}
                style={styles.supporterBtn}
              >
                ☕ Support the Project
              </button>

              <div style={styles.featureList}>
                <div style={styles.featureItem}>
                  <span style={{ color: "#a78bfa" }}>★</span>
                  <span><strong>Supporter Badge</strong> displayed on your profile</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={{ color: "#a78bfa" }}>★</span>
                  <span><strong>100% Ad-Free UI Experience</strong> (hides sponsored partner banners)</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={{ color: "#a78bfa" }}>★</span>
                  <span><strong>Early Access</strong> to future upcoming templates and feature drops</span>
                </div>
                <div style={styles.featureItem}>
                  <span style={{ color: "#a78bfa" }}>★</span>
                  <span>Helps keep ResumeAI free for students from underprivileged backgrounds</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: FOR ADVERTISERS & RECRUITERS
            ========================================================= */}
        {activeTab === "advertisers" && (
          <div>
            <div style={styles.advertiserIntro}>
              <div style={{ maxWidth: 640 }}>
                <span style={styles.kicker}>AUDIENCE DEMOGRAPHICS</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "6px 0 8px 0" }}>
                  Advertise to 50,000+ Active Job Seekers
                </h2>
                <p style={{ color: "#94a3b8", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  Our candidates are developers, engineers, and graduates actively upgrading their skills and targeting top companies (HDFC, Tech Mahindra, Genpact, Accenture, Deloitte).
                </p>
              </div>

              <button
                onClick={() => handleOpenBooking("custom")}
                style={styles.customAdBtn}
              >
                💬 Speak to Ad Sales
              </button>
            </div>

            {/* ADVERTISER TIERS GRID */}
            <div style={styles.advertiserGrid}>
              {ADVERTISER_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  style={pkg.popular ? styles.adCardPopular : styles.adCard}
                >
                  {pkg.badge && (
                    <div style={styles.adBadge}>{pkg.badge}</div>
                  )}

                  <h3 style={{ fontSize: 19, fontWeight: 800, color: "white", margin: "0 0 6px 0" }}>
                    {pkg.name}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: 13, minHeight: 38, margin: "0 0 16px 0", lineHeight: 1.5 }}>
                    {pkg.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: "white" }}>{pkg.price}</span>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>{pkg.period}</span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(pkg.name)}
                    style={pkg.popular ? styles.adBookBtnPopular : styles.adBookBtn}
                  >
                    Book This Ad Slot →
                  </button>

                  <div style={styles.featureList}>
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} style={styles.featureItem}>
                        <span style={{ color: pkg.popular ? "#a78bfa" : "#22c55e", fontWeight: "bold" }}>✓</span>
                        <span style={{ color: "#cbd5e1" }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ BANNER FOR ADVERTISERS */}
            <div style={styles.adFaq}>
              <h4 style={{ color: "white", fontSize: 16, fontWeight: 800, margin: "0 0 8px 0" }}>
                How does ad placement work?
              </h4>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                1. Select your desired package and submit your product details.<br />
                2. Our team reviews your ad within 12 hours to ensure high quality for our candidates.<br />
                3. Your banner goes live with custom tracked URLs, CTR reports, and transparent billing.
              </p>
            </div>
          </div>
        )}

        {/* BOOKING MODAL */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0 }}>
                  📢 Book Sponsorship: {selectedPackage || "Ad Placement"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              {submitted ? (
                <div style={styles.successMessage}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                  <h4 style={{ color: "#86efac", fontSize: 18, margin: "0 0 6px 0" }}>Inquiry Received!</h4>
                  <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0 }}>
                    Our partnerships team will reach out with your verified Rate Card and slot availability within 12 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={styles.fieldLabel}>Company / Product Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. CodeCamp Pro, TechHiring Labs"
                      style={styles.modalInput}
                    />
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Business Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="marketing@yourbrand.com"
                      style={styles.modalInput}
                    />
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Website or Phone (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      value={phoneOrWebsite}
                      onChange={(e) => setPhoneOrWebsite(e.target.value)}
                      placeholder="https://yourbrand.com or +91 98765..."
                      style={styles.modalInput}
                    />
                  </div>

                  <div>
                    <label style={styles.fieldLabel}>Campaign Goals / Preferred Dates (Optional)</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about the product or campaign you'd like to promote..."
                      style={styles.modalTextarea}
                    />
                  </div>

                  <button type="submit" style={styles.submitBtn}>
                    Submit Sponsorship Request →
                  </button>
                  <p style={{ fontSize: 11, color: "#64748b", textAlign: "center", margin: 0 }}>
                    🔒 We respect your privacy. No spam guaranteed.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <p style={{ margin: 0 }}>ResumeAI • Built for ambitious job seekers with honest AI matching.</p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/" style={styles.footerLink}>Home</Link>
            <Link href="/create" style={styles.footerLink}>Create Resume</Link>
            <Link href="/dashboard" style={styles.footerLink}>Dashboard</Link>
            <Link href="/pricing" style={styles.footerLink}>Advertising Rate Card</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #07070f 0%, #0d091b 50%, #07070f 100%)",
    color: "#e2e8f0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    background: "rgba(255, 255, 255, 0.03)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px 32px",
    position: "sticky",
    top: 0,
    zIndex: 40,
    backdropFilter: "blur(16px)",
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    display: "inline-block",
  },
  brandName: {
    fontSize: 19,
    fontWeight: 800,
    color: "white",
  },
  navLinks: {
    display: "flex",
    gap: 22,
    alignItems: "center",
  },
  navLink: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    transition: "color 0.2s",
  },
  primaryBtn: {
    padding: "9px 18px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
  },

  main: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "50px 24px 80px 24px",
  },
  heroSection: {
    textAlign: "center",
    maxWidth: 760,
    margin: "0 auto 50px auto",
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 800,
    color: "#a78bfa",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 8,
  },
  title: {
    fontSize: "clamp(30px, 4.5vw, 48px)",
    fontWeight: 900,
    color: "white",
    margin: "0 0 16px 0",
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
  },
  gradientText: {
    background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: "0 auto 32px auto",
  },

  tabToggle: {
    display: "inline-flex",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    padding: 5,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    gap: 4,
  },
  tabBtnActive: {
    padding: "10px 22px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  tabBtnInactive: {
    padding: "10px 22px",
    borderRadius: 10,
    background: "transparent",
    color: "#94a3b8",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  plansContainer: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 26,
    alignItems: "stretch",
  },
  freeCard: {
    background: "radial-gradient(ellipse at 85% 20%, rgba(34, 197, 94, 0.12), transparent 55%), rgba(255, 255, 255, 0.03)",
    border: "2px solid rgba(34, 197, 94, 0.35)",
    borderRadius: 24,
    padding: "36px 32px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
  },
  supporterCard: {
    background: "rgba(255, 255, 255, 0.025)",
    border: "1px solid rgba(124, 58, 237, 0.25)",
    borderRadius: 24,
    padding: "36px 30px",
  },
  badgeFree: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    color: "#86efac",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    padding: "3px 12px",
    borderRadius: 20,
    letterSpacing: 1,
  },
  badgeSupporter: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    color: "#c4b5fd",
    background: "rgba(124, 58, 237, 0.15)",
    border: "1px solid rgba(124, 58, 237, 0.3)",
    padding: "3px 12px",
    borderRadius: 20,
    letterSpacing: 1,
  },
  freeBtn: {
    display: "block",
    textAlign: "center",
    padding: "14px 20px",
    background: "linear-gradient(135deg, #16a34a, #059669)",
    color: "white",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 800,
    textDecoration: "none",
    boxShadow: "0 6px 20px rgba(22, 163, 74, 0.35)",
    marginBottom: 28,
  },
  supporterBtn: {
    width: "100%",
    padding: "13px 20px",
    background: "rgba(124, 58, 237, 0.15)",
    border: "1px solid rgba(124, 58, 237, 0.35)",
    color: "#c4b5fd",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 28,
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    paddingTop: 20,
  },
  featureItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontSize: 13.5,
    lineHeight: 1.5,
    color: "#cbd5e1",
  },
  checkIcon: {
    color: "#22c55e",
    fontWeight: "bold",
    fontSize: 14,
  },

  advertiserIntro: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: "26px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 30,
  },
  customAdBtn: {
    padding: "11px 22px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    color: "white",
    borderRadius: 11,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  advertiserGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 22,
    marginBottom: 32,
  },
  adCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 28,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  adCardPopular: {
    background: "radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.2), transparent 60%), rgba(255, 255, 255, 0.035)",
    border: "2px solid rgba(124, 58, 237, 0.45)",
    borderRadius: 20,
    padding: 28,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 16px 40px rgba(124, 58, 237, 0.25)",
  },
  adBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 12px",
    borderRadius: 20,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  adBookBtn: {
    width: "100%",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    color: "white",
    borderRadius: 11,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 20,
  },
  adBookBtnPopular: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 11,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    marginBottom: 20,
    boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
  },

  adFaq: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    padding: "20px 24px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(10px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    maxWidth: 500,
    width: "100%",
    background: "linear-gradient(135deg, #130f2b 0%, #0d0a1b 100%)",
    border: "1px solid rgba(124, 58, 237, 0.45)",
    borderRadius: 22,
    padding: 32,
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#cbd5e1",
    display: "block",
    marginBottom: 6,
  },
  modalInput: {
    width: "100%",
    padding: "11px 13px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    color: "white",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  },
  modalTextarea: {
    width: "100%",
    padding: "11px 13px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    color: "white",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
  },
  submitBtn: {
    padding: "13px 20px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
  },
  successMessage: {
    padding: "24px 16px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: 14,
    textAlign: "center",
  },

  footer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "30px 32px",
    fontSize: 13,
    color: "#64748b",
  },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  footerLink: {
    color: "#94a3b8",
    textDecoration: "none",
  },
};
