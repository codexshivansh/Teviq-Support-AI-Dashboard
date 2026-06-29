import { ClerkProvider } from "@clerk/clerk-react";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { CLERK_PUBLISHABLE_KEY } from "./auth/authConfig.js";
import "./styles.css";

const app = (
  <AuthProvider>
    <App />
  </AuthProvider>
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
        {app}
      </ClerkProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
