import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </HelmetProvider>
);
