"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { gsap } from "gsap";
import { Mail, Lock, Layers, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuth();
  const cardRef = useRef(null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
    );
    gsap.fromTo(
      ".login-field",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      position: "relative",
      overflow: "hidden",
      padding: "2rem",
    }}>
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <main ref={cardRef} style={{
        width: "100%",
        maxWidth: "420px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        border: "1px solid var(--border-glass)",
        borderRadius: "24px",
        padding: "2.5rem",
        boxShadow: "var(--shadow-card), var(--shadow-glow)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
          }}>
            <Layers size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
            College<span style={{ color: "var(--accent-violet)" }}>EMS</span>
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", marginBottom: "0.4rem" }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Sign in to your account
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Email */}
          <div className="login-field" style={{ position: "relative" }}>
            <Mail size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <Input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="login-field" style={{ position: "relative" }}>
            <Lock size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <Input
              type="password"
              placeholder="Password"
              aria-label="Password"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <p aria-live="polite" style={{ color: "#f87171", fontSize: "0.8rem", textAlign: "center", background: "rgba(239,68,68,0.08)", padding: "0.6rem", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.15)" }}>
              {error}
            </p>
          )}

          <div className="login-field" style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="/forgot-password" style={{ color: "var(--accent-violet)", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="login-field btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", height: "auto" }}
          >
            {loading ? "Signing in…" : (<>Sign In <ArrowRight size={15} /></>)}
          </Button>
        </form>

        <div className="divider" />

        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem" }}>
          No account?{" "}
          <Link href="/register" style={{ color: "var(--accent-violet)", fontWeight: 600, textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </main>
    </div>
  );
}