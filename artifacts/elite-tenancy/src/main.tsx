import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import CinematicIntro from "./components/CinematicIntro";
import CookieConsent from "./components/CookieConsent";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <>
    <CinematicIntro />
    <App />
    <CookieConsent />
    <SpeedInsights />
  </>,
);
