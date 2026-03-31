import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { Eye, Type, ZoomIn, ZoomOut, RotateCcw, X, Settings2, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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
        document.documentElement.style.setProperty("--font-scale", fontScale.toString());

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
        <div className="fixed bottom-28 right-8 z-[9999]">
            <Popover>
                <PopoverTrigger className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-indigo)] text-white shadow-lg shadow-[var(--accent-violet)]/30 hover:shadow-[var(--accent-violet)]/50 hover:scale-110 transition-all duration-300 border-0 flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-violet)]">
                        <Accessibility size={28} />
                </PopoverTrigger>
                <PopoverContent 
                    align="end" 
                    side="top" 
                    className="w-72 p-0 glass dark:glass-dark border-[var(--border-glass)] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
                >
                    <div className="p-4 border-b border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-[var(--text-primary)]">Accessibility</h3>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-[var(--accent-violet)]">Beta</Badge>
                        </div>
                    </div>

                    <div className="p-4 space-y-5">
                        {/* Contrast */}
                        <div className="flex items-center justify-between group">
                            <div className="space-y-0.5">
                                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                                    <Eye size={14} className="text-[var(--accent-violet)]" /> High Contrast
                                </label>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">Improve text readability</p>
                            </div>
                            <Switch 
                                checked={highContrast} 
                                onCheckedChange={setHighContrast}
                                className="data-[state=checked]:bg-[var(--accent-violet)]" 
                            />
                        </div>

                        {/* Font Scaling */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                                    <Type size={14} className="text-[var(--accent-violet)]" /> Font Scaling
                                </label>
                                <span className="text-[11px] font-extrabold text-[var(--accent-violet)]">{Math.round(fontScale * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--bg-base)]/50 border border-[var(--border-glass)]">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 rounded-lg hover:bg-[var(--accent-violet)]/10"
                                    onClick={() => setFontScale(Math.max(0.8, fontScale - 0.1))}
                                >
                                    <ZoomOut size={16} />
                                </Button>
                                <div className="flex-1 h-1 rounded-full bg-[var(--border-glass)] overflow-hidden">
                                    <div 
                                        className="h-full bg-[var(--accent-violet)] transition-all" 
                                        style={{ width: `${((fontScale - 0.8) / 0.7) * 100}%` }}
                                    />
                                </div>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 rounded-lg hover:bg-[var(--accent-violet)]/10"
                                    onClick={() => setFontScale(Math.min(1.5, fontScale + 0.1))}
                                >
                                    <ZoomIn size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Dyslexia Font */}
                        <div className="flex items-center justify-between group">
                            <div className="space-y-0.5">
                                <label className="text-sm font-bold text-[var(--text-secondary)] flex items-center gap-2">
                                    <Type size={14} className="text-[var(--accent-violet)]" /> Dyslexic Friendly
                                </label>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium">OpenDyslexic font-face</p>
                            </div>
                            <Switch 
                                checked={isDyslexic} 
                                onCheckedChange={setIsDyslexic}
                                className="data-[state=checked]:bg-[var(--accent-violet)]" 
                            />
                        </div>

                        <div className="pt-2">
                             <Button 
                                className="w-full text-[11px] font-bold uppercase tracking-widest h-9 border-[var(--border-glass)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all rounded-xl" 
                                variant="outline"
                                onClick={resetA11y}
                             >
                                <RotateCcw size={14} className="mr-2" /> Reset Everything
                             </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
