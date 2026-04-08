import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MobileNav from "./components/MobileNav.jsx";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import DiseaseDetection from "./pages/DiseaseDetection.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import WeatherAdvisory from "./pages/WeatherAdvisory.jsx";
import FertilizerRecommendation from "./pages/FertilizerRecommendation.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useTranslation } from "react-i18next";

function AuthBootstrapLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
      <div
        className="h-10 w-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin"
        aria-hidden
      />
      <p className="text-sm text-slate-400">{t("common.loading")}</p>
    </div>
  );
}

function AppRoutes() {
  const { token } = useAuth();
  const location = useLocation();
  const isPublicGuestView =
    !token && (location.pathname === "/" || location.pathname === "/auth");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {token && <Navbar />}
      {token && <Sidebar />}

      <main
        className={
          isPublicGuestView
            ? "flex-1"
            : "flex-1 pt-16 pb-16 md:pb-0 md:pl-52"
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              token ? <Navigate to="/chat" replace /> : <HomePage />
            }
          />

          <Route
            path="/auth"
            element={
              token ? <Navigate to="/chat" replace /> : <AuthPage />
            }
          />

          <Route
            path="/home"
            element={
              token ? <HomePage /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="/chat"
            element={
              token ? <ChatPage /> : <Navigate to="/auth" replace />
            }
          />

          <Route
            path="/disease-detection"
            element={
              token ? <DiseaseDetection /> : <Navigate to="/auth" replace />
            }
          />

          <Route
            path="/profile"
            element={
              token ? <ProfilePage /> : <Navigate to="/auth" replace />
            }
          />

          <Route
            path="/weather"
            element={
              token ? <WeatherAdvisory /> : <Navigate to="/auth" replace />
            }
          />

          <Route
            path="/fertilizer"
            element={
              token ? (
                <FertilizerRecommendation />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </main>
      {token && <MobileNav />}
    </div>
  );
}

function App() {
  const { isReady } = useAuth();

  if (!isReady) {
    return <AuthBootstrapLoader />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
