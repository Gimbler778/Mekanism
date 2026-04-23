import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "hr" | "hiring_manager" | "vendor";
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ats_token");
    if (token) {
      authApi
        .me()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem("ats_token"))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { user, token } = res.data.data;
    localStorage.setItem("ats_token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("ats_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
