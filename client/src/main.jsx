import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Lenis from "@studio-freight/lenis";
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
registerSW({ immediate: true });

// ── Lenis Smooth Scroll ──
const lenis = new Lenis({
  duration: 0.8,
  lerp: 0.1,
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AuthProvider>
      <SocketProvider>
        <App />
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
);