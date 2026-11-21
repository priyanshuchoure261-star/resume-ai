"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "./AuthContext";

export default function NavAuthButton() {
  const { user, logout } = useAuth();

  if (user) {
    const firstName = user.name.split(" ")[0];
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
        <Link
          href="/dashboard"
          style={{
            color: "#c4b5fd",
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            background: "rgba(124, 58, 237, 0.14)",
            border: "1px solid rgba(124, 58, 237, 0.35)",
            padding: "6px 12px",
            borderRadius: 8,
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span>📂</span>
          <span>Dashboard</span>
        </Link>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            padding: "5px 10px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{firstName}</span>
          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: 11,
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              transition: "color 0.15s",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      style={{
        color: "#cbd5e1",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: 8,
        whiteSpace: "nowrap",
        transition: "color 0.2s",
      }}
    >
      Log in
    </Link>
  );
}
