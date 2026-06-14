# EcoTrack AI - Carbon Footprint Tracker & AI Sustainability Coach

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
    *Our tests cover the core carbon calculation algorithms, achieving **86%+ Statement Coverage**.*

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
