import Link from "next/link";
import NavAuthButton from "@/components/auth/NavAuthButton";
import PromotionSlot from "@/components/ads/PromotionSlot";

const features = [
  {
    number: "01",
    icon: "🔍",
    title: "Understand the job",
    description:
      "ResumeAI analyzes the target company, role expectations, ATS keywords and required qualifications before your resume is written.",
  },
  {
    number: "02",
    icon: "🎯",
    title: "Match your profile",
    description:
      "Your genuine experience, skills and projects are compared with the job criteria. Matched, partial and missing skills are identified transparently.",
  },
  {
    number: "03",
    icon: "📄",
    title: "Build tailored resume",
    description:
      "Generate an honest, ATS-optimized resume using 10 professional templates, instant live preview, and high-fidelity PDF export.",
  },
];

const stats = [
  { value: "10", label: "Professional Templates" },
  { value: "100%", label: "Honest AI Guarantee" },
  { value: "1:1", label: "Job-Tailored Output" },
];

const testimonials = [
  {
    name: "Aman Verma",
    role: "Frontend Engineer at Tech Mahindra",
    avatar: "AV",
    rating: 5,
    badge: "Selected",
    quote:
      "ResumeAI identified exact skill gaps for my target role. The honest AI matching gave me realistic advice instead of buzzwords, and I cleared the technical round on my first attempt.",
  },
  {
    name: "Rhea Sharma",
    role: "Product Intern at Genpact",
    avatar: "RS",
    rating: 5,
    badge: "Internship Offer",
    quote:
      "As a fresher, tailoring my resume was always confusing. The career chatbot answered all my questions about project positioning and ATS keywords in real time.",
  },
  {
    name: "Pooja Mehta",
    role: "Full Stack Developer at HDFC Bank",
    avatar: "PM",
    rating: 5,
    badge: "Hired",
    quote:
      "The 10 professional templates and instant PDF export are unmatched. Being able to compare my resume directly with the job description gave me total confidence.",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      {/* Navigation */}
      <header className="navbar">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span className="brand-name">
              Resume<span>AI</span>
            </span>
          </Link>

          <nav className="desktop-nav">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#testimonials">Reviews</a>
            <Link href="/pricing">Pricing & Ads</Link>
          </nav>

          <div className="nav-actions">
            <NavAuthButton />
            <Link href="/create" className="nav-cta">
              <span>Build Resume</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="hero-grid" />

        <div className="hero-content">
          <div className="eyebrow">
            <span className="status-dot" />
            AI-powered career intelligence
          </div>

          <h1>
            Your resume should be
            <span className="gradient-text"> built for the job.</span>
          </h1>

          <p className="hero-description">
            Tell us the company and position you&apos;re targeting. ResumeAI
            analyzes the job, matches it with your profile, identifies skill gaps,
            and creates an honest, professional resume designed for that opportunity.
          </p>

          <div className="hero-actions">
            <Link href="/create" className="primary-button">
              <span>Build my resume</span>
              <span className="button-arrow">→</span>
            </Link>

            <a href="#how-it-works" className="secondary-button">
              See how it works
            </a>
          </div>

          <div className="hero-trust">
            <div className="avatar-stack">
              <span>AV</span>
              <span>RS</span>
              <span>PM</span>
              <span>+</span>
            </div>

            <div>
              <div className="stars">★★★★★</div>
              <p>Trusted by job seekers across top companies</p>
            </div>
          </div>
        </div>

        {/* Floating Resume Card */}
        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />

          <div className="floating-card card-top">
            <div className="mini-icon green">
              ✓
            </div>
            <div>
              <strong>Job matched</strong>
              <span>Frontend Developer</span>
            </div>
          </div>

          <div className="resume-card">
            <div className="resume-window-bar">
              <div className="window-dots">
                <i />
                <i />
                <i />
              </div>

              <span>resume-preview.pdf</span>

              <div className="window-icon">📄</div>
            </div>

            <div className="resume-paper">
              <div className="resume-header">
                <div>
                  <div className="resume-name">PRIYANSHU CHOURE</div>
                  <div className="resume-role">Frontend Developer</div>
                </div>

                <div className="resume-contact">
                  priyanshu@email.com
                  <br />
                  linkedin.com/in/priyanshu
                </div>
              </div>

              <div className="resume-line" />

              <div className="resume-section">
                <span>PROFILE</span>
                <div className="skeleton large" />
                <div className="skeleton medium" />
              </div>

              <div className="resume-section">
                <span>EXPERIENCE</span>

                <div className="experience-row">
                  <div>
                    <strong>Frontend Developer</strong>
                    <small>Technology Company</small>
                  </div>

                  <em>2024 — Present</em>
                </div>

                <div className="skeleton large" />
                <div className="skeleton medium" />
              </div>

              <div className="resume-section">
                <span>SKILLS</span>

                <div className="skill-pills">
                  <b>React</b>
                  <b>TypeScript</b>
                  <b>Next.js</b>
                  <b>JavaScript</b>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-card card-bottom">
            <div className="score-ring">
              <span>87</span>
            </div>

            <div>
              <strong>Job match score</strong>
              <span>Excellent match</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Sponsorship Slot */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <PromotionSlot slot="banner" />
      </div>

      {/* Trusted Companies */}
      <section className="companies-section">
        <div className="companies-inner">
          <div className="companies-heading">
            <span className="companies-label">TRUSTED CAREER TARGETS</span>
            <p>Build your resume for opportunities at leading companies.</p>
          </div>

          <div className="companies-grid">
            <a
              href="https://www.hdfcbank.com/"
              target="_blank"
              rel="noreferrer"
              className="company-logo hdfc"
              aria-label="HDFC Bank"
            >
              <span className="hdfc-symbol">H</span>
              <span>HDFC BANK</span>
            </a>

            <a
              href="https://www.techmahindra.com/"
              target="_blank"
              rel="noreferrer"
              className="company-logo techmahindra"
              aria-label="Tech Mahindra"
            >
              <span className="tm-mark">⚡</span>
              <span>
                <small>TECH</small>
                mahindra
              </span>
            </a>

            <a
              href="https://www.genpact.com/"
              target="_blank"
              rel="noreferrer"
              className="company-logo genpact"
              aria-label="Genpact"
            >
              <span className="genpact-mark">G</span>
              <span>genpact</span>
            </a>

            <a
              href="https://www.accenture.com/"
              target="_blank"
              rel="noreferrer"
              className="company-logo accenture"
              aria-label="Accenture"
            >
              <span>accenture</span>
              <b>&gt;</b>
            </a>

            <a
              href="https://www.deloitte.com/"
              target="_blank"
              rel="noreferrer"
              className="company-logo deloitte"
              aria-label="Deloitte"
            >
              <span>Deloitte.</span>
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <div className="section-label">HOW IT WORKS</div>

          <h2>
            From job description
            <br />
            to <span>job-ready resume.</span>
          </h2>

          <p>
            Stop sending the same resume everywhere. ResumeAI understands what
            the company is looking for before writing your resume.
          </p>
        </div>

        <div className="feature-grid" id="features">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <div className="feature-number">{feature.number}</div>

              <div className="feature-icon">{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <Link href="/create" className="feature-link">
                Get started <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Product preview */}
      <section className="product-section" id="preview">
        <div className="product-copy">
          <div className="section-label">ONE SMART WORKFLOW</div>

          <h2>
            Know exactly why
            <span> your resume works.</span>
          </h2>

          <p>
            ResumeAI doesn&apos;t just generate content. It shows how your
            profile matches the opportunity and where you can improve.
          </p>

          <div className="check-list">
            <div>
              <span>✓</span>
              Job-specific keywords
            </div>

            <div>
              <span>✓</span>
              Skill match analysis
            </div>

            <div>
              <span>✓</span>
              ATS-friendly formatting
            </div>

            <div>
              <span>✓</span>
              Professional content
            </div>
          </div>

          <Link href="/create" className="text-button">
            Create your resume <span>→</span>
          </Link>
        </div>

        <div className="analysis-panel">
          <div className="analysis-header">
            <div>
              <span>JOB MATCH</span>
              <strong>Frontend Developer</strong>
            </div>

            <div className="match-badge">87% match</div>
          </div>

          <div className="match-progress">
            <div />
          </div>

          <div className="analysis-items">
            <div className="analysis-item">
              <div className="analysis-title">
                <span className="check">✓</span>
                React
              </div>
              <span className="strong-match">Strong match</span>
            </div>

            <div className="analysis-item">
              <div className="analysis-title">
                <span className="check">✓</span>
                TypeScript
              </div>
              <span className="strong-match">Strong match</span>
            </div>

            <div className="analysis-item">
              <div className="analysis-title">
                <span className="check">✓</span>
                REST APIs
              </div>
              <span className="strong-match">Good match</span>
            </div>

            <div className="analysis-item">
              <div className="analysis-title">
                <span className="warning">!</span>
                Next.js
              </div>
              <span className="skill-gap">Skill gap</span>
            </div>
          </div>

          <div className="analysis-footer">
            <div>
              <span>Recommendation</span>
              <p>
                Highlight your React project to strengthen this application.
              </p>
            </div>

            <div className="ai-badge">AI</div>
          </div>
        </div>
      </section>

      {/* Testimonials / Candidate Reviews */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-heading">
          <div className="section-label">CANDIDATE SUCCESS STORIES</div>

          <h2>
            Loved by job seekers
            <br />
            <span>preparing for top roles.</span>
          </h2>

          <p>
            Real feedback from freshers and professionals who landed interviews using ResumeAI.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div>
                <span className="testimonial-badge">{t.badge}</span>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              </div>

              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div className="testimonial-info">
                  <h4>{t.name}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="cta-glow" />

        <div className="section-label">READY WHEN YOU ARE</div>

        <h2>
          Build the resume
          <br />
          <span>your next job deserves.</span>
        </h2>

        <p>
          Your next opportunity starts with a better application.
        </p>

        <Link href="/create" className="primary-button large">
          Start building for free
          <span className="button-arrow">→</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span className="brand-name">
              Resume<span>AI</span>
            </span>
          </Link>

          <p>AI-powered resumes for ambitious careers.</p>

          <div className="footer-links">
            <Link href="/create">Create Resume</Link>
            <Link href="/match">Matching Tool</Link>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Reviews</a>
            <Link href="/pricing">Pricing & Advertising</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
