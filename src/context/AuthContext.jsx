import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    role: null,
    loading: true,
  });

  // LOAD AUTH ON START
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");

      const user = userRaw ? JSON.parse(userRaw) : null;

      if (token && user) {
        setAuth({
          token,
          user,
          role: user.role,
          loading: false,
        });
      } else {
        setAuth({
          token: null,
          user: null,
          role: null,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Auth load error:", err);
      setAuth({
        token: null,
        user: null,
        role: null,
        loading: false,
      });
    }
  }, []);

  // LOGIN
  const login = (data) => {
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data));

    setAuth({
      token: data.accessToken,
      user: data,
      role: data.role,
      loading: false,
    });
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      token: null,
      user: null,
      role: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);