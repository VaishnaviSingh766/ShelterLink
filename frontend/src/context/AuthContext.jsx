import { createContext, useState, useContext, useEffect } from "react";

// Create the actual context object
const AuthContext = createContext();

// This component will wrap our whole app, making auth data available everywhere inside it
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // When the app first loads, check if we already have saved login info in the browser
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Called after a successful login or signup
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Called to log out
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A custom hook, so other components can easily access this data
export function useAuth() {
  return useContext(AuthContext);
}