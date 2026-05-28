import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const roleHome = {
  user: "/user/dashboard",
  seller: "/seller/dashboard",
  admin: "/admin/dashboard",
  deliveryPartner: "/delivery/dashboard",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("velos_token"));
  const [loading, setLoading] = useState(true);

  const persistAuth = (nextToken, nextUser) => {
    localStorage.setItem("velos_token", nextToken);
    localStorage.setItem("velos_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("velos_token");
    localStorage.removeItem("velos_user");
    setToken(null);
    setUser(null);
  };

  const login = async (role, credentials) => {
    const { data } = await api.post(`/${rolePath(role)}/login`, credentials);
    persistAuth(data.token, data.user);
    return data.user;
  };

  const register = async (role, payload) => {
    const { data } = await api.post(`/${rolePath(role)}/register`, payload);
    persistAuth(data.token, data.user);
    return data.user;
  };

  useEffect(() => {
    const stored = localStorage.getItem("velos_user");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token && user),
      homeRoute: user ? roleHome[user.role] : "/",
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const rolePath = (role) => {
  if (role === "deliveryPartner") return "delivery";
  return role;
};

export const useAuth = () => useContext(AuthContext);

