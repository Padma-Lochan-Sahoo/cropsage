import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null,
    userId: null,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) return;

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

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

