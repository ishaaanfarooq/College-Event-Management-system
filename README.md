# College Event Management System (CEMS) 🎓

A high-performance, professional-grade platform for campus event discovery and organization. Designed with a focus on accessibility, data-driven engagement, and production-level stability.

## 🌟 Modernization & "Selection-Ready" Features

This project has been heavily modernized to exceed typical portfolio standards, incorporating enterprise-grade engineering practices:

### 🏛️ Next.js 15 Architecture
- **App Router Migration**: Transitioned from standard React to **Next.js 15 (App Router)** for optimized performance, Server Components, and superior SEO.
- **TypeScript Core**: 100% Type-safe codebase ensuring reliability and maintainability.
- **Enterprise Middleware**: Hardened backend with **Helmet**, **Morgan**, and JWT-based secure authentication.

### 🤖 Offline AI Assistant (Option C)
- **Local Llama 3.2 Integration**: Integrated an intelligent **Offline AI Chatbot** powered by **Ollama** and **Llama 3.2**.
- **Privacy-First**: No data leaves the server; inference is handled locally on the host machine.
- **Context-Aware**: Custom-tuned to act as a professional CEMS Assistant, helping students discover events.

### 🎨 "Wheatish Classy" Design System
- **Sophisticated Aesthetic**: A custom theme characterized by **Gold (#D4AF37)**, **Bronze**, and **Ivory** tones, replacing generic palettes with a "Luxurious Academic" feel.
- **Dynamic Theming**: Seamless Light/Dark mode transitions with translucent glassmorphism and smooth **GSAP** animations.

### ♿ 100% App-Wide Accessibility
- **Accessibility Toolbar**: Real-time panel for high-contrast toggling, font scaling (80%-150%), and **OpenDyslexic** support.
- **Inclusive Design**: Fully ARIA-compliant landmarks and keyboard-navigable workflows.

### 📊 Engagement & Analytics
- **Passive Tracking**: Uses `IntersectionObserver` to measure real-time event "dwell time" and engagement ratios.
- **Analytics Dashboard**: Comprehensive view for admins to track total applications and average user engagement.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, GSAP, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Firebase Admin.
- **AI/ML**: Ollama, Llama 3.2 (Offline Inference).
- **Communication**: Firebase Cloud Messaging (Push), Nodemailer (OTP).

## 🏁 Getting Started

### 1. Requirements
- Node.js 18+
- MongoDB
- **Ollama** (for AI features)

### 2. Setup
```bash
# Clone the repo
git clone https://github.com/ishaaanfarooq/College-Event-Management-system.git

# Install Server dependencies
cd server && npm install
# Start server
npm run dev

# Install Client dependencies
cd ../client && npm install
# Start client
npm run dev
```

---
Designed for Professional Excellence by Ish-an.
