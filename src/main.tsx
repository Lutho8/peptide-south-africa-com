import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

const normalizePath = (value: string) => value.replace(/\/+$/, "") || "/";
const prerenderPath = root.dataset.prerenderPath;
const canHydrate =
  root.hasChildNodes() &&
  typeof prerenderPath === "string" &&
  normalizePath(prerenderPath) === normalizePath(window.location.pathname);

if (canHydrate) {
  hydrateRoot(root, app);
} else {
  // A non-prerendered route can receive the homepage HTML through the SPA
  // rewrite. Remove that stale shell before mounting the requested route.
  root.replaceChildren();
  createRoot(root).render(app);
}
