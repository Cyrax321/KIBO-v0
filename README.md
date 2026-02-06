# Kibo - Career Acceleration Platform

![Kibo Banner](public/og-image.png)

Kibo is a next-generation career acceleration platform designed to gamify the job hunt and skill acquisition process for software engineers. By combining real-time analytics, gamified progress tracking, and AI-driven insights, Kibo transforms the mundane task of job applications into an engaging, high-performance workflow.

## 🚀 Features

### 🎮 Gamified Productivity
- **Daily Focus & XP System:** Earn XP for completing tasks, solving problems, and applying to jobs.
- **The Garden:** A GitHub-style contribution graph that visualizes your daily consistency and momentum.
- **Real-time Leaderboard:** Compete with peers globally. Live updates ensure you always know where you stand.
- **Achievements & Badges:** Unlock milestones like "Code Ninja", "Job Hunter", and "Streak Master".

### 📊 Advanced Analytics
- **Mission Control Dashboard:** A comprehensive view of your application funnel, coding problem stats, and weekly goals.
- **Skills Radar:** Visualize your technical strengths and weaknesses dynamically based on solved problems.
- **Success Rate Gauge:** Track your interview and offer rates to optimize your strategy.
- **Activity Heatmaps:** Detailed breakdown of your productivity patterns.

### ⚡ Real-Time Sync Engine
- **Instant Updates:** Built on Supabase Realtime, actions reflect instantly across all devices.
- **Live Notifications:** Get notified 15 minutes before scheduled interviews or contests.
- **Optimistic UI:** Smooth, lag-free interactions for task management and status updates.

### 🛠 Tools & Utilities
- **Code Lab:** Track LeetCode/HackerRank progress with integrated difficulty analysis.
- **Application Tracker:** Kanban-style board to manage job applications from "Applied" to "Offer".
- **Schedule Manager:** Integrated calendar for interviews and coding contests.

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion (Animations)
- **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management:** React Query (TanStack Query)
- **Utilities:** Lucide Icons, Recharts (Data Visualization), date-fns

## 🏗️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Cyrax321/KIBO-v0.git
   cd KIBO-v0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Your Name](https://github.com/Cyrax321)
