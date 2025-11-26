import { createContext, useEffect, useState } from "react";
import { api } from "../services/axios";
interface AuthContextData {
  signed: boolean;
  login(email: string, password: string): Promise<void>;
  logout():void;
  user: object | null;
}
const AuthContext = createContext<AuthContextData>({} as AuthContextData);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(()=>{
    const storagedUser = localStorage.getItem('@App:user');
    const storagedToken = localStorage.getItem('@App:token');

    if (storagedToken && storagedUser) {
      setUser(JSON.parse(storagedUser));
      api.defaults.headers.Authorization = `Bearer ${storagedToken}`;
    }
  },[])
  const [user, setUser] = useState<object | null>(null);
  async function login(email: string, password: string) {
    try {
      const response = await api.post<any>("/auth/login", {
        email: email,
        password: password,
      }) as any;
          setUser(response.data.user)
          localStorage.setItem('@App:user', JSON.stringify(response.data.user));
          localStorage.setItem('@App:token', response.data.token);
          api.defaults.headers.Authorization = `Bearer ${response.data.token}`
    } catch (error) {
      throw "Credenciais Inválidas"
    }
  }
  function logout() {
    setUser(null);
    localStorage.removeItem('@App:user');
    localStorage.removeItem('@App:token');
    delete api.defaults.headers.Authorization;
  }
  return (
    <AuthContext.Provider value={{ signed: Boolean(user),user, login,logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
