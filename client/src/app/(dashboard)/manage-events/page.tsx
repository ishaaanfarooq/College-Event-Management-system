"use client";

import { useEffect, useState, useRef } from "react";
import API from "@/api/axios";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { gsap } from "gsap";
import { Trash2, MapPin, Users, CalendarDays, CheckCircle, XCircle } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

export default function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const gridRef = useRef(null);

  const fetchEvents = async () => {
    const res = await API.get("/events");
    // Admins see all. Students only see events they created here.
    const displayEvents = user?.role === "admin"
      ? res.data
      : res.data.filter(ev => ev.createdBy?._id === user?._id);
    setEvents(displayEvents);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("new_application", (data) => {
      if (user && (user._id === data.creatorId || user.role === "admin")) {
        fetchEvents();
        setTimeout(() => {
          const card = document.getElementById(`me-card-${data.eventId}`);
          if (card) {
            gsap.fromTo(card,
              { borderColor: "var(--accent-violet)", borderStyle: "solid", borderWidth: "2px" },
              { borderColor: "var(--border-glass)", borderStyle: "solid", borderWidth: "1px", duration: 3 }
            );
          }
        }, 100);
      }
    });

    return () => {
      socket.off("new_application");
    };
  }, [socket, user]);

  useEffect(() => {
    if (!events.length) return;
    gsap.fromTo(".me-card",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: "power3.out" }
    );
  }, [events]);

  const deleteEvent = async (id) => {
    const card = document.getElementById(`me-card-${id}`);
    gsap.to(card, {
      scale: 0.9, opacity: 0, duration: 0.3, ease: "power3.in",
      onComplete: async () => {
        await API.delete(`/events/${id}`);
        fetchEvents();
      }
    });
  };

  const updateStatus = async (eventId, appId, status) => {
    const message = status === "accepted"
      ? "Congratulations! You have been selected."
      : "Sorry, you were not selected.";
    await API.patch(`/events/application/${eventId}/${appId}`, { status, message });
    fetchEvents();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <DashboardLayout>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "1200px", margin: "0 auto" }}>

        <main style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Manage Events</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.3rem" }}>
            {events.length} total event{events.length !== 1 ? "s" : ""}
          </p>
        </main>

        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            No events yet.
          </div>
        ) : (
          <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {events.map((event) => {
              const appCount = event.applications?.length || 0;
              return (
                <div
                  key={event._id}
                  id={`me-card-${event._id}`}
                  className="card me-card"
                  style={{ overflow: "hidden" }}
                >
                  {event.image ? (
                    <img src={event.image} alt={event.title} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      height: "80px",
                      background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1))",
                      borderBottom: "1px solid var(--border-glass)",
                    }} />
                  )}

                  <div style={{ padding: "1.1rem" }}>
                    <h3 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                      {event.title}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.77rem", color: "var(--text-muted)" }}>
                        <MapPin size={11} /> {event.location}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.77rem", color: "var(--text-muted)" }}>
                        <CalendarDays size={11} /> {formatDate(event.date)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.77rem", color: "var(--text-muted)" }}>
                        <Users size={11} /> {appCount} application{appCount !== 1 ? "s" : ""} / {event.maxCapacity} capacity
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="progress-bar" style={{ marginBottom: "1rem" }}>
                      <div className="progress-bar-fill" style={{ width: `${Math.min((appCount / event.maxCapacity) * 100, 100)}%` }} />
                    </div>

                    {/* Applications List */}
                    {event.applications?.length > 0 && (
                      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent-violet)", marginBottom: "0.75rem" }}>Applicants</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {event.applications.map(app => (
                            <div key={app._id} style={{
                              background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "0.75rem",
                              border: "1px solid var(--border-glass)"
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                <div>
                                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>{app.name}</p>
                                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{app.usn} · {app.email}</p>
                                </div>
                                <span className={`badge badge-${app.status}`} style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
                                  {app.status}
                                </span>
                              </div>
                              {app.status === "pending" && (
                                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                                  <button onClick={() => updateStatus(event._id, app._id, "accepted")}
                                    aria-label={`Accept application from ${app.name}`}
                                    className="btn-success" style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", flex: 1, justifyContent: "center" }}>
                                    <CheckCircle size={10} /> Accept
                                  </button>
                                  <button onClick={() => updateStatus(event._id, app._id, "rejected")}
                                    aria-label={`Reject application from ${app.name}`}
                                    className="btn-danger" style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", flex: 1, justifyContent: "center" }}>
                                    <XCircle size={10} /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {user?.role === "admin" && (
                      <button
                        className="btn-danger"
                        aria-label={`Delete event ${event.title}`}
                        style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
                        onClick={() => deleteEvent(event._id)}
                      >
                        <Trash2 size={13} /> Delete Event
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}