import React from "react";
import AppRoute from "./routing/AppRoute";
import { AuthProvider } from "./modules/auth/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoute />
    </AuthProvider>
  );
}

export default App;
