"use client";

import { useEffect, useState, useRef } from "react";
import API from "@/api/axios";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { gsap } from "gsap";
import { Users, ShieldCheck, CheckCircle, XCircle, ToggleLeft, ToggleRight, CalendarCheck } from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const pageRef = useRef(null);

  const fetchUsers = async () => { const res = await API.get("/admin/users"); setUsers(res.data); };
  const fetchEvents = async () => { const res = await API.get("/events"); setEvents(res.data); };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
    gsap.fromTo(".ap-section",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  const togglePermission = async (id) => {
    await API.patch(`/admin/permission/${id}`);
    fetchUsers();
  };

  const updateStatus = async (eventId, appId, status) => {
    const message = status === "accepted"
      ? "Congratulations! You have been selected."
      : "Sorry, you were not selected.";
    await API.patch(`/events/application/${eventId}/${appId}`, { status, message });
    fetchEvents();
  };

  const reviewEvent = async (id, status) => {
    await API.patch(`/events/review/${id}`, { status });
    fetchEvents();
  };

  const pendingTotal = events.reduce((acc, ev) => acc + ev.applications.filter(a => a.status === "pending").length, 0);
  const pendingEventsTotal = events.filter(ev => ev.status === "pending_review").length;

  return (
    <ProtectedRoute requireAdmin={true}>
    <DashboardLayout>
      <div ref={pageRef} style={{ padding: "2rem 2.5rem", maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <main style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={22} color="var(--accent-violet)" /> Admin Panel
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.3rem" }}>
            {users.length} users · {pendingEventsTotal} pending events · {pendingTotal} pending applications
          </p>
        </main>

        {/* ── Users ── */}
        <div className="ap-section" style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-violet)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Users size={15} /> User Permissions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {users.map((u) => (
              <div key={u._id} style={{
                background: "rgba(13,13,26,0.7)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--border-glass)",
                borderRadius: "16px",
                padding: "1.1rem 1.25rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700, color: "#fff",
                  }}>
                    {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    padding: "0.15rem 0.5rem", borderRadius: "99px",
                    background: u.role === "admin" ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.06)",
                    color: u.role === "admin" ? "var(--accent-violet)" : "var(--text-muted)",
                    border: `1px solid ${u.role === "admin" ? "rgba(124,58,237,0.3)" : "var(--border-glass)"}`,
                  }}>
                    {u.role}
                  </span>

                  {u.role !== "admin" && (
                    <button
                      onClick={() => togglePermission(u._id)}
                      aria-label={`${u.canCreateEvent ? 'Revoke' : 'Grant'} event creation permission for ${u.name}`}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.3rem 0.7rem", borderRadius: "8px", cursor: "pointer",
                        fontSize: "0.72rem", fontWeight: 600, border: "none",
                        background: u.canCreateEvent ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
                        color: u.canCreateEvent ? "#f87171" : "#4ade80",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {u.canCreateEvent ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {u.canCreateEvent ? "Revoke" : "Grant"} Create
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Event Approvals ── */}
        <div className="ap-section" style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-violet)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <CalendarCheck size={15} /> Event Initial Review
          </h2>

          {events.filter(ev => ev.status === "pending_review").length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No events pending review.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              {events.filter(ev => ev.status === "pending_review").map((event) => (
                <div key={event._id} style={{
                  background: "rgba(13,13,26,0.7)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem"
                }}>
                  <div>
                    <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem" }}>{event.title}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                      Created by: {event.createdBy?.name || "Unknown"} · 📍 {event.location}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button className="btn-success" aria-label={`Approve event ${event.title}`} onClick={() => reviewEvent(event._id, "published")}>
                      <CheckCircle size={12} /> Approve Event
                    </button>
                    <button className="btn-danger" aria-label={`Reject event ${event.title}`} onClick={() => reviewEvent(event._id, "rejected")}>
                      <XCircle size={12} /> Reject Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Applications ── */}
        <div className="ap-section">
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-violet)", marginBottom: "1rem" }}>
            Event Applications
          </h2>

          {events.filter(ev => ev.applications?.length > 0).length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No applications yet.</p>
          ) : (
            events.map((event) =>
              event.applications?.length > 0 ? (
                <div key={event._id} style={{
                  background: "rgba(13,13,26,0.7)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "20px",
                  padding: "1.25rem",
                  marginBottom: "1rem",
                }}>
                  <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>
                    {event.title}
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 400 }}>
                      ({event.applications.length} application{event.applications.length !== 1 ? "s" : ""})
                    </span>
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {event.applications.map((app) => (
                      <div key={app._id} style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "12px",
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}>
                        <div>
                          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem" }}>{app.name}</p>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{app.email} · {app.phone} · {app.usn}</p>
                          {app.message && <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.2rem" }}>{app.message}</p>}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={`badge badge-${app.status}`}>{app.status}</span>
                          {app.status === "pending" && (event.createdBy?._id === user?._id || event.createdBy === user?._id) && (
                            <>
                              <button className="btn-success" aria-label={`Accept application from ${app.name} for ${event.title}`} onClick={() => updateStatus(event._id, app._id, "accepted")}>
                                <CheckCircle size={12} /> Accept
                              </button>
                              <button className="btn-danger" aria-label={`Reject application from ${app.name} for ${event.title}`} onClick={() => updateStatus(event._id, app._id, "rejected")}>
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )
          )}
        </div>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}