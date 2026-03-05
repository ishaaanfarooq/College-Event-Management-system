import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import { gsap } from "gsap";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  ShieldCheck,
  Settings,
  LogOut,
  Layers,
  BarChart3,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "student"], permission: null },
  { path: "/my-applications", label: "My Applications", icon: CalendarDays, roles: ["admin", "student"], permission: null },
  { path: "/create-event", label: "Create Event", icon: PlusCircle, roles: ["admin", "student"], permission: null },
  { path: "/manage-events", label: "Manage Events", icon: Settings, roles: ["admin", "student"], permission: null },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "student"], permission: null },
  { path: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin"], permission: null },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".nav-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.2 }
      );
    }, sidebarRef);
    return () => ctx.revert();
  }, [location.pathname]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const visibleNav = navItems.filter((item) => {
    if (!item.roles.includes(user?.role)) {
      if (item.permission === "canCreate" && user?.canCreateEvent) return true;
      return false;
    }
    if (item.permission === "canCreate" && user?.role !== "admin" && !user?.canCreateEvent) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", position: "relative" }}>
      {/* Skip to Content */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          top: "-100px",
          left: "20px",
          background: "var(--accent-violet)",
          color: "white",
          padding: "10px 20px",
          zIndex: 9999,
          borderRadius: "8px",
          transition: "top 0.3s"
        }}
        onFocus={(e) => e.target.style.top = "20px"}
        onBlur={(e) => e.target.style.top = "-100px"}
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          width: "260px",
          minHeight: "100vh",
          background: "rgba(5, 5, 15, 0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid var(--border-glass)",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1rem",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2.5rem", padding: "0 0.4rem" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
            flexShrink: 0,
          }}>
            <Layers size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            College<span style={{ color: "var(--accent-violet)" }}>EMS</span>
          </span>
        </div>

        {/* Nav */}
        <nav aria-label="Main Navigation" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {visibleNav.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`nav-item ${active ? "nav-active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "10px",
                  color: active ? "#fff" : "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.2s ease",
                  border: active ? undefined : "1px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-violet), var(--accent-pink))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "capitalize" }}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-ghost"
            style={{ width: "100%", justifyContent: "center", color: "#f87171", borderColor: "rgba(239,68,68,0.15)" }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main id="main-content" ref={mainRef} style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}