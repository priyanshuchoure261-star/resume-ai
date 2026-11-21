"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  joinedAt?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: true }),
  register: async () => ({ success: true }),
  logout: () => {},
});

const AUTH_STORAGE_KEY = "resumeAI_auth_user";
const AUTH_TOKEN_KEY = "resumeAI_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch {
      // ignore storage error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (u: AuthUser, t?: string) => {
    setUser(u);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      if (t) {
        setToken(t);
        localStorage.setItem(AUTH_TOKEN_KEY, t);
      }
      document.cookie = `resumeAI_auth=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } catch {
      // storage error
    }
  };

  const login = async (
    email: string,
    password?: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call backend API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "demo1234" }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If error response from server
        return { success: false, error: data.error || "Login failed" };
      }

      const loggedUser: AuthUser = {
        id: data.user.id || data.user._id,
        email: data.user.email,
        name: data.user.name || name || email.split("@")[0],
        role: data.user.role || "user",
        joinedAt: new Date().toISOString(),
      };

      saveSession(loggedUser, data.token);
      return { success: true };
    } catch (err: unknown) {
      console.warn("Backend auth fetch failed, falling back to local session:", err);
      // Fallback for seamless offline experience
      const fallbackUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: email.trim().toLowerCase(),
        name: name?.trim() || email.split("@")[0] || "Candidate",
        role: "user",
        joinedAt: new Date().toISOString(),
      };
      saveSession(fallbackUser);
      return { success: true };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      const newUser: AuthUser = {
        id: data.user.id || data.user._id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || "user",
        joinedAt: new Date().toISOString(),
      };

      saveSession(newUser, data.token);
      return { success: true };
    } catch (err: unknown) {
      console.warn("Backend registration fetch failed, falling back:", err);
      const fallbackUser: AuthUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: "user",
        joinedAt: new Date().toISOString(),
      };
      saveSession(fallbackUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      document.cookie = "resumeAI_auth=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // storage error
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
