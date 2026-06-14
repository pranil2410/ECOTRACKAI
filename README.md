# EcoTrack AI - Carbon Footprint Tracker & AI Sustainability Coach

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Google-purple?style=for-the-badge&logo=google-gemini)](https://aistudio.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License-MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Test-Coverage](https://img.shields.io/badge/Test_Coverage-86.98%25-brightgreen?style=for-the-badge)](https://jestjs.io/)

### 🔗 Live Demo Link: [https://ecotrack-ai-ten.vercel.app](https://ecotrack-ai-ten.vercel.app)

**EcoTrack AI** is a production-grade, premium carbon footprint awareness platform built with the Next.js 15 App Router, TypeScript, and Tailwind CSS. Inspired by the sleek, dark-themed design aesthetics of Stripe, Vercel, and Linear, EcoTrack AI helps users calculate, monitor, and reduce their carbon footprint through gamification, interactive AI coaching, analytics, and community engagement.

---

## 🚀 Key Features

*   **Secure Authentication (Supabase Auth)**: Supported by Supabase Auth (Email/Password, OAuth mocks), protected router gates, and role-based permissions (User/Admin).
*   **Full-Scope Carbon Calculator**: Track emissions across four key categories:
    *   *Transportation*: Cars (Petrol, Diesel, EV fuel filters), Bikes, Buses, Trains, and Aviation Flights.
    *   *Energy*: Utility Electricity draw (kWh) and LPG Cooking Cylinders (kg).
    *   *Food & Diet*: Vegetarian, Mixed, or meat-heavy Non-Vegetarian log cycles.
    *   *Packaging Waste*: Single-use Plastics, Paper/Cardboard, and Organic composting waste.
*   **AI Sustainability Coach (Google Gemini)**: Analyzes user carbon footprint logs, suggests actionable reduction tips, and offers conversational sustainability Q&A.
*   **Gamification & Challenges**:
    *   *Green Points*: Accumulate points for logging activities, completing goals, and completing challenges.
    *   *Active Challenges*: Join weekly challenges like *No Car Day* or *Zero Plastic Week*.
    *   *Achievement Badges*: Move from *Eco Beginner* (0 pts) to *Green Warrior* (100 pts), *Climate Champion* (500 pts), and *Sustainability Master* (1500+ pts).
    *   *Community Leaderboard*: Dynamic ranking of platform users.
*   **One-Click PDF Report Export (jsPDF)**: Instant download of carbon reports containing categorical tables, goals progress, and AI recommendations.
*   **Administrative Control Panel**: Secure, role-restricted board to manage active challenges, review platform statistics, and promote/demote user roles.

---

## ⚡ Standalone Local Fallback Mode (Zero Configuration Setup)

To ensure the platform is **immediately runnable and testable out-of-the-box**, EcoTrack AI features a **dual-engine database client**:
1.  If environment variables are missing or unconfigured, the app automatically boots into **Local Standalone Mode**.
2.  All profiles, logged carbon inputs, active challenges, achievements, and chat history are saved and retrieved from the browser's `LocalStorage`.
3.  The AI Coach falls back to an intelligent, context-aware rule engine mapping calculations to EPA equivalencies, ensuring **every single feature works end-to-end without credentials**.

---

## 🛠️ Local Setup Instructions

### 1. Prerequisites
Ensure you have [Node.js (v18.0.0+)](https://nodejs.org/) installed.

### 2. Install Dependencies
Initialize and install packages:
```bash
npm install
```

### 3. Copy Local Environment Variables Template
Create your local environment file:
```bash
cp .env.local.template .env.local
```
*You can run the application immediately after this step! If you leave `.env.local` as is, the app will run in the local LocalStorage standalone mode.*

### 4. Running the Dev Server
Launch the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Cloud Services Configuration

### 1. Supabase PostgreSQL & Auth Setup
To connect a live database:
1.  Create a free project on [Supabase](https://supabase.com/).
2.  Go to the SQL Editor in Supabase and run the initialization script located in `supabase/migrations/20260614000000_init_schema.sql`. This sets up the tables, triggers, indices, and RLS policies.
3.  Retrieve your API credentials and add them to your `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```

### 2. Google Gemini AI API Setup
To unlock live Gemini AI capabilities:
1.  Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2.  Insert it in your `.env.local` file:
    ```env
    GEMINI_API_KEY=AIzaSyA1...
    ```

---

## 🧪 Testing and Code Coverage

The platform features Jest unit and integration tests. The test runner uses Next.js's SWC compiler to run tests quickly.

*   **Run all tests**:
    ```bash
    npm run test
    ```
*   **Run tests with code coverage**:
    ```bash
    npm run test:coverage
    ```
    *Our tests cover the core carbon calculation algorithms, achieving **86.98% Statement Coverage**.*

---

## 📂 Project Structure

```text
ecotrack-ai/
├── src/
│   ├── app/                 # Next.js App Router pages (landing, dashboard, auth, calculator, analytics, coach, admin)
│   ├── components/          # Shared layout frames & navigation components
│   ├── hooks/               # useAuth session manager context & custom hooks
│   ├── lib/                 # DB abstraction controller, Supabase clients & utils
│   ├── services/            # Client-side AI prompts and PDF export compilation
│   ├── types/               # TypeScript data structures & schema typings
│   ├── utils/               # EPA carbon equations & formatting utilities
│   └── tests/               # Jest unit testing suite
├── supabase/
│   └── migrations/          # SQL database migration scripts (RLS, indices, triggers)
├── jest.config.ts           # Jest Next.js compiler settings
└── package.json             # Manifest configurations & dependencies
```

---

## ♿ Accessibility (WCAG 2.1 Compliance)
*   **Semantic Elements**: Structured headers (`<h1>` to `<h6>`), `<main>`, `<aside>`, and `<header>` wrappers.
*   **Keyboard Navigation**: Tab indexes on all form inputs and action buttons.
*   **Aria Roles**: Color schemes configured with Radix UI accessibility compliance.
*   **Screen Reader Support**: Structured form labels mapping input IDs directly.

---

## 👨‍💻 Author

**Pranil Belge**

*   Final Year Computer Engineering Student
*   Developer of EcoTrack AI
*   Passionate about Software Development, AI, Cloud Technologies, and Sustainability Solutions

---

## 🌟 Project Highlights

*   Built using Next.js 15 and TypeScript
*   AI-powered sustainability recommendations using Gemini
*   Secure authentication and database integration with Supabase
*   86.98% automated test coverage
*   Accessibility-focused design
*   Production-ready deployment on Vercel

---

## 📄 License

MIT License

Copyright (c) 2026 Pranil Belge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
