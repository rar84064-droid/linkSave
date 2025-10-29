import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { LanguageProvider } from "@/react-app/context/LanguageContext";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import HistoryPage from "@/react-app/pages/History";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
