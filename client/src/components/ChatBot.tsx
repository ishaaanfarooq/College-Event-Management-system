"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import API from "@/api/axios";
import { gsap } from "gsap";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your CEMS Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(chatRef.current, 
        { scale: 0.8, opacity: 0, y: 20 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await API.post("/ai/chat", { 
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) 
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting to my brain right now. Please ensure Ollama is running!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatRef}
          className="w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] glass dark:glass-dark border border-[var(--border-glass)] shadow-2xl rounded-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[var(--accent-violet)]/10 to-[var(--accent-indigo)]/10 border-b border-[var(--border-glass)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-violet)]/20 flex items-center justify-center text-[var(--accent-violet)] shadow-inner">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)]">CEMS Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Locally Powered</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
               <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[var(--text-muted)]"
              >
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[var(--border-glass)]"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div 
                  className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-[var(--accent-violet)] text-white rounded-tr-none" 
                      : "bg-[var(--bg-surface)]/60 border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none font-medium"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-surface)]/60 border border-[var(--border-glass)] p-3.5 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--accent-violet)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[var(--accent-violet)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[var(--accent-violet)] rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--border-glass)] bg-[var(--bg-base)]/30">
            <div className="relative flex items-center gap-2">
              <Input
                placeholder="Ask me anything about events..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="pr-12 rounded-2xl border-[var(--border-glass)] focus:ring-[var(--accent-violet)]/30 transition-all font-medium h-11"
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="absolute right-1.5 h-8 w-8 rounded-xl bg-[var(--accent-violet)] hover:bg-[var(--accent-violet)]/90 shadow-lg shadow-[var(--accent-violet)]/20 text-white"
              >
                <Send size={14} />
              </Button>
            </div>
            <p className="text-[9px] text-[var(--text-muted)] text-center mt-3 font-bold uppercase tracking-widest opacity-50">
              Llama 3.2 • Secure Offline Inference
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-3xl bg-[var(--accent-violet)] text-white shadow-2xl shadow-[var(--accent-violet)]/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center relative group"
        >
          <div className="absolute inset-0 rounded-3xl bg-[var(--accent-violet)] animate-ping opacity-20 group-hover:hidden" />
          <div className="relative">
            <MessageSquare size={30} className="group-hover:hidden" />
            <Sparkles size={30} className="hidden group-hover:block animate-pulse" />
          </div>
          {/* Unread dot */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-[var(--bg-base)] rounded-full" />
        </button>
      )}
    </div>
  );
}
