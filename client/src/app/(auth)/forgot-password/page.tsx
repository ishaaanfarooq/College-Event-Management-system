"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import API from "@/api/axios";
import { toast } from "react-toastify";
import { gsap } from "gsap";
import { Mail, KeyRound, Lock, ArrowRight, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ForgotPassword() {
    const router = useRouter();
    const cardRef = useRef(null);

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        gsap.fromTo(
            cardRef.current,
            { y: 40, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
        );
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/verify-otp", { email, otp });
            toast.success("OTP verified");
            setStep(3);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error("Password must be at least 8 chars, 1 uppercase, 1 number, and 1 special character.", {
                style: { background: "var(--glass-bg)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
            });
            return;
        }

        setLoading(true);
        try {
            await API.post("/auth/reset-password", { email, otp, newPassword });
            toast.success("Password reset successfully! Please login.");
            router.push("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-base)", position: "relative", overflow: "hidden", padding: "2rem",
        }}>
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <div style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10 }}>
                <ThemeToggle />
            </div>

            <main ref={cardRef} style={{
                width: "100%", maxWidth: "420px", background: "var(--glass-bg)",
                backdropFilter: "blur(var(--glass-blur))", WebkitBackdropFilter: "blur(var(--glass-blur))", border: "1px solid var(--border-glass)",
                borderRadius: "24px", padding: "2.5rem", boxShadow: "var(--shadow-card), var(--shadow-glow)",
                position: "relative", zIndex: 1,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
                        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
                    }}>
                        <Layers size={20} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>College<span style={{ color: "var(--accent-violet)" }}>EMS</span></span>
                </div>

                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", marginBottom: "0.4rem" }}>
                    {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "New Password"}
                </h1>
                <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem", marginBottom: "2rem" }}>
                    {step === 1 && "Enter your email to receive a reset code."}
                    {step === 2 && `Enter the 6-digit code sent to ${email}`}
                    {step === 3 && "Create a secure new password."}
                </p>

                {step === 1 && (
                    <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <Mail size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <Input type="email" placeholder="Email address" aria-label="Email address" className="input" style={{ paddingLeft: "2.5rem" }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <Button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", justifyContent: "center", height: "auto" }}>
                            {loading ? "Sending..." : "Send OTP"}
                        </Button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <KeyRound size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <Input type="text" placeholder="6-digit OTP" aria-label="6-digit OTP" className="input" style={{ paddingLeft: "2.5rem", letterSpacing: "3px", fontWeight: "bold" }} maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>
                        <Button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", justifyContent: "center", height: "auto" }}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <Lock size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <Input type="password" placeholder="New Password" aria-label="New Password" className="input" style={{ paddingLeft: "2.5rem" }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", justifyContent: "center", height: "auto" }}>
                            {loading ? "Resetting..." : (<>Reset Password <ArrowRight size={15} /></>)}
                        </Button>
                    </form>
                )}

                <div className="divider" />
                <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem" }}>
                    Remembered it? <Link href="/login" style={{ color: "var(--accent-violet)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                </p>
            </main>
        </div>
    );
}
