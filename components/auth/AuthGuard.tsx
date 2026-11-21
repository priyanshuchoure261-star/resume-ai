"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

type AuthGuardProps = {
  children: React.ReactNode;
  fallbackMessage?: string;
  autoRedirect?: boolean;
};

export default function AuthGuard({
  children,
  fallbackMessage = "Please log in to build, optimize, and export your tailored resumes.",
  autoRedirect = false,
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && autoRedirect) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/create")}`);
    }
  }, [user, isLoading, autoRedirect, router, pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.12), transparent 40%), #0a0a14",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "3px solid rgba(124, 58, 237, 0.2)",
            borderTopColor: "#a78bfa",
            animation: "auth-spin 0.8s linear infinite",
            marginBottom: 20,
          }}
        />
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Verifying your session...</p>
        <style>{`
          @keyframes auth-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || "/create")}`;
    return (
      <div
        style={{
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.15), transparent 50%), #07070d",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "rgba(255, 255, 255, 0.035)",
            border: "1px solid rgba(124, 58, 237, 0.3)",
            borderRadius: 24,
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(79, 70, 229, 0.25))",
              border: "1px solid rgba(167, 139, 250, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 20px auto",
            }}
          >
            🔒
          </div>

          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 700,
              color: "#a78bfa",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Access Restricted
          </span>

          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "white",
              margin: "0 0 12px 0",
            }}
          >
            Login Required
          </h2>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#94a3b8",
              marginBottom: 28,
            }}
          >
            {fallbackMessage}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href={redirectUrl}
              style={{
                display: "block",
                padding: "13px 24px",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "white",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
              }}
            >
              Log In / Create Account →
            </Link>

            <Link
              href="/"
              style={{
                display: "block",
                padding: "12px 24px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#cbd5e1",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Explore Home Page
            </Link>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            ✨ Free forever for job seekers • No credit card required
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
