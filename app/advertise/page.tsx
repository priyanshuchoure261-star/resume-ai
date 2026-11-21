"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdvertiseRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pricing");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#07070f",
        color: "#94a3b8",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      Redirecting to Advertising & Sponsorship Rate Cards...
    </div>
  );
}
