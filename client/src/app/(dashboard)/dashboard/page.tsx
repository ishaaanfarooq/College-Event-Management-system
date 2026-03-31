"use client";

import { useEffect, useState, useRef } from "react";
import API from "@/api/axios";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Event, User } from "@/types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, SlidersHorizontal, MapPin, Tag, Users, Clock, Send, Trash2, CheckCircle, XCircle, Star, Bell, Sparkles, Layers } from "lucide-react";
import { requestForToken, onMessageListener, trackEvent } from "@/firebase-config";
import { toast } from "react-toastify";
import EventCard from "@/components/EventCard";
import { useSocket } from "@/context/SocketContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ["All", "Placement", "Department", "Volunteer", "Hackathon", "Workshop", "Other"];

const CATEGORY_COLOR = {
  Placement: "#d4af37", // Gold
  Department: "#b8860b", // Bronze
  Volunteer: "#8d6e63", // Muted Earth
  Hackathon: "#e2b07e", // Wheat/Champagne
  Workshop: "#c5a021", // Dark Gold
  Other: "#78716c", // Stone
};

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedEvent, setSelected] = useState<string | null>(null);
  const [interests, setInterests] = useState<Record<string, number>>({});
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", usn: "" });
  const headerRef = useRef(null);
  const interestRef = useRef(null);

  const fetchEvents = async () => {
    const res = await API.get("/events");
    setEvents(res.data);
  };

  const fetchInterestData = async () => {
    try {
      const [intRes, recRes] = await Promise.all([
        API.get("/events/user/interests"),
        API.get("/events/recommended")
      ]);
      setInterests(intRes.data);
      setRecommendations(recRes.data);
    } catch (err) {
      console.error("Interest fetch failed", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (user?.role === "student") {
      fetchInterestData();
    }
    // ... matching existing code ...


    // Request Notification permission and get token
    requestForToken().then(token => {
      if (token) {
        API.post("/auth/fcm-token", { token });
      }
    });

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      toast.info(`${payload.notification.title}: ${payload.notification.body}`);
    });

    // Track page view
    trackEvent("dashboard_view", { role: user?.role });

    gsap.fromTo(headerRef.current,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("event_status_update", (data) => {
      fetchEvents();
    });

    socket.on("application_status_update", (data: { userId: string }) => {
      if (user && user._id === data.userId) {
        fetchEvents();
      }
    });

    return () => {
      socket.off("event_status_update");
      socket.off("application_status_update");
    };
  }, [socket, user]);

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

  const applyToEvent = async (eventId: string) => {
    try {
      await API.post(`/events/apply/${eventId}`, applyForm);
      setSelected(null);
      setApplyForm({ name: "", email: "", phone: "", usn: "" });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error applying");
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = events.filter((ev) => {
    const isPublishedOrAdmin = user?.role === "admin" || ev.status === "published";
    const matchSearch = ev.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchCat = catFilter === "All" || ev.category === catFilter;
    return isPublishedOrAdmin && matchSearch && matchCat;
  });

  const formatDate = (d: string | number | Date) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="py-8 px-6 md:px-10 max-w-[1400px] mx-auto space-y-8">

        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-[var(--accent-violet)]/5 border-[var(--accent-violet)]/20 text-[var(--accent-violet)]">
                 System Active
               </Badge>
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-[var(--text-secondary)] mt-1.5 text-sm md:text-base font-medium opacity-80">
              There are <span className="text-[var(--accent-violet)] font-bold">{filtered.length}</span> exciting events waiting for you.
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-base)] bg-[var(--bg-surface)] flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" />
                  </div>
                ))}
             </div>
             <p className="text-[11px] text-[var(--text-muted)] font-medium">Join 500+ students today</p>
          </div>
        </div>

        {/* Phase 13: Personal Interest Profile & Recommendations */}
        {user?.role === "student" && Object.keys(interests).length > 0 && (
          <div ref={interestRef} className="glass dark:glass-dark rounded-[var(--radius-xl)] p-6 md:p-8 border-[var(--border-glass)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
               <Sparkles size={120} className="text-[var(--accent-violet)]" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 relative z-10">
              <div className="space-y-6">
                <div>
                   <h3 className="text-lg font-bold flex items-center gap-2.5 mb-1.5 text-[var(--text-primary)]">
                    <Clock size={20} className="text-[var(--accent-violet)]" /> Personalized Insights
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">Based on your activity this week</p>
                </div>
                
                <div className="space-y-5">
                  {Object.entries(interests).slice(0, 4).sort((a, b) => b[1] - a[1]).map(([cat, time]) => (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">{cat}</span>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{(time / 60000).toFixed(1)}m Engage</span>
                      </div>
                      <Progress 
                        value={Math.min((time / 300000) * 100, 100)} 
                        className="h-2 bg-[var(--bg-base)]/50" 
                        style={{ '--progress-foreground': CATEGORY_COLOR[cat as keyof typeof CATEGORY_COLOR] || "var(--accent-violet)" } as any}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {recommendations.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2.5 mb-1.5 text-[var(--text-primary)]">
                      <Star size={20} className="text-amber-500 fill-amber-500/20" /> Picked For You
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">Curated based on your interests</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendations.slice(0, 2).map(re => (
                      <div
                        key={re._id}
                        className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--bg-base)]/40 border border-[var(--border-glass)] hover:border-[var(--accent-violet)]/30 transition-all cursor-pointer group/rec shadow-sm"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner"
                          style={{ background: `${CATEGORY_COLOR[re.category as keyof typeof CATEGORY_COLOR]}15`, color: CATEGORY_COLOR[re.category as keyof typeof CATEGORY_COLOR] }}
                        >
                          📅
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)] leading-tight group-hover/rec:text-[var(--accent-violet)] transition-colors line-clamp-1">{re.title}</p>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase">{re.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search + Filter Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-[var(--bg-surface)]/30 p-4 rounded-2xl border border-[var(--border-glass)]">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              placeholder="Search by event title, host, or topics..."
              className="pl-11 h-12 bg-transparent border-none focus-visible:ring-[var(--accent-violet)] text-base rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="h-10 w-[1px] bg-[var(--border-glass)] hidden md:block mx-2" />
            
            <Select value={catFilter} onValueChange={(val: string | null) => {
              if (val) {
                setCatFilter(val);
                trackEvent("filter_applied", { category: val });
              }
            }}>
              <SelectTrigger className="w-full md:w-[200px] h-12 bg-transparent border-[var(--border-glass)] rounded-xl px-4 font-medium text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="glass dark:glass-dark border-[var(--border-glass)]">
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="font-medium cursor-pointer">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`
                whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 border
                ${catFilter === c 
                  ? "bg-[var(--accent-violet)] text-white border-[var(--accent-violet)] shadow-md shadow-violet-500/20 scale-105" 
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border-glass)] hover:border-[var(--accent-violet)]/40 hover:text-[var(--text-secondary)]"}
              `}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Event Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers size={18} className="text-[var(--accent-violet)]" />
                Featured Events
             </h2>
          </div>
          
          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-[var(--bg-surface)]/10 rounded-3xl border-2 border-dashed border-[var(--border-glass)]">
              <div className="w-20 h-20 bg-[var(--bg-base)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Search size={32} className="text-[var(--text-muted)] opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No events matches found</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Try adjusting your filters or search keywords</p>
              <Button 
                variant="ghost" 
                className="mt-6 text-[var(--accent-violet)] font-bold hover:bg-[var(--accent-violet)]/10"
                onClick={() => {setSearch(""); setCatFilter("All")}}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      </div>
    </DashboardLayout>
  );
}