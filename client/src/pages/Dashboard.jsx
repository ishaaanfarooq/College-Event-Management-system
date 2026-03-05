import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, SlidersHorizontal, MapPin, Tag, Users, Clock, Send, Trash2, CheckCircle, XCircle, Star, Bell } from "lucide-react";
import { requestForToken, onMessageListener, trackEvent } from "../firebase-config";
import { toast } from "react-toastify";
import EventCard from "../components/EventCard";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ["All", "Placement", "Department", "Volunteer", "Hackathon", "Workshop", "Other"];

const CATEGORY_COLOR = {
  Placement: "#6366f1",
  Department: "#22d3ee",
  Volunteer: "#4ade80",
  Hackathon: "#f59e0b",
  Workshop: "#ec4899",
  Other: "#a78bfa",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedEvent, setSelected] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", usn: "" });
  const headerRef = useRef(null);

  const fetchEvents = async () => {
    const res = await API.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    fetchEvents();

    // Request Notification permission and get token
    requestForToken().then(token => {
      if (token) {
        API.post("/auth/fcm-token", { token });
      }
    });

    // Listen for foreground messages
    onMessageListener().then(payload => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    // Track page view
    trackEvent("dashboard_view", { role: user?.role });

    gsap.fromTo(headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".event-card");
    if (!cards.length) return;
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: "power3.out",
          delay: i * 0.06,
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [events, catFilter, search]);

  const applyToEvent = async (eventId) => {
    try {
      await API.post(`/events/apply/${eventId}`, applyForm);
      setSelected(null);
      setApplyForm({ name: "", email: "", phone: "", usn: "" });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "Error applying");
    }
  };

  const filtered = events.filter((ev) => {
    const isPublishedOrAdmin = user?.role === "admin" || ev.status === "published";
    const matchSearch = ev.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || ev.category === catFilter;
    return isPublishedOrAdmin && matchSearch && matchCat;
  });

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <DashboardLayout>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: "2rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Good day,
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
            <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.4rem", fontSize: "0.875rem" }}>
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <Search size={15} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              placeholder="Search events…"
              aria-label="Search events"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: "relative" }}>
            <SlidersHorizontal size={15} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <select
              className="input"
              aria-label="Filter events by category"
              style={{ paddingLeft: "2.5rem", minWidth: "160px" }}
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value);
                trackEvent("filter_applied", { category: e.target.value });
              }}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding: "0.3rem 0.85rem",
                borderRadius: "99px",
                fontSize: "0.76rem",
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${catFilter === c ? "var(--accent-violet)" : "var(--border-glass)"}`,
                background: catFilter === c ? "rgba(124,58,237,0.2)" : "transparent",
                color: catFilter === c ? "#a78bfa" : "var(--text-muted)",
                transition: "all 0.2s ease",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Event Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <Search size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p>No events found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "1.5rem" }}>
            {filtered.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                user={user}
                onApplyToggle={() => setSelected(selectedEvent === event._id ? null : event._id)}
                isSelected={selectedEvent === event._id}
                applyForm={applyForm}
                onApplyChange={(field, val) => setApplyForm({ ...applyForm, [field]: val })}
                onApplySubmit={() => applyToEvent(event._id)}
                onDelete={() => API.delete(`/events/${event._id}`).then(fetchEvents)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}