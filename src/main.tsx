import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<BrowserRouter><App /></BrowserRouter>);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => console.error("[PWA] service worker registration failed", error)));
}
