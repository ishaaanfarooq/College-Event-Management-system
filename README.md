# College Event Management System (CEMS)

A high-performance, professional-grade platform for campus event discovery and organization. Designed with a focus on accessibility, data-driven engagement, and production-level stability.

## 🚀 Key "Selection-Ready" Features

This project was built to exceed typical portfolio standards by incorporating advanced engineering practices:

### 📊 Engagement & "Screen Time" Analytics
- **Passive Eye-Tracking**: Uses `IntersectionObserver` to track exactly how long users dwell on specific events.
- **Data-Driven Insights**: Creators can view heatmaps of user attention and engagement scores (Views vs. Applications ratio).
- **Heartbeat Logging**: Efficient periodic tracking of user "dwell time" to calculate total screen time.

### ♿ 100% App-Wide Accessibility
- **Accessibility Toolbar**: Integrated panel for real-time contrast toggling, font scaling (80%-150%), and Dyslexia-friendly font settings.
- **Semantic Excellence**: 100% ARIA-compliant landmarks and labels across all 15+ pages.
- **Keyboard Mastery**: Full keyboard navigation support including "Skip to Content" workflows.

### 📚 Interactive API Documentation (Swagger)
- **Live UI**: Explore and test the REST API directly through the integrated Swagger/OpenAPI dashboard at `/api-docs`.
- **Production Standards**: Fully documented schemas, security requirements, and response types.

### 📱 Production Polish (PWA & Push)
- **Installable PWA**: Home screen install support with custom splash screens and offline-ready service workers.
- **Real-time Push (FCM)**: Desktop and mobile-style push notifications for application approvals and status updates.
- **Automated QA (CI/CD)**: Comprehensive unit tests (Jest/Supertest) and GitHub Actions pipeline for automated verification.

---

## 🛠 Tech Stack

- **Frontend**: React 19, GSAP (Animations), Lucide Icons, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, MongoDB/Mongoose.
- **Services**: Firebase (Cloud Messaging, Analytics), Nodemailer (OTP Verification).
- **Testing**: Jest, Supertest, MongoDB Memory Server.

## 🏁 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 3. API Documentation
Visit `http://localhost:5000/api-docs` to view the interactive Swagger documentation.

---

Designed for Professional Excellence by Ish-an.
