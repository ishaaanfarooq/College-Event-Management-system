import { useState, useEffect } from "react";
import { Eye, Type, ZoomIn, ZoomOut, RotateCcw, X, Settings2 } from "lucide-react";
import { gsap } from "gsap";

export default function AccessibilityToolbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [fontScale, setFontScale] = useState(1);
    const [isDyslexic, setIsDyslexic] = useState(false);

    useEffect(() => {
        // Apply High Contrast
        if (highContrast) {
            document.documentElement.setAttribute("data-theme", "high-contrast");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }

        // Apply Font Scale
        document.documentElement.style.setProperty("--font-scale", fontScale);

        // Apply Dyslexic Font
        if (isDyslexic) {
            document.documentElement.setAttribute("data-font", "dyslexic");
        } else {
            document.documentElement.removeAttribute("data-font");
        }
    }, [highContrast, fontScale, isDyslexic]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            gsap.fromTo(".a11y-menu",
                { scale: 0.9, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    };

    const resetA11y = () => {
        setHighContrast(false);
        setFontScale(1);
        setIsDyslexic(false);
    };

    return (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>
            {isOpen && (
                <div className="a11y-menu card" style={{
                    position: "absolute",
                    bottom: "70px",
                    right: "0",
                    width: "280px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.2rem",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-accent)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Accessibility</h3>
                        <button aria-label="Close menu" onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                        {/* Contrast */}
                        <button
                            className="btn-ghost"
                            style={{ justifyContent: "space-between", width: "100%", background: highContrast ? "var(--accent-violet)" : "" }}
                            onClick={() => setHighContrast(!highContrast)}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Eye size={16} /> High Contrast</span>
                            <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{highContrast ? "ON" : "OFF"}</span>
                        </button>

                        {/* Font Scaling */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--glass-bg)", padding: "0.6rem 1rem", borderRadius: "10px" }}>
                            <span style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><Type size={16} /> Font Size</span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button aria-label="Decrease font" onClick={() => setFontScale(Math.max(0.8, fontScale - 0.1))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}><ZoomOut size={16} /></button>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, minWidth: "2.5rem", textAlign: "center" }}>{Math.round(fontScale * 100)}%</span>
                                <button aria-label="Increase font" onClick={() => setFontScale(Math.min(1.5, fontScale + 0.1))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}><ZoomIn size={16} /></button>
                            </div>
                        </div>

                        {/* Dyslexia Font */}
                        <button
                            className="btn-ghost"
                            style={{ justifyContent: "space-between", width: "100%", background: isDyslexic ? "var(--accent-violet)" : "" }}
                            onClick={() => setIsDyslexic(!isDyslexic)}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Type size={16} /> Dyslexic Font</span>
                            <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{isDyslexic ? "ON" : "OFF"}</span>
                        </button>

                        <div className="divider" style={{ margin: "0.5rem 0" }} />

                        <button className="btn-ghost" onClick={resetA11y} style={{ fontSize: "0.75rem", gap: "0.4rem" }}>
                            <RotateCcw size={14} /> Reset Settings
                        </button>
                    </div>
                </div>
            )}

            <button
                aria-label="Accessibility Settings"
                onClick={toggleOpen}
                style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent-violet), var(--accent-indigo))",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
                <Settings2 size={24} />
            </button>
        </div>
    );
}
