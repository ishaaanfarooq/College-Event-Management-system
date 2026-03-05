import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { gsap } from "gsap";
import { Type, MapPin, Tag, Image, Users, CalendarCheck, AlignLeft, PlusCircle } from "lucide-react";
import { trackEvent } from "../firebase-config";

const CATEGORIES = ["Placement", "Department", "Volunteer", "Hackathon", "Workshop", "Other"];

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const formRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "", description: "", date: "",
    location: "", category: "", image: "",
    maxCapacity: 50, registrationDeadline: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo(formRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    );
    gsap.fromTo(".ce-field",
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/events", form);
      trackEvent("event_created", { category: form.category, is_admin: user?.role === "admin" });
      if (user?.role === "admin") {
        navigate("/manage-events");
      } else {
        toast.success("Event submitted successfully for admin review!");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating event");
    } finally {
      setLoading(false);
    }
  };

  const fieldIcon = (Icon) => (
    <Icon size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
  );

  return (
    <DashboardLayout>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "860px", margin: "0 auto" }}>
        <main style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Create Event</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.3rem" }}>Fill in the details to publish a new event</p>
        </main>

        <div ref={formRef} style={{
          background: "rgba(13, 13, 26, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border-glass)",
          borderRadius: "24px",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

            {/* Title */}
            <div className="ce-field" style={{ position: "relative" }}>
              {fieldIcon(Type)}
              <input required placeholder="Event Title" aria-label="Event Title" className="input" style={{ paddingLeft: "2.5rem" }}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            {/* Date */}
            <div className="ce-field" style={{ position: "relative" }}>
              <CalendarCheck size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input required type="date" aria-label="Event Date" min={today} className="input" style={{ paddingLeft: "2.5rem" }}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>

            {/* Location */}
            <div className="ce-field" style={{ position: "relative" }}>
              {fieldIcon(MapPin)}
              <input required placeholder="Location" aria-label="Location" className="input" style={{ paddingLeft: "2.5rem" }}
                onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>

            {/* Category */}
            <div className="ce-field" style={{ position: "relative" }}>
              {fieldIcon(Tag)}
              <select required aria-label="Event Category" className="input" style={{ paddingLeft: "2.5rem" }}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Capacity */}
            <div className="ce-field" style={{ position: "relative" }}>
              {fieldIcon(Users)}
              <input required type="number" min="1" placeholder="Max Capacity" aria-label="Maximum Capacity" className="input" style={{ paddingLeft: "2.5rem" }}
                defaultValue={50}
                onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} />
            </div>

            {/* Deadline */}
            <div className="ce-field" style={{ position: "relative" }}>
              <CalendarCheck size={14} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input required type="date" aria-label="Registration Deadline" min={today} className="input" style={{ paddingLeft: "2.5rem" }}
                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} />
            </div>

            {/* Image URL */}
            <div className="ce-field" style={{ position: "relative", gridColumn: "1 / -1" }}>
              {fieldIcon(Image)}
              <input placeholder="Image URL (optional)" aria-label="Image URL" className="input" style={{ paddingLeft: "2.5rem" }}
                onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>

            {/* Description */}
            <div className="ce-field" style={{ position: "relative", gridColumn: "1 / -1" }}>
              <AlignLeft size={14} style={{ position: "absolute", left: "0.85rem", top: "0.85rem", color: "var(--text-muted)", pointerEvents: "none" }} />
              <textarea required placeholder="Description" aria-label="Event Description" className="input" rows={4}
                style={{ paddingLeft: "2.5rem", resize: "vertical" }}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <button
              type="submit"
              className="ce-field btn-primary"
              disabled={loading}
              style={{ gridColumn: "1 / -1", padding: "0.85rem", justifyContent: "center", fontSize: "0.95rem" }}
            >
              <PlusCircle size={16} />
              {loading ? "Creating…" : "Publish Event"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}