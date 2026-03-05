import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import { gsap } from "gsap";
import { Mail, KeyRound, Lock, ArrowRight, Layers } from "lucide-react";

export default function ForgotPassword() {
    const navigate = useNavigate();
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

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/verify-otp", { email, otp });
            toast.success("OTP verified");
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error("Password must be at least 8 chars, 1 uppercase, 1 number, and 1 special character.", {
                style: { background: "rgba(13,13,26,0.9)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
            });
            return;
        }

        setLoading(true);
        try {
            await API.post("/auth/reset-password", { email, otp, newPassword });
            toast.success("Password reset successfully! Please login.");
            navigate("/login");
        } catch (err) {
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

            <main ref={cardRef} style={{
                width: "100%", maxWidth: "420px", background: "rgba(13, 13, 26, 0.85)",
                backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid var(--border-glass)",
                borderRadius: "24px", padding: "2.5rem", boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.1)",
                position: "relative", zIndex: 1,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
                        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
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
                            <input type="email" placeholder="Email address" aria-label="Email address" className="input" style={{ paddingLeft: "2.5rem" }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", justifyContent: "center" }}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <KeyRound size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <input type="text" placeholder="6-digit OTP" aria-label="6-digit OTP" className="input" style={{ paddingLeft: "2.5rem", letterSpacing: "3px", fontWeight: "bold" }} maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", justifyContent: "center" }}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <Lock size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                            <input type="password" placeholder="New Password" aria-label="New Password" className="input" style={{ paddingLeft: "2.5rem" }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem", justifyContent: "center" }}>
                            {loading ? "Resetting..." : (<>Reset Password <ArrowRight size={15} /></>)}
                        </button>
                    </form>
                )}

                <div className="divider" />
                <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem" }}>
                    Remembered it? <Link to="/login" style={{ color: "var(--accent-violet)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                </p>
            </main>
        </div>
    );
}
