# Software Requirements Specification (SRS)
**Project Name:** Kibo  
**Version:** 1.0.0  
**Status:** Released  
**Author:** Kibo Systems  

## 1. Introduction
This document specifies the software requirements for Kibo, a web-based career acceleration platform. It details the functional and non-functional requirements, system architecture, and database design necessary for development and deployment.

## 2. System Architecture

### 2.1 High-Level Design
Kibo utilizes a modern, serverless-first architecture:
*   **Frontend:** Single Page Application (SPA) built with React 18 and Vite.
*   **Backend:** Backend-as-a-Service (BaaS) via Supabase.
*   **Database:** PostgreSQL with Row Level Security (RLS).
*   **Real-time Layer:** PostgreSQL logical replication via Supabase Realtime (WebSockets).

### 2.2 Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| UI Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| State Management | TanStack Query | 5.x |
| Database | PostgreSQL | 15.x |
| Hosting | Vercel / Netlify | - |

## 3. Functional Requirements

### 3.1 Authentication & User Management
*   **REQ-AUTH-01:** System shall allow users to sign up/login via Email/Password.
*   **REQ-AUTH-02:** System shall assign a unique UUID to each registered user.
*   **REQ-AUTH-03:** System shall create a linked `profiles` record upon user registration.

### 3.2 Dashboard & Mission Control
*   **REQ-DASH-01:** System shall display real-time aggregation of total XP, streak count, and user level.
*   **REQ-DASH-02:** System shall render a contribution graph ("The Garden") reflecting daily activity logs.
*   **REQ-DASH-03:** Dashboard widgets must update via WebSocket subscription within 200ms of data change.

### 3.3 Application Tracking
*   **REQ-APP-01:** Users shall be able to Create, Read, Update, and Delete (CRUD) job applications.
*   **REQ-APP-02:** Application status changes must be persisted and reflected in the "Funnel" visualization.
*   **REQ-APP-03:** Users shall be able to drag-and-drop applications between Kanban columns.

### 3.4 Gamification System
*   **REQ-GAME-01:** Actions (Task completion, Problem solved) shall trigger an asynchronous SQL function to increment User XP.
*   **REQ-GAME-02:** System shall calculate "Level" based on formula: `Level = floor(sqrt(XP / 100))`.
*   **REQ-GAME-03:** Global leaderboard shall aggregate top 100 users by XP, refreshable via Realtime.

## 4. Non-Functional Requirements

### 4.1 Performance
*   **NFR-PERF-01:** Initial Content Paint (ICP) shall be under 1.5 seconds on 4G networks.
*   **NFR-PERF-02:** Real-time updates shall propagate to connected clients within 500ms.

### 4.2 Security
*   **NFR-SEC-01:** All database access must be governed by Row Level Security (RLS) policies.
*   **NFR-SEC-02:** API keys (Anon key) shall be safe for public exposure; Service role keys must never be exposed.
*   **NFR-SEC-03:** Input fields shall be validated using Zod schemas to prevent XSS/Injection.

### 4.3 Reliability
*   **NFR-REL-01:** System shall support offline-capable optimistic UI updates for critical actions.

## 5. Data Model (Schema)

### 5.1 Tables
*   `profiles`: Stores user gamification stats (XP, Level, Streak).
*   `job_applications`: Stores job data (Company, Role, Status, Salary).
*   `daily_tasks`: Stores user to-dos.
*   `coding_submissions`: Stores history of solved problems.
*   `calendar_events`: Stores interviews and contests.

### 5.2 Relationships
*   `profiles.id` (PK) maps 1:1 to `auth.users.id`.
*   `job_applications.user_id` (FK) references `profiles.id`.

## 6. Interface Specifications

### 6.1 API Communication
*   All data interaction via Supabase Client SDK (`@supabase/supabase-js`).
*   Real-time subscriptions handled via `.channel()`.

### 6.2 UI/UX Standards
*   Design System: Shadcn UI components.
*   Responsiveness: Mobile-first responsive design using Tailwind breakpoints.
