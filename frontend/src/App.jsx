import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import HomePage from "./pages/HomePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import DiseaseDetection from "./pages/DiseaseDetection.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import WeatherAdvisory from "./pages/WeatherAdvisory.jsx";
import FertilizerRecommendation from "./pages/FertilizerRecommendation.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { token } = useAuth();


  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {token && <Navbar />}
        {token && <Sidebar />}

        <main className="flex-1 pt-16 pl-52">
          <Routes>

            {/* Default Route */}
            <Route
              path="/"
              element={token ? <Navigate to="/home" /> : <AuthPage />}
            />

            <Route
              path="/auth"
              element={token ? <Navigate to="/home" /> : <AuthPage />}
            />

            <Route
              path="/home"
              element={token ? <HomePage /> : <Navigate to="/auth" />}
            />

            <Route
              path="/chat"
              element={token ? <ChatPage /> : <Navigate to="/auth" />}
            />

            <Route
              path="/disease-detection"
              element={token ? <DiseaseDetection /> : <Navigate to="/auth" />}
            />

            <Route
              path="/profile"
              element={token ? <ProfilePage /> : <Navigate to="/auth" />}
            />

            <Route
              path="/weather"
              element={token ? <WeatherAdvisory /> : <Navigate to="/auth" />}
            />

            <Route
              path="/fertilizer"
              element={token ? <FertilizerRecommendation /> : <Navigate to="/auth" />}
            />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
