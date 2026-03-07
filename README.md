# QuickHire Admin — Admin Dashboard

A protected admin panel for the QuickHire job board platform, built with **Next.js 16**, **TypeScript**, and **Tailwind CSS v4**. Allows administrators to manage job postings, view applications, and manage users.

---

## ✨ Features

- **Dashboard Overview** — Summary stats (total jobs, applications, users)
- **Job Management** — Create new jobs, view all jobs, delete jobs
- **Application Management** — View all applications per job with applicant details
- **User Management** — View users, change roles (Admin → Moderator → Customer)
- **Protected Routes** — Admin-only layout guard with JWT authentication
- **Responsive Sidebar Navigation**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State / Data | Redux Toolkit, RTK Query |
| HTTP | Axios (with auto token refresh) |
| UI Components | Radix UI, shadcn/ui, Sonner (toasts) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Backend API running (see `backend/README.md`)
- An admin or super-admin account created via the backend seed or API

### Installation

```bash
# 1. Navigate to the project directory
cd "qtech admi"

# 2. Install dependencies
npm install

# 3. Copy the environment file and fill in values
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the `qtech admi/` directory:

```env
# Base URL of the backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```
