"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";
import { apiClient } from "@/lib/api-client";

interface User {
  id: number;
  email: string;
  username: string;
  archetype_id?: number;
  tier_id?: number;
  bio?: string;
  full_name?: string;
  preferred_themes?: string;
  portfolio_links?: string;
  next_build?: string;
  affiliations?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            setIsLoggedIn(true);
            
            // Verify token is still valid by fetching current user
            try {
              const freshUser = await apiClient.get<User>(`/users/me`, {
                requireAuth: true,
              });
              setCurrentUser(freshUser);
              localStorage.setItem("user", JSON.stringify(freshUser));
            } catch {
              // Token invalid, clear auth state
              localStorage.removeItem("access_token");
              localStorage.removeItem("user");
              setCurrentUser(null);
              setIsLoggedIn(false);
            }
          } catch {
            // Invalid user data
            localStorage.removeItem("user");
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Error loading auth state:", err);
        setCurrentUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();

    // Listen for storage changes (e.g., login from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user") {
        loadAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Login with form-urlencoded (OAuth2)
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: formData.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.detail || "Login failed" };
      }

      // Save token
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // Fetch user data
      if (data.access_token) {
        try {
          const userData = await apiClient.get<User>(`/users/me`, {
            requireAuth: true,
          });
          setCurrentUser(userData);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          // Still consider login successful if we have token
          setIsLoggedIn(true);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setIsLoggedIn(false);
    router.push("/login");
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.get<User>(`/users/me`, {
        requireAuth: true,
      });
      setCurrentUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to refresh user:", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
