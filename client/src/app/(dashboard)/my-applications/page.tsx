"use client";

import { useEffect, useState, useRef } from "react";
import API from "@/api/axios";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { gsap } from "gsap";
import { CalendarDays, CheckCircle, XCircle, Clock, Inbox } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export default function MyApplications() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("application_status_update", (data) => {
      if (user && user._id === data.userId) {
        fetchApplications();
      }
    });

    return () => {
      socket.off("application_status_update");
    };
  }, [socket, user]);

  useEffect(() => {
    if (!events.length) return;
    gsap.fromTo(".app-card",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.55, ease: "power3.out" }
    );
  }, [events]);

  const fetchApplications = async () => {
    const res = await API.get("/events");
    const applied = res.data.filter(ev =>
      ev.applications.some(a => a.user?._id === user._id)
    );
    setEvents(applied);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const statusIcon = (status) => {
    if (status === "accepted") return <CheckCircle size={14} color="#4ade80" aria-label="Accepted" role="img" />;
    if (status === "rejected") return <XCircle size={14} color="#f87171" aria-label="Rejected" role="img" />;
    return <Clock size={14} color="#fbbf24" aria-label="Pending" role="img" />;
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "860px", margin: "0 auto" }}>

        <main style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CalendarDays size={22} color="var(--accent-violet)" /> My Applications
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.3rem" }}>
            {events.length} event{events.length !== 1 ? "s" : ""} applied
          </p>
        </main>

        {events.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "4rem",
            background: "rgba(13,13,26,0.6)",
            border: "1px solid var(--border-glass)",
            borderRadius: "20px",
          }}>
            <Inbox size={40} style={{ margin: "0 auto 1rem", color: "var(--text-muted)", opacity: 0.5 }} />
            <p style={{ color: "var(--text-muted)" }}>You haven't applied to any events yet.</p>
          </div>
        ) : (
          <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {events.map((event) => {
              const app = event.applications.find(a => a.user?._id === user._id);
              return (
                <div key={event._id} className="app-card" style={{
                  background: "rgba(13,13,26,0.7)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid ${app.status === "accepted" ? "rgba(34,197,94,0.2)" : app.status === "rejected" ? "rgba(239,68,68,0.2)" : "var(--border-glass)"}`,
                  borderRadius: "16px",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  transition: "border-color 0.2s ease",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      {statusIcon(app.status)}
                      <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "1rem" }}>
                        {event.title}
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <CalendarDays size={11} /> {formatDate(event.date)}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        📍 {event.location}
                      </span>
                    </div>
                    {app.message && (
                      <p style={{
                        marginTop: "0.6rem", fontSize: "0.8rem",
                        color: app.status === "accepted" ? "#4ade80" : app.status === "rejected" ? "#f87171" : "var(--text-muted)",
                        background: app.status === "accepted" ? "rgba(34,197,94,0.06)" : app.status === "rejected" ? "rgba(239,68,68,0.06)" : "transparent",
                        padding: app.message ? "0.4rem 0.75rem" : 0,
                        borderRadius: "8px",
                        borderLeft: `2px solid ${app.status === "accepted" ? "#4ade80" : app.status === "rejected" ? "#f87171" : "transparent"}`,
                      }}>
                        {app.message}
                      </p>
                    )}
                  </div>

                  <span className={`badge badge-${app.status}`} style={{ flexShrink: 0 }}>
                    {app.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}