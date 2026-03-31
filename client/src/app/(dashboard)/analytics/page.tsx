"use client";

import { useEffect, useState, useRef } from "react";
import API from "@/api/axios";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { gsap } from "gsap";
import { BarChart3, Users, Eye, Clock, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";

export default function Analytics() {
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const pageRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await API.get("/events/creator/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (!loading && stats.length > 0) {
            gsap.fromTo(".stat-card",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }
            );
            gsap.fromTo(".chart-bar-fill",
                { height: 0 },
                { height: (i, el) => el.dataset.height, duration: 1, ease: "power2.out", delay: 0.5 }
            );
        }
    }, [loading, stats]);

    const totalViews = stats.reduce((acc, s) => acc + s.views, 0);
    const totalDwellTime = stats.reduce((acc, s) => acc + s.dwellTime, 0);
    const totalApps = stats.reduce((acc, s) => acc + s.applications, 0);

    const formatTime = (ms) => {
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        if (min > 0) return `${min}m ${sec % 60}s`;
        return `${sec}s`;
    };

    const avgEngagement = stats.length > 0
        ? (stats.reduce((acc, s) => acc + parseFloat(s.engagementScore), 0) / stats.length).toFixed(1)
        : 0;

    if (loading) {
        return (
            <DashboardLayout>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>
                    Loading analytics...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <main ref={pageRef} style={{ padding: "2rem 2.5rem", maxWidth: "1100px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <BarChart3 size={24} color="var(--accent-violet)" /> Creator Analytics
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.4rem" }}>
                        Data-driven insights for your {stats.length} hosted event{stats.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Global Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
                    {[
                        { label: "Total Views", value: totalViews, icon: Eye, color: "#6366f1" },
                        { label: "Total Screen Time", value: formatTime(totalDwellTime), icon: Clock, color: "#a78bfa" },
                        { label: "Total Applications", value: totalApps, icon: Users, color: "#22d3ee" },
                        { label: "Avg. Engagement", value: `${avgEngagement}%`, icon: TrendingUp, color: "#4ade80" },
                    ].map((stat, i) => (
                        <div key={i} className="stat-card" style={{
                            background: "rgba(13, 13, 26, 0.7)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "20px",
                            padding: "1.5rem",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                width: "40px", height: "40px", borderRadius: "12px",
                                background: `${stat.color}15`, border: `1px solid ${stat.color}33`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginBottom: "1rem"
                            }}>
                                <stat.icon size={20} color={stat.color} />
                            </div>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</p>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>{stat.value}</h2>
                        </div>
                    ))}
                </div>

                {/* Engagement Charts / List */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>

                    {/* Detailed Event Table */}
                    <div className="stat-card" style={{
                        background: "rgba(13, 13, 26, 0.5)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "24px",
                        padding: "1.75rem",
                        overflowX: "auto"
                    }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Event Performance</h3>

                        {stats.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No event data available yet.</p>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                                <thead>
                                    <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-glass)" }}>
                                        <th style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Event Title</th>
                                        <th style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Views</th>
                                        <th style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Apps</th>
                                        <th style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Screen Time</th>
                                        <th style={{ padding: "1rem", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Engagement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((ev) => (
                                        <tr key={ev._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                            <td style={{ padding: "1.25rem 1rem" }}>
                                                <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{ev.title}</p>
                                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ev.category}</span>
                                            </td>
                                            <td style={{ padding: "1rem", color: "var(--text-primary)", fontWeight: 500 }}>{ev.views}</td>
                                            <td style={{ padding: "1rem", color: "var(--text-primary)", fontWeight: 500 }}>{ev.applications}</td>
                                            <td style={{ padding: "1rem", color: "var(--text-primary)", fontWeight: 500 }}>{formatTime(ev.dwellTime)}</td>
                                            <td style={{ padding: "1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden", minWidth: "60px" }}>
                                                        <div className="chart-bar-fill"
                                                            data-height="100%"
                                                            style={{ height: "100%", width: `${Math.min(ev.engagementScore * 2, 100)}%`, background: "var(--accent-violet)" }} />
                                                    </div>
                                                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-violet)" }}>{ev.engagementScore}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Dwell Time Breakdown (Horizontal Bars) */}
                    {stats.length > 0 && (
                        <div className="stat-card" style={{
                            background: "rgba(13, 13, 26, 0.5)",
                            border: "1px solid var(--border-glass)",
                            borderRadius: "24px",
                            padding: "1.75rem",
                        }}>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>Screen Time Distribution (ms)</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                {stats.map((ev) => {
                                    const maxDwell = Math.max(...stats.map(s => s.dwellTime), 1);
                                    const widthPct = (ev.dwellTime / maxDwell) * 100;
                                    return (
                                        <div key={ev._id}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                                                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>{ev.title}</span>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatTime(ev.dwellTime)}</span>
                                            </div>
                                            <div style={{ height: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", overflow: "hidden" }}>
                                                <div className="chart-bar-fill-horiz" style={{ height: "100%", width: `${widthPct}%`, background: "linear-gradient(90deg, var(--accent-violet), var(--accent-indigo))", borderRadius: "6px" }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
}
