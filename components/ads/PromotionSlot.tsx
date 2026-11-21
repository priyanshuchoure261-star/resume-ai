"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type PromotionSlotProps = {
  slot?: "banner" | "sidebar" | "card";
  className?: string;
};

const SAMPLE_ADS = [
  {
    sponsor: "TechCareer Academy",
    title: "Cracking the Tech Interview 2026",
    tagline: "Live DSA & System Design Bootcamp with 1:1 Mentorship.",
    cta: "Claim 35% Discount",
    link: "https://example.com/tech-interview",
    badge: "Featured Partner",
    accent: "#38bdf8",
  },
  {
    sponsor: "CloudCert Global",
    title: "AWS & Azure Certification Pass",
    tagline: "Boost your resume with industry recognized cloud credentials.",
    cta: "Start Free Practice",
    link: "https://example.com/cloud-cert",
    badge: "Trending Tool",
    accent: "#f59e0b",
  },
  {
    sponsor: "InterviewMock AI",
    title: "Simulate Real FAANG Behavioral Rounds",
    tagline: "Get instant AI feedback on tone, clarity, and STAR responses.",
    cta: "Try Free Mock",
    link: "https://example.com/mock-ai",
    badge: "Top Rated",
    accent: "#ec4899",
  },
];

export default function PromotionSlot({
  slot = "banner",
  className = "",
}: PromotionSlotProps) {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [advertiserEmail, setAdvertiserEmail] = useState("");
  const [advertiserCompany, setAdvertiserCompany] = useState("");
  const [advertiserPhone, setAdvertiserPhone] = useState("");
  const [productType, setProductType] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [activeAds, setActiveAds] = useState<any>(null);

  // Fetch active live ads dynamically
  useEffect(() => {
    fetch("/api/ads/inquire")
      .then((res) => res.json())
      .then((data) => {
        if (data?.activeAds) {
          setActiveAds(data.activeAds);
        }
      })
      .catch(() => {});
  }, []);

  const liveAd = slot === "sidebar" ? activeAds?.sidebar : activeAds?.banner;
  const currentAd = liveAd || SAMPLE_ADS[slot === "sidebar" ? 1 : slot === "card" ? 2 : 0];

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (advertiserEmail.includes("@")) {
      try {
        await fetch("/api/ads/inquire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: advertiserCompany,
            email: advertiserEmail,
            phone: advertiserPhone,
            productType: productType || "Tech Course / Job Portal",
            packageType: slot === "sidebar" ? "Sidebar Card" : "Banner Slot",
            targetUrl: targetUrl,
          }),
        });
      } catch {
        // continue
      }
      setInquirySent(true);
      setTimeout(() => {
        setShowInquiryModal(false);
        setInquirySent(false);
        setAdvertiserEmail("");
        setAdvertiserCompany("");
        setAdvertiserPhone("");
        setProductType("");
        setTargetUrl("");
      }, 3500);
    }
  };

  if (slot === "sidebar") {
    return (
      <aside
        className={`no-print ${className}`}
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(124, 58, 237, 0.25)",
          borderRadius: 16,
          padding: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontWeight: 700,
              color: "#a78bfa",
              background: "rgba(124, 58, 237, 0.15)",
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            SPONSORED
          </span>

          <Link
            href="/pricing"
            style={{
              color: "#94a3b8",
              fontSize: 11,
              textDecoration: "underline",
            }}
          >
            Advertise here
          </Link>
        </div>

        <div style={{ fontSize: 11, color: currentAd.accent || "#38bdf8", fontWeight: 700, marginBottom: 4 }}>
          {currentAd.sponsor}
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: "0 0 6px 0", lineHeight: 1.4 }}>
          {currentAd.title}
        </h4>
        <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 12px 0" }}>
          {currentAd.tagline}
        </p>

        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            display: "block",
            textAlign: "center",
            padding: "8px 14px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          {currentAd.cta || "Learn More"} →
        </a>

        {renderModal()}
      </aside>
    );
  }

  // Default Horizontal Banner Slot
  return (
    <div
      className={`no-print ${className}`}
      style={{
        background: "radial-gradient(ellipse at 80% 50%, rgba(124, 58, 237, 0.12), transparent 70%), rgba(255, 255, 255, 0.025)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 18,
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        margin: "24px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 260 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.2))",
            border: "1px solid rgba(124, 58, 237, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🚀
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                fontWeight: 700,
                color: "#a78bfa",
                background: "rgba(124, 58, 237, 0.15)",
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              PROMOTED PARTNER
            </span>
            <span style={{ fontSize: 12, color: currentAd.accent || "#38bdf8", fontWeight: 700 }}>
              {currentAd.sponsor}
            </span>
          </div>

          <h4 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: "0 0 2px 0" }}>
            {currentAd.title}
          </h4>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            {currentAd.tagline}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{
            padding: "9px 18px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 10,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {currentAd.cta || "Check Offer"} →
        </a>

        <Link
          href="/pricing"
          style={{
            padding: "8px 14px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#cbd5e1",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 10,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          📢 Place Your Ad
        </Link>
      </div>

      {renderModal()}
    </div>
  );

  function renderModal() {
    if (!showInquiryModal) return null;

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        onClick={() => setShowInquiryModal(false)}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "linear-gradient(135deg, #120e28 0%, #0d0a1c 100%)",
            border: "1px solid rgba(124, 58, 237, 0.4)",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
            color: "#e2e8f0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "white" }}>
              📢 Promote Your Brand on ResumeAI
            </h3>
            <button
              onClick={() => setShowInquiryModal(false)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginBottom: 16 }}>
            Reach 50,000+ ambitious developers, graduates, and professionals preparing job applications.
          </p>

          <Link
            href="/pricing"
            onClick={() => setShowInquiryModal(false)}
            style={{
              display: "block",
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.35)",
              borderRadius: 10,
              padding: "10px 14px",
              textAlign: "center",
              color: "#c4b5fd",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: 16,
            }}
          >
            📊 View Packages & Rate Cards (Starting ₹1,999/mo) →
          </Link>

          {inquirySent ? (
            <div
              style={{
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                borderRadius: 10,
                padding: "16px",
                textAlign: "center",
                color: "#86efac",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ✓ Thank you! We received your ad inquiry and will contact you on WhatsApp / Email within 12 hours.
            </div>
          ) : (
            <form onSubmit={handleInquiry} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#cbd5e1", display: "block", marginBottom: 4 }}>
                  Company or Product Name
                </label>
                <input
                  type="text"
                  required
                  value={advertiserCompany}
                  onChange={(e) => setAdvertiserCompany(e.target.value)}
                  placeholder="e.g. CodeCamp Pro, TechHiring Labs"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#cbd5e1", display: "block", marginBottom: 4 }}>
                  What are you promoting?
                </label>
                <input
                  type="text"
                  required
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="e.g. Full Stack Bootcamp, Remote Jobs, AI Tool"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#cbd5e1", display: "block", marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={advertiserEmail}
                    onChange={(e) => setAdvertiserEmail(e.target.value)}
                    placeholder="partner@brand.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#cbd5e1", display: "block", marginBottom: 4 }}>
                    WhatsApp Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={advertiserPhone}
                    onChange={(e) => setAdvertiserPhone(e.target.value)}
                    placeholder="+91 98765..."
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: "#cbd5e1", display: "block", marginBottom: 4 }}>
                  Target Website / Landing Page
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://yourbrand.com/offer"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 6,
                  padding: "11px 18px",
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Submit Ad Placement Request →
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(255, 255, 255, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 8,
  color: "white",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
