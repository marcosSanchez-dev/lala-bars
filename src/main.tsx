import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/bebas-neue"; // Regular 400 por defecto
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
