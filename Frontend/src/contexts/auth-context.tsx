import { createContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/axios";
import { setCookie, getCookie, deleteCookie } from "../utils/cookie";

interface AuthContextData {
  signed: boolean;
  user: object | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCookie("@App:user");
    const storedToken = getCookie("@App:token");

    if (storedToken) {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
        setLoading(false);
      } else {
        // Token exists but user cookie is missing - try to recover user info
        api.get("/auth/me")
          .then(response => {
            const userData = response.data.user;
            setUser(userData);
            setCookie("@App:user", JSON.stringify(userData));
            api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          })
          .catch(() => {
            // Token is invalid or expired
            logout();
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    try {
      const response = await api.post<any>("/auth/login", { email, password });
      setUser(response.data.user);
      setCookie("@App:user", JSON.stringify(response.data.user));
      setCookie("@App:token", response.data.token);
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    } catch (error) {
      throw "Credenciais Inválidas";
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const response = await api.post<any>("/auth/register", { name, email, password });
      // Auto-login after successful registration
      setUser(response.data.user);
      setCookie("@App:user", JSON.stringify(response.data.user));
      setCookie("@App:token", response.data.token);
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    setUser(null);
    deleteCookie("@App:user");
    deleteCookie("@App:token");
    delete api.defaults.headers.Authorization;
  }

  return (
    <AuthContext.Provider value={{ signed: Boolean(user), user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
