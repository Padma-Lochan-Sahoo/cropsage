import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null,
    userId: null,
  });

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const exp = decoded?.exp;
      if (!exp) return true;
      return exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) return;

    if (isTokenExpired(storedToken)) {
      localStorage.removeItem("authToken");
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);
      setAuth({
        token: storedToken,
        userId: decoded?.user?.id ?? null,
      });
    } catch {
      localStorage.removeItem("authToken");
    }
  }, []);

  const login = (token) => {
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("authToken");
      setAuth({ token: null, userId: null });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("authToken", token);
      setAuth({
        token,
        userId: decoded?.user?.id ?? null,
      });
    } catch {
      // invalid token, ignore
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuth({ token: null, userId: null });
  };

  // Auto logout on API 401 (expired/invalid token on server side)
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
          if (window.location.pathname !== "/auth") {
            window.location.href = "/auth";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

