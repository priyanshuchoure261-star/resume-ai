"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type AdInquiry = {
  id: string;
  createdAt: string;
  company: string;
  email: string;
  phone: string;
  productType: string;
  packageType: string;
  adTitle: string;
  adDescription: string;
  targetUrl: string;
  bannerAssetUrl: string;
  status: "pending" | "approved" | "rejected" | "paid";
};

type ActiveAdConfig = {
  banner: {
    sponsor: string;
    title: string;
    tagline: string;
    cta: string;
    link: string;
    accent: string;
  };
  sidebar: {
    sponsor: string;
    title: string;
    tagline: string;
    cta: string;
    link: string;
    accent: string;
  };
};

export default function AdminAdsPage() {
  const [activeTab, setActiveTab] = useState<"inquiries" | "edit-ads" | "payment-guide">("inquiries");
  const [inquiries, setInquiries] = useState<AdInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Ad Edit State
  const [bannerConfig, setBannerConfig] = useState({
    sponsor: "TechCareer Academy",
    title: "Cracking the Tech Interview 2026",
    tagline: "Live DSA & System Design Bootcamp with 1:1 Mentorship.",
    cta: "Claim 35% Discount",
    link: "https://example.com/tech-interview",
    accent: "#38bdf8",
  });

  const [sidebarConfig, setSidebarConfig] = useState({
    sponsor: "CloudCert Global",
    title: "AWS & Azure Certification Pass",
    tagline: "Boost your resume with industry recognized cloud credentials.",
    cta: "Start Free Practice",
    link: "https://example.com/cloud-cert",
    accent: "#f59e0b",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ads/inquire");
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
        if (data.activeAds?.banner) setBannerConfig(data.activeAds.banner);
        if (data.activeAds?.sidebar) setSidebarConfig(data.activeAds.sidebar);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveActiveAds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ads/inquire", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banner: bannerConfig,
          sidebar: sidebarConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert("Failed to update active ads.");
    }
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <span style={styles.adminPill}>ADMIN PORTAL</span>
          </div>

          <nav style={styles.navLinks}>
            <Link href="/" style={styles.navLink}>View Live Site</Link>
            <Link href="/pricing" style={styles.navLink}>Pricing Page</Link>
            <Link href="/dashboard" style={styles.navLink}>User Dashboard</Link>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.heroSection}>
          <span style={styles.kicker}>MONETIZATION & SPONSORSHIP CONTROL</span>
          <h1 style={styles.title}>Advertiser Inquiries & Live Ad Manager</h1>
          <p style={styles.subtitle}>
            Review promotion requests from clients, collect payment, and update active banners shown across the site in real time.
          </p>

          {/* TABS */}
          <div style={styles.tabToggle}>
            <button
              onClick={() => setActiveTab("inquiries")}
              style={activeTab === "inquiries" ? styles.tabBtnActive : styles.tabBtnInactive}
            >
              📥 Client Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("edit-ads")}
              style={activeTab === "edit-ads" ? styles.tabBtnActive : styles.tabBtnInactive}
            >
              🎨 Edit Live Ads on Site
            </button>
            <button
              onClick={() => setActiveTab("payment-guide")}
              style={activeTab === "payment-guide" ? styles.tabBtnActive : styles.tabBtnInactive}
            >
              💰 How to Collect Payment
            </button>
          </div>
        </div>

        {/* TAB 1: INCOMING INQUIRIES */}
        {activeTab === "inquiries" && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h3 style={{ color: "white", fontSize: 20, margin: 0, fontWeight: 800 }}>
                  Incoming Promotion Requests
                </h3>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0 0" }}>
                  Clients who submitted their company and campaign details through your &quot;Place Your Ad&quot; buttons.
                </p>
              </div>
              <button onClick={loadData} style={styles.refreshBtn}>
                🔄 Refresh List
              </button>
            </div>

            {loading ? (
              <div style={styles.emptyCard}>Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div style={styles.emptyCard}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📬</div>
                <h4 style={{ color: "white", margin: "0 0 6px 0", fontSize: 18 }}>No ad inquiries yet</h4>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  When someone clicks &quot;Place Your Ad&quot; or books on the Pricing page, their details will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {inquiries.map((inq) => {
                  const whatsappClean = inq.phone.replace(/[^0-9]/g, "");
                  const whatsappLink = `https://wa.me/${whatsappClean || ""}?text=${encodeURIComponent(
                    `Hi ${inq.company}, I received your ad inquiry for ResumeAI regarding ${inq.productType}. Let me share our active slot details and payment QR.`
                  )}`;

                  return (
                    <div key={inq.id} style={styles.inquiryCard}>
                      <div style={styles.inquiryHeader}>
                        <div>
                          <span style={styles.packageBadge}>{inq.packageType}</span>
                          <h4 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: "6px 0 2px 0" }}>
                            {inq.company}
                          </h4>
                          <span style={{ fontSize: 12, color: "#a78bfa" }}>
                            Promoting: <strong>{inq.productType}</strong>
                          </span>
                        </div>

                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {new Date(inq.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div style={styles.inquiryDetailsGrid}>
                        <div>
                          <div style={styles.detailLabel}>Client Email:</div>
                          <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{inq.email}</div>
                        </div>
                        <div>
                          <div style={styles.detailLabel}>Client Phone / WhatsApp:</div>
                          <div style={{ color: "#86efac", fontSize: 13, fontWeight: 700 }}>
                            {inq.phone || "Not provided"}
                          </div>
                        </div>
                        <div>
                          <div style={styles.detailLabel}>Proposed Ad Title:</div>
                          <div style={{ color: "white", fontSize: 13 }}>{inq.adTitle || "—"}</div>
                        </div>
                        <div>
                          <div style={styles.detailLabel}>Client Website / Link:</div>
                          {inq.targetUrl ? (
                            <a
                              href={inq.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "#38bdf8", fontSize: 13, textDecoration: "underline" }}
                            >
                              {inq.targetUrl}
                            </a>
                          ) : (
                            <span style={{ color: "#64748b", fontSize: 13 }}>—</span>
                          )}
                        </div>
                      </div>

                      {inq.bannerAssetUrl && (
                        <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>Ad Banner / Asset Link: </span>
                          <a href={inq.bannerAssetUrl} target="_blank" rel="noreferrer" style={{ color: "#a78bfa", fontSize: 12 }}>
                            {inq.bannerAssetUrl}
                          </a>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={styles.inquiryActions}>
                        {inq.phone && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.whatsappBtn}
                          >
                            💬 Chat on WhatsApp
                          </a>
                        )}

                        <a
                          href={`mailto:${inq.email}?subject=ResumeAI%20Sponsorship%20Confirmation%20for%20${encodeURIComponent(
                            inq.company
                          )}`}
                          style={styles.emailBtn}
                        >
                          ✉ Send Email with UPI QR
                        </a>

                        <button
                          onClick={() => {
                            setBannerConfig((prev) => ({
                              ...prev,
                              sponsor: inq.company,
                              title: inq.adTitle || `${inq.company} - Special Offer`,
                              tagline: inq.adDescription || `Check out ${inq.productType}`,
                              link: inq.targetUrl || "https://example.com",
                            }));
                            setActiveTab("edit-ads");
                          }}
                          style={styles.copyToAdBtn}
                        >
                          ⚡ Load into Live Ad Editor
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE AD EDITOR */}
        {activeTab === "edit-ads" && (
          <div style={styles.editorCard}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ color: "white", fontSize: 20, margin: "0 0 4px 0", fontWeight: 800 }}>
                Live Ad Editor (Updates Website in Real Time)
              </h3>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                Once you collect payment from the client, enter their company name, ad headline, and link here. Click &quot;Apply to Live Site&quot; and their ad is instantly live across all pages!
              </p>
            </div>

            {saveSuccess && (
              <div style={styles.saveAlert}>
                ✓ Success! Active ads updated on the live website.
              </div>
            )}

            <form onSubmit={handleSaveActiveAds} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Slot 1: Horizontal Banner */}
              <div style={styles.slotBox}>
                <div style={styles.slotHeader}>
                  <span style={styles.slotTag}>SLOT 1</span>
                  <h4 style={{ color: "white", fontSize: 16, margin: 0, fontWeight: 700 }}>
                    Horizontal Leaderboard Banner (Homepage, Match Page, Dashboard)
                  </h4>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Sponsor / Company Name</label>
                    <input
                      type="text"
                      value={bannerConfig.sponsor}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, sponsor: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Ad Title / Headline</label>
                    <input
                      type="text"
                      value={bannerConfig.title}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, title: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={styles.label}>Tagline / Description</label>
                    <input
                      type="text"
                      value={bannerConfig.tagline}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, tagline: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>CTA Button Text</label>
                    <input
                      type="text"
                      value={bannerConfig.cta}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, cta: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Destination Link (Client&apos;s Website / Landing Page)</label>
                    <input
                      type="url"
                      value={bannerConfig.link}
                      onChange={(e) => setBannerConfig({ ...bannerConfig, link: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Slot 2: Sidebar Banner */}
              <div style={styles.slotBox}>
                <div style={styles.slotHeader}>
                  <span style={styles.slotTag}>SLOT 2</span>
                  <h4 style={{ color: "white", fontSize: 16, margin: 0, fontWeight: 700 }}>
                    Sidebar Card Banner (Builder &amp; Resume Preview Panels)
                  </h4>
                </div>

                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Sponsor / Company Name</label>
                    <input
                      type="text"
                      value={sidebarConfig.sponsor}
                      onChange={(e) => setSidebarConfig({ ...sidebarConfig, sponsor: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Ad Title / Headline</label>
                    <input
                      type="text"
                      value={sidebarConfig.title}
                      onChange={(e) => setSidebarConfig({ ...sidebarConfig, title: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={styles.label}>Tagline / Description</label>
                    <input
                      type="text"
                      value={sidebarConfig.tagline}
                      onChange={(e) => setSidebarConfig({ ...sidebarConfig, tagline: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>CTA Button Text</label>
                    <input
                      type="text"
                      value={sidebarConfig.cta}
                      onChange={(e) => setSidebarConfig({ ...sidebarConfig, cta: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Destination Link (Client&apos;s Website)</label>
                    <input
                      type="url"
                      value={sidebarConfig.link}
                      onChange={(e) => setSidebarConfig({ ...sidebarConfig, link: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" style={styles.saveLiveBtn}>
                🚀 Apply &amp; Publish to Live Website
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PAYMENT COLLECTION GUIDE */}
        {activeTab === "payment-guide" && (
          <div style={styles.guideCard}>
            <h3 style={{ color: "white", fontSize: 22, fontWeight: 800, margin: "0 0 16px 0" }}>
              💡 Step-by-Step Guide: How to Collect Money from Advertisers
            </h3>

            <div style={styles.guideSteps}>
              <div style={styles.guideStep}>
                <span style={styles.stepNum}>1</span>
                <div>
                  <h4 style={{ color: "white", margin: "0 0 4px 0", fontSize: 16 }}>
                    Client fills out the form or messages on WhatsApp
                  </h4>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    A company clicks &quot;Book Ad Slot&quot; on your Pricing page or &quot;Place Your Ad&quot; on any banner.
                    Their contact details appear in Tab 1 (&quot;Client Inquiries&quot;).
                  </p>
                </div>
              </div>

              <div style={styles.guideStep}>
                <span style={styles.stepNum}>2</span>
                <div>
                  <h4 style={{ color: "white", margin: "0 0 4px 0", fontSize: 16 }}>
                    You verify their product &amp; send Payment Link or UPI QR
                  </h4>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    <strong>For Indian Clients:</strong> Send your Google Pay / PhonePe / Paytm UPI QR code, or Bank NEFT details. You get 100% money with zero commission.<br />
                    <strong>For Corporate Invoices:</strong> You can create a free Razorpay Payment Link (e.g. razorpay.me/@yourname) where they can pay via Credit Card, Debit Card, or Netbanking.<br />
                    <strong>For International Clients:</strong> Use a Stripe payment link or PayPal.me link ($25 / $59 / $119).
                  </p>
                </div>
              </div>

              <div style={styles.guideStep}>
                <span style={styles.stepNum}>3</span>
                <div>
                  <h4 style={{ color: "white", margin: "0 0 4px 0", fontSize: 16 }}>
                    Client provides Banner Text &amp; Destination Link
                  </h4>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    The client shares their headline, short description, and their target website link (e.g. their course landing page or hiring portal).
                  </p>
                </div>
              </div>

              <div style={styles.guideStep}>
                <span style={styles.stepNum}>4</span>
                <div>
                  <h4 style={{ color: "white", margin: "0 0 4px 0", fontSize: 16 }}>
                    You activate their ad in 10 seconds via Tab 2
                  </h4>
                  <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    Open Tab 2 (&quot;Edit Live Ads on Site&quot;), paste their text and link, and click <strong>&quot;Apply &amp; Publish to Live Website&quot;</strong>.
                    Their ad is immediately visible to all 50,000+ candidates across the site!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
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
    paddingBottom: 60,
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
  adminPill: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: 800,
    color: "#fbbf24",
    background: "rgba(245, 158, 11, 0.15)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    padding: "3px 8px",
    borderRadius: 6,
  },
  navLinks: {
    display: "flex",
    gap: 20,
    alignItems: "center",
  },
  navLink: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },

  main: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "40px 24px",
  },
  heroSection: {
    textAlign: "center",
    maxWidth: 760,
    margin: "0 auto 40px auto",
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
    fontSize: "clamp(26px, 4vw, 38px)",
    fontWeight: 900,
    color: "white",
    margin: "0 0 12px 0",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: "0 auto 28px auto",
  },

  tabToggle: {
    display: "inline-flex",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 14,
    padding: 5,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    gap: 4,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tabBtnActive: {
    padding: "10px 20px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  tabBtnInactive: {
    padding: "10px 20px",
    borderRadius: 10,
    background: "transparent",
    color: "#94a3b8",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  refreshBtn: {
    padding: "8px 16px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },

  emptyCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px dashed rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    padding: "48px 24px",
    textAlign: "center",
  },

  inquiryCard: {
    background: "rgba(255, 255, 255, 0.035)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 18,
    padding: "24px 28px",
  },
  inquiryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  packageBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: "#86efac",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    padding: "3px 10px",
    borderRadius: 20,
    display: "inline-block",
  },

  inquiryDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
    background: "rgba(0, 0, 0, 0.2)",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  detailLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 3,
    fontWeight: 600,
  },

  inquiryActions: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  },
  whatsappBtn: {
    padding: "9px 16px",
    background: "#25D366",
    color: "#052e16",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 800,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  emailBtn: {
    padding: "9px 16px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "white",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },
  copyToAdBtn: {
    padding: "9px 16px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  editorCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 22,
    padding: "32px",
  },
  saveAlert: {
    padding: "12px 18px",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    color: "#86efac",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 20,
  },
  slotBox: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.07)",
    borderRadius: 16,
    padding: 22,
  },
  slotHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  slotTag: {
    fontSize: 10,
    fontWeight: 800,
    color: "#a78bfa",
    background: "rgba(124, 58, 237, 0.15)",
    padding: "3px 8px",
    borderRadius: 6,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#cbd5e1",
    display: "block",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  },
  saveLiveBtn: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #16a34a, #059669)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(22, 163, 74, 0.4)",
  },

  guideCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 22,
    padding: "36px 32px",
  },
  guideSteps: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: 20,
  },
  guideStep: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    padding: "18px 22px",
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    flexShrink: 0,
  },
};
