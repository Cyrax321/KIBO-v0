import { createRoot } from "react-dom/client";
import { loader } from "@monaco-editor/react";
import App from "./App.tsx";

// Configure Monaco Editor to load from a reliable CDN
loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs" } });
import "./index.css";
import { initSoundSystem } from "./lib/sounds";

// Initialize sound system on first user interaction
initSoundSystem();

createRoot(document.getElementById("root")!).render(<App />);
