import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import { gsap } from "gsap";
import { User, Mail, Lock, Layers, ArrowRight } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }
    );
    gsap.fromTo(
      ".reg-field",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const registerUser = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      toast.error("Password must be at least 8 chars, 1 uppercase, 1 number, and 1 special character.", {
        position: "top-center",
        autoClose: 6000,
        style: { background: "rgba(13,13,26,0.9)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
      });
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", form);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Check details.", {
        position: "top-center",
        autoClose: 5000,
        style: { background: "rgba(13,13,26,0.9)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", type: "text", placeholder: "Full name", Icon: User },
    { key: "email", type: "email", placeholder: "Email address", Icon: Mail },
    { key: "password", type: "password", placeholder: "Create password", Icon: Lock },
  ];

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
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main ref={cardRef} style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(13, 13, 26, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid var(--border-glass)",
        borderRadius: "24px",
        padding: "2.5rem",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.1)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}>
            <Layers size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
            College<span style={{ color: "var(--accent-violet)" }}>EMS</span>
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", textAlign: "center", marginBottom: "0.4rem" }}>
          Create an account
        </h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Join your college event platform
        </p>

        <form onSubmit={registerUser} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {fields.map(({ key, type, placeholder, Icon }) => (
            <div key={key} className="reg-field" style={{ position: "relative" }}>
              <Icon size={15} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input
                type={type}
                placeholder={placeholder}
                aria-label={placeholder}
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="reg-field btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.8rem" }}
          >
            {loading ? "Creating…" : (<>Create Account <ArrowRight size={15} /></>)}
          </button>
        </form>

        <div className="divider" />

        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent-violet)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}