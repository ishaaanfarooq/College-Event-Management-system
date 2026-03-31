import { useEffect, useRef } from "react";
import API from "../api/axios";
import { MapPin, Clock, Users, Star, CheckCircle, XCircle, Tag, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event, User } from "@/types";

interface EventCardProps {
    event: Event;
    user: User | null;
    onApplyToggle: () => void;
    isSelected: boolean;
    applyForm: any;
    onApplyChange: (field: string, val: string) => void;
    onApplySubmit: () => void;
    onDelete: () => void;
    formatDate: (d: string | number | Date) => string;
}

const CATEGORY_COLOR = {
    Placement: "#6366f1",
    Department: "#22d3ee",
    Volunteer: "#4ade80",
    Hackathon: "#f59e0b",
    Workshop: "#ec4899",
    Other: "#a78bfa",
};

export default function EventCard({ 
    event, 
    user, 
    onApplyToggle, 
    isSelected, 
    applyForm, 
    onApplyChange, 
    onApplySubmit, 
    onDelete, 
    formatDate 
}: EventCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<number | null>(null);

    const acceptedCount = (event.applications || []).filter((a: any) => a.status === "accepted").length;
    const isFull = acceptedCount >= event.maxCapacity;
    const isClosed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
    const isCreator = event.createdBy?._id === user?._id;
    const myApp = (event.applications || []).find((a: any) => a.user?._id === user?._id);
    const pct = Math.round((acceptedCount / event.maxCapacity) * 100);
    const catColor = CATEGORY_COLOR[event.category as keyof typeof CATEGORY_COLOR] || "#a78bfa";

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
        <div 
            ref={cardRef} 
            className="event-card glass dark:glass-dark rounded-[var(--radius-lg)] border-[var(--border-glass)] overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[var(--shadow-glow)] group"
        >
            {/* Banner */}
            {event.image ? (
                <div className="relative h-[180px] w-full overflow-hidden">
                    <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            ) : (
                <div 
                    className="h-[120px] flex items-center justify-center border-b"
                    style={{
                        background: `linear-gradient(135deg, ${catColor}15, ${catColor}30)`,
                        borderColor: `${catColor}25`
                    }}
                >
                    <Tag size={32} style={{ color: catColor }} />
                </div>
            )}

            <div className="p-5">
                {/* Category + creator badge */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                        <Badge 
                            variant="secondary" 
                            className="font-bold tracking-wider uppercase text-[10px] rounded-full px-2.5 py-0.5"
                            style={{ 
                                backgroundColor: `${catColor}15`, 
                                color: catColor,
                                border: `1px solid ${catColor}30`
                            }}
                        >
                            {event.category}
                        </Badge>
                        {isCreator && (
                            <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-500 flex gap-1 items-center px-2 py-0.5 rounded-full">
                                <Star size={10} className="fill-amber-500" /> Creator
                            </Badge>
                        )}
                        {event.status === "pending_review" && (
                            <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-500 rounded-full">
                                Pending Review
                            </Badge>
                        )}
                        {(event.totalViewTime || 0) > 600000 && (
                            <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-500 rounded-full">
                                🔥 High Engagement
                            </Badge>
                        )}
                    </div>
                </div>

                <h3 className="font-extrabold text-lg text-[var(--text-primary)] mb-2 leading-tight group-hover:text-[var(--accent-violet)] transition-colors">
                    {event.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed opacity-80">
                    {event.description}
                </p>

                {/* Meta */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <MapPin size={13} className="text-[var(--accent-violet)]" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Clock size={13} className="text-[var(--accent-violet)]" /> {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Users size={13} className="text-[var(--accent-violet)]" /> {acceptedCount}/{event.maxCapacity} joined
                    </div>
                </div>

                {/* Capacity progress */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <span>Capacity</span>
                        <span className={pct >= 90 ? "text-red-400" : ""}>{pct}% Full</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                </div>

                {/* Application status */}
                {myApp && (
                    <div className="mb-4">
                        <Badge 
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit
                                ${myApp.status === "accepted" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                  myApp.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                                  "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
                        >
                            {myApp.status === "accepted" ? <CheckCircle size={10} /> : myApp.status === "rejected" ? <XCircle size={10} /> : null}
                            {myApp.status}
                        </Badge>
                        {myApp.message && (
                            <p className="text-[11px] text-[var(--text-muted)] mt-2 italic px-2 border-l-2 border-[var(--accent-violet)]/30">
                                "{myApp.message}"
                            </p>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-[var(--border-glass)]">
                    {!isCreator && !myApp && !isFull && !isClosed && (
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-indigo)] text-white font-bold h-9 px-4 rounded-lg shadow-lg shadow-[var(--accent-violet)]/20 hover:shadow-[var(--accent-violet)]/40 transition-all"
                            onClick={onApplyToggle}
                        >
                            <Send size={14} className="mr-1.5" />
                            {isSelected ? "Cancel" : "Apply Now"}
                        </Button>
                    )}
                    {isFull && !myApp && <Badge variant="outline" className="text-red-400 border-red-400/20 bg-red-400/5">● Fully Booked</Badge>}
                    {isClosed && !myApp && <Badge variant="outline" className="text-[var(--text-muted)] border-[var(--border-glass)]">● Closed</Badge>}
                    
                    {user?.role === "admin" && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-9 px-4 font-bold rounded-lg opacity-80 hover:opacity-100"
                            onClick={onDelete}
                        >
                            <Trash2 size={14} className="mr-1.5" /> Delete
                        </Button>
                    )}
                </div>

                {/* Apply form */}
                {isSelected && !isCreator && !myApp && (
                    <div className="mt-4 space-y-3 p-4 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-glass)] animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Registration Details</p>
                        {["name", "email", "phone", "usn"].map((field) => (
                            <Input
                                key={field}
                                placeholder={field === "usn" ? "College USN" : field.charAt(0).toUpperCase() + field.slice(1)}
                                className="h-9 bg-transparent border-[var(--border-glass)] text-xs focus:ring-[var(--accent-violet)]"
                                value={applyForm[field]}
                                onChange={(e) => onApplyChange(field, e.target.value)}
                            />
                        ))}
                        <Button
                            className="w-full bg-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/90 text-white font-bold h-10 mt-1"
                            onClick={onApplySubmit}
                        >
                            Confirm Application
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
