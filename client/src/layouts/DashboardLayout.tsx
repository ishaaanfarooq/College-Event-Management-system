import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import AccessibilityToolbar from "../components/AccessibilityToolbar";
import { ThemeToggle } from "@/components/ThemeToggle";
import ChatBot from "@/components/ChatBot";
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
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "student"], permission: null },
  { path: "/my-applications", label: "My Applications", icon: CalendarDays, roles: ["admin", "student"], permission: null },
  { path: "/create-event", label: "Create Event", icon: PlusCircle, roles: ["admin", "student"], permission: null },
  { path: "/manage-events", label: "Manage Events", icon: Settings, roles: ["admin", "student"], permission: null },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "student"], permission: null },
  { path: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin"], permission: null },
];

export default function DashboardLayout({ children }: any) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
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
  }, [pathname]);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const visibleNav = navItems.filter((item) => {
    const userRole = user?.role || "student";
    if (!item.roles.includes(userRole)) {
      if (item.permission === "canCreate" && user?.canCreateEvent) return true;
      return false;
    }
    if (item.permission === "canCreate" && user?.role !== "admin" && !user?.canCreateEvent) return false;
    return true;
  });

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen bg-[var(--bg-base)] font-sans">
      {/* Skip to Content */}
      <a
        href="#main-content"
        className="absolute -top-40 left-6 bg-[var(--accent-violet)] text-white px-5 py-2.5 z-[9999] rounded-xl transition-all focus:top-6"
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1 opacity-20 dark:opacity-30" />
        <div className="orb orb-2 opacity-10 dark:opacity-20" />
        <div className="orb orb-3 opacity-15 dark:opacity-25" />
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="w-64 min-h-screen glass dark:glass-dark border-r border-[var(--border-glass)] flex flex-col p-6 sticky top-0 h-screen z-50 transition-all"
      >
        {/* Logo & Theme Toggle */}
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-indigo)] flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Layers size={20} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-[var(--text-primary)]">
              College<span className="text-[var(--accent-violet)]">EMS</span>
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar" aria-label="Main Navigation">
          {visibleNav.map(({ path, label, icon: Icon }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                className={`
                  nav-item group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300
                  ${active 
                    ? "bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-indigo)] text-white shadow-md shadow-[var(--accent-violet)]/20" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--accent-violet)]/8 hover:text-[var(--text-primary)] border border-transparent"}
                `}
              >
                <Icon size={18} className={active ? "text-white" : "text-[var(--text-muted)] group-hover:text-[var(--accent-violet)] transition-colors"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="pt-6 mt-6 border-t border-[var(--border-glass)] space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-violet)] to-[var(--accent-indigo)] p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-[var(--bg-base)] flex items-center justify-center text-xs font-black text-[var(--accent-violet)] uppercase">
                   {initials}
                </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                {user?.name}
              </p>
              <p className="text-[10px] font-black text-[var(--accent-indigo)] uppercase tracking-widest">
                {user?.role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-3 h-11 px-4 text-red-500 font-bold hover:bg-red-500/10 hover:text-red-500 rounded-xl"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" ref={mainRef} className="flex-1 overflow-y-auto relative z-10">
        {children}
      </main>
      <ChatBot />
    </div>
    </ProtectedRoute>
  );
}