"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "./ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          toastStyle={{
            background: "rgba(13,13,26,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#f1f1f5",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
    </ThemeProvider>
  );
}
