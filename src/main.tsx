import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSoundSystem } from "./lib/sounds";

// Initialize sound system on first user interaction
initSoundSystem();

createRoot(document.getElementById("root")!).render(<App />);
