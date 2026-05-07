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

  // Guest-only pages: no top navbar / sidebar from App shell
  const isGuestPage = !token && (location.pathname === "/" || location.pathname === "/auth");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

      {/* ── Logged-in top navbar (all screen sizes) ── */}
      {token && <Navbar />}

      {/* ── Sidebar — desktop only (md+), logged-in only ── */}
      {token && <Sidebar />}

      {/* ── Main content area ── */}
      <main
        className={
          isGuestPage
            ? "flex-1"                                        // Guest: no padding, LandingNavBar lives inside HomePage
            : "flex-1 pt-14 pb-20 md:pb-4 md:pl-52"         // Logged in:
                                                              //   pt-14  → clears fixed top Navbar (56px)
                                                              //   pb-20  → clears fixed bottom MobileNav on mobile
                                                              //   md:pb-4 → no MobileNav on md+
                                                              //   md:pl-52 → clears fixed Sidebar on md+
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/"    element={token ? <Navigate to="/chat" replace /> : <HomePage />} />
          <Route path="/auth" element={token ? <Navigate to="/chat" replace /> : <AuthPage />} />

          {/* Shared route — accessible both logged-in and guest (home page with hero) */}
          <Route path="/home" element={token ? <HomePage /> : <Navigate to="/" replace />} />

          {/* Protected routes */}
          <Route path="/chat"              element={token ? <ChatPage />                : <Navigate to="/auth" replace />} />
          <Route path="/disease-detection" element={token ? <DiseaseDetection />        : <Navigate to="/auth" replace />} />
          <Route path="/profile"           element={token ? <ProfilePage />             : <Navigate to="/auth" replace />} />
          <Route path="/weather"           element={token ? <WeatherAdvisory />         : <Navigate to="/auth" replace />} />
          <Route path="/fertilizer"        element={token ? <FertilizerRecommendation />: <Navigate to="/auth" replace />} />
        </Routes>
      </main>

      {/* ── Bottom MobileNav — mobile only (hidden md+), logged-in only ── */}
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