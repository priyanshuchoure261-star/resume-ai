"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/create";

  const { login, register, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in
  if (user) {
    return (
      <div style={styles.card}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <h2 style={{ color: "white", fontSize: 24, fontWeight: 800, margin: "0 0 10px 0" }}>
          Welcome back, {user.name}!
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
          You are already signed in as <strong>{user.email}</strong>.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => router.push(redirectTarget)}
            style={styles.primaryBtn}
          >
            Continue to Resume →
          </button>
          <Link href="/" style={styles.secondaryBtn}>
            Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (mode === "signup") {
        result = await register(name, email, password);
      } else {
        result = await login(email, password, name);
      }

      if (result && !result.success) {
        setError(result.error || "Authentication failed. Please check your credentials.");
      } else {
        router.push(redirectTarget);
      }
    } catch {
      setError("Failed to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setSubmitting(true);
    setError("");
    try {
      await login("demo.candidate@resumeai.io", "Demo Candidate");
      router.push(redirectTarget);
    } catch {
      setError("Demo login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Brand logo */}
      <Link href="/" style={styles.brand}>
        <span style={styles.brandMark}>
          <span />
          <span />
          <span />
        </span>
        <span style={styles.brandText}>
          Resume<span style={{ color: "#a78bfa" }}>AI</span>
        </span>
      </Link>

      {/* Tabs */}
      <div style={styles.tabGroup}>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          style={mode === "login" ? styles.tabActive : styles.tabInactive}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
          }}
          style={mode === "signup" ? styles.tabActive : styles.tabInactive}
        >
          Create Account
        </button>
      </div>

      <h2 style={styles.title}>
        {mode === "login" ? "Sign in to your account" : "Create your free account"}
      </h2>
      <p style={styles.subtitle}>
        {mode === "login"
          ? "Access your saved resumes, job match reports, and career chatbot."
          : "Start building ATS-tailored resumes for your target jobs in minutes."}
      </p>

      {/* Quick Demo Button */}
      <div style={{ marginBottom: 24 }}>
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={submitting}
          style={styles.demoBtn}
        >
          ⚡ 1-Click Instant Demo Login
        </button>
        <div style={styles.divider}>
          <span>OR CONTINUE WITH EMAIL</span>
        </div>
      </div>

      {error && <div style={styles.errorBox}>⚠ {error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {mode === "signup" && (
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              style={styles.input}
              required
            />
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={styles.input}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={submitting ? styles.btnDisabled : styles.primaryBtn}
        >
          {submitting
            ? "Signing in..."
            : mode === "login"
            ? "Sign In →"
            : "Create Free Account →"}
        </button>
      </form>

      <div style={styles.footerNote}>
        By signing in, you agree to ResumeAI&apos;s Terms of Service and Privacy Policy.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={styles.page}>
      <Suspense fallback={<div style={{ color: "#94a3b8" }}>Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.16), transparent 45%), #05050a",
    color: "#e2e8f0",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "40px 20px",
  },
  card: {
    maxWidth: 460,
    width: "100%",
    background: "rgba(255, 255, 255, 0.035)",
    border: "1px solid rgba(124, 58, 237, 0.28)",
    borderRadius: 24,
    padding: "38px 32px",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
    backdropFilter: "blur(20px)",
    textAlign: "center",
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    marginBottom: 24,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    display: "inline-block",
  },
  brandText: {
    fontSize: 20,
    fontWeight: 800,
    color: "white",
    letterSpacing: -0.5,
  },
  tabGroup: {
    display: "flex",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabActive: {
    flex: 1,
    padding: "9px 16px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  tabInactive: {
    flex: 1,
    padding: "9px 16px",
    background: "transparent",
    color: "#94a3b8",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "white",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 1.5,
    margin: "0 0 24px 0",
  },
  demoBtn: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    borderRadius: 12,
    color: "#86efac",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  divider: {
    position: "relative",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    textAlign: "left",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#cbd5e1",
  },
  input: {
    padding: "12px 14px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 10,
    color: "white",
    fontSize: 14,
    outline: "none",
  },
  errorBox: {
    padding: "10px 14px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: 10,
    color: "#fca5a5",
    fontSize: 12,
    marginBottom: 16,
    textAlign: "left",
  },
  primaryBtn: {
    padding: "13px 20px",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "white",
    border: "none",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
    textDecoration: "none",
    textAlign: "center",
  },
  secondaryBtn: {
    padding: "13px 20px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#cbd5e1",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    textAlign: "center",
  },
  btnDisabled: {
    padding: "13px 20px",
    background: "rgba(124, 58, 237, 0.3)",
    color: "#94a3b8",
    border: "none",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 700,
    cursor: "not-allowed",
  },
  footerNote: {
    marginTop: 22,
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.5,
  },
};
