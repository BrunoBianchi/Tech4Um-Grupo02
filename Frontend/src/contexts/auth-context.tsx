import { createContext, useEffect, useState, ReactNode } from "react";
import { api } from "../services/axios";

interface AuthContextData {
  signed: boolean;
  user: object | null;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("@App:user");
    const storedToken = localStorage.getItem("@App:token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
    }
  }, []);

  async function login(email: string, password: string) {
    try {
      const response = await api.post<any>("/auth/login", { email, password });
      setUser(response.data.user);
      localStorage.setItem("@App:user", JSON.stringify(response.data.user));
      localStorage.setItem("@App:token", response.data.token);
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
      localStorage.setItem("@App:user", JSON.stringify(response.data.user));
      localStorage.setItem("@App:token", response.data.token);
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    delete api.defaults.headers.Authorization;
  }

  return (
    <AuthContext.Provider value={{ signed: Boolean(user), user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
