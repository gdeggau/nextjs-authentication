import { ROUTES } from "@constants";
import Router from "next/router";
import { parseCookies } from "nookies";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../../../services/api";
import { Cookie, AuthMessage } from "../constants";
import {
  getAuthChannel,
  initAuthBroadcast,
} from "../services/broadcast/authChannel";
import { deleteAuthToken, saveAuthToken } from "../services/token";
import { User } from "../types/user";

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  signOut: () => void;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  user: User | undefined;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

export const signOut = () => {
  deleteAuthToken();
  Router.push(ROUTES.home.path);
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    initAuthBroadcast();
  }, []);

  useEffect(() => {
    const { [Cookie.Token]: token } = parseCookies();
    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      saveAuthToken({
        refreshToken,
        token,
        apiClient: api,
      });

      setUser({
        email,
        permissions,
        roles,
      });

      Router.push(ROUTES.dashboard.path);
      getAuthChannel().postMessage(AuthMessage.SignIn);
    } catch (error) {}
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
