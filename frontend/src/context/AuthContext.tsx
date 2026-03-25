import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, login, register } from "../api/auth";
import { ApiError, getErrorMessage } from "../api/http";
import type { User } from "../api/types";

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export type { User };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token"))
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const me = await getCurrentUser();
        if (!cancelled) setUser(me);
      } catch (err) {
        const e = err instanceof ApiError ? err : null;
        if (e?.status === 401) {
          logout();
        } else if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const loginUser = useCallback(async (email: string, password: string) => {
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      throw new Error(getErrorMessage(e, "Login failed"));
    }
  }, []);

  const registerUser = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      try {
        const body = await register(data);
        localStorage.setItem("token", body.token);
        setToken(body.token);
        setUser(body.user);
      } catch (e) {
        throw new Error(getErrorMessage(e, "Registration failed"));
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login: loginUser,
      register: registerUser,
      logout,
    }),
    [user, token, loading, loginUser, registerUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
