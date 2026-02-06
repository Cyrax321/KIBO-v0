<div align="center">
  <img src="public/kibo-logo.svg" alt="Kibo Logo" width="120" height="auto" />
  <h1>Kibo</h1>
  <p>
    <strong>The Intelligent Career Orchestration Platform</strong>
  </p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/build-passing-success?style=flat-square&color=00c805" alt="Build Status" />
    <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/badge/license-MIT-gray?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/typescript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  </p>
</div>

---

**Kibo** is a production-grade, full-stack career acceleration engine designed to optimize the technical recruitment lifecycle for software engineers. It integrates gamification mechanics with real-time analytics to drive consistent productivity, skill acquisition, and pipeline management.

Built with performance, scalability, and type safety as core tenets, Kibo leverages a modern event-driven architecture to deliver instantaneous state synchronization across distributed clients.

## ⚡️ Key Components

### Core Engine
*   **Real-time Event Bus:** Powered by PostgreSQL logical replication (Supabase Realtime) to synchronize state across clients with sub-100ms latency.
*   **Optimistic Mutation Layer:** Custom hooks and TanStack Query configuration ensure immediate UI feedback before server confirmation.
*   **Gamification Protocol:** Rules engine handling XP distribution, streak calculations, and achievement unlocking based on user events.

### Mission Control
*   **Analytics Dashboard:** High-performance data visualization using Recharts for trend analysis (Applications, Problems Solved, XP).
*   **Global Leaderboard:** Live ranking system with efficient pagination and tiered aggregation.
*   **The Garden:** GitHub-style activity contribution graph for visualizing momentum and consistency.

## 🏗 Architecture

Kibo follows a modular, component-driven architecture emphasizing separation of concerns and type integrity.

```mermaid
graph TD
    Client[Client (React/Vite)] --> |REST/RPC| Edge[Supabase Edge Network]
    Client --> |WebSocket| Realtime[Realtime Cluster]
    Edge --> DB[(PostgreSQL)]
    Realtime -- Listen --> DB
    Client --> Auth[Auth Service]
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18, TypeScript | Component modularity and static type safety. |
| **Build System** | Vite | High-performance dev server and optimized HMR. |
| **State** | TanStack Query | Server-state management, caching, and optimistic UI. |
| **Database** | PostgreSQL | Relational integrity and JSONB capabilities. |
| **Realtime** | Supabase Realtime | WebSocket subscriptions for CDC (Change Data Capture). |
| **Styling** | TailwindCSS + Shadcn | Utility-first, accessible design system. |

## 🚀 Getting Started

### Prerequisites

*   Node.js v18.0.0+
*   npm v9.0.0+

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Cyrax321/KIBO-v0.git
    cd KIBO-v0
    ```

2.  **Install dependencies**
    ```bash
    npm ci
    ```

3.  **Environment Configuration**
    Copy the example environment file and configure your credentials.
    ```bash
    cp .env.example .env
    ```

4.  **Start the development server**
    ```bash
    npm run dev
    ```

## 🤝 Contributing

We welcome contributions from the community. Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a Pull Request.

### Development Standards
*   **Commits:** Follow conventional commits specification.
*   **Linting:** ESLint + Prettier configuration is enforced.
*   **Testing:** Vitest for unit/integration tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2026 Kibo Systems. All specific rights reserved.
