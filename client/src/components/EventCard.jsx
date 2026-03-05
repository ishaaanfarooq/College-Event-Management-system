import { useEffect, useRef } from "react";
import API from "../api/axios";
import { MapPin, Clock, Users, Star, CheckCircle, XCircle, Tag, Send, Trash2 } from "lucide-react";

const CATEGORY_COLOR = {
    Placement: "#6366f1",
    Department: "#22d3ee",
    Volunteer: "#4ade80",
    Hackathon: "#f59e0b",
    Workshop: "#ec4899",
    Other: "#a78bfa",
};

export default function EventCard({ event, user, onApplyToggle, isSelected, applyForm, onApplyChange, onApplySubmit, onDelete, formatDate }) {
    const cardRef = useRef(null);
    const startTimeRef = useRef(null);

    const acceptedCount = event.applications.filter(a => a.status === "accepted").length;
    const isFull = acceptedCount >= event.maxCapacity;
    const isClosed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
    const isCreator = event.createdBy?._id === user?._id;
    const myApp = event.applications.find(a => a.user?._id === user?._id);
    const pct = Math.round((acceptedCount / event.maxCapacity) * 100);
    const catColor = CATEGORY_COLOR[event.category] || "#a78bfa";

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    startTimeRef.current = Date.now();
                    // Log a "hit" (impression)
                    API.patch(`/events/${event._id}/hit`).catch(() => { });
                } else {
                    if (startTimeRef.current) {
                        const duration = Date.now() - startTimeRef.current;
                        if (duration > 1000) { // Log dwell if > 1s
                            API.patch(`/events/${event._id}/dwell`, { duration }).catch(() => { });
                        }
                        startTimeRef.current = null;
                    }
                }
            },
            { threshold: 0.6 } // 60% visibility counts as a view
        );

        if (cardRef.current) observer.observe(cardRef.current);

        return () => {
            if (startTimeRef.current) {
                const duration = Date.now() - startTimeRef.current;
                if (duration > 1000) {
                    // Simple dwell log on unmount
                    API.patch(`/events/${event._id}/dwell`, { duration }).catch(() => { });
                }
            }
            observer.disconnect();
        };
    }, [event._id]);

    return (
        <div ref={cardRef} className="event-card card" style={{ overflow: "hidden", cursor: "default" }}>
            {/* Banner */}
            {event.image ? (
                <img src={event.image} alt={event.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
            ) : (
                <div style={{
                    height: "120px",
                    background: `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderBottom: `1px solid ${catColor}33`,
                }}>
                    <Tag size={32} color={catColor} />
                </div>
            )}

            <div style={{ padding: "1.25rem" }}>
                {/* Category + creator badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span style={{
                        fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                        padding: "0.2rem 0.6rem", borderRadius: "99px",
                        background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44`,
                    }}>
                        {event.category}
                    </span>
                    {isCreator && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#fbbf24" }}>
                            <Star size={11} fill="#fbbf24" /> Creator
                        </span>
                    )}
                    {event.status === "pending_review" && (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.3)", padding: "0.1rem 0.4rem", borderRadius: "8px" }}>
                            Pending Review
                        </span>
                    )}
                </div>

                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                    {event.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.85rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {event.description}
                </p>

                {/* Meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <MapPin size={12} /> {event.location}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Clock size={12} /> {formatDate(event.date)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Users size={12} /> {acceptedCount}/{event.maxCapacity} accepted
                    </div>
                </div>

                {/* Capacity bar */}
                <div className="progress-bar" style={{ marginBottom: "1rem" }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: isFull ? "#f87171" : undefined }} />
                </div>

                {/* Application status */}
                {myApp && (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <span className={`badge badge-${myApp.status}`}>
                            {myApp.status === "accepted" ? <CheckCircle size={10} /> : myApp.status === "rejected" ? <XCircle size={10} /> : null}
                            {myApp.status}
                        </span>
                        {myApp.message && (
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>{myApp.message}</p>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {!isCreator && !myApp && !isFull && !isClosed && (
                        <button
                            className="btn-primary"
                            style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
                            onClick={onApplyToggle}
                        >
                            <Send size={12} />
                            {isSelected ? "Cancel" : "Apply"}
                        </button>
                    )}
                    {isFull && !myApp && <span style={{ fontSize: "0.75rem", color: "#f87171" }}>● Full</span>}
                    {isClosed && !myApp && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>● Closed</span>}
                    {user?.role === "admin" && (
                        <button
                            className="btn-danger"
                            onClick={onDelete}
                        >
                            <Trash2 size={11} /> Delete
                        </button>
                    )}
                </div>

                {/* Apply form */}
                {isSelected && !isCreator && !myApp && (
                    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                        {["name", "email", "phone", "usn"].map((field) => (
                            <input
                                key={field}
                                placeholder={field === "usn" ? "USN" : field.charAt(0).toUpperCase() + field.slice(1)}
                                className="input"
                                style={{ fontSize: "0.82rem", padding: "0.55rem 0.85rem" }}
                                value={applyForm[field]}
                                onChange={(e) => onApplyChange(field, e.target.value)}
                            />
                        ))}
                        <button
                            className="btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                            onClick={onApplySubmit}
                        >
                            Submit Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
