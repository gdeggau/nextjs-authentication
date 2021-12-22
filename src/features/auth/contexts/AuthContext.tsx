import { CookieSerializeOptions } from "next/dist/server/web/types";
import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { APP_URL } from "../../../../constants";
import { api } from "../../../services/api";
import { Cookie } from "../constants";
import { saveAuthToken } from "../services/token/saveAuthToken";
import { Permission, Role } from "../types";

interface User {
  email: string;
  permissions: Permission[];
  roles: Role[];
}

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

let authChannel: BroadcastChannel;

export const signOut = () => {
  destroyCookie(undefined, Cookie.Token);
  destroyCookie(undefined, Cookie.RefreshToken);
  authChannel.postMessage("signOut");
  Router.push("/");
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel("auth");
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          authChannel.close();
          break;
        case "signIn":
          window.location.replace(`${APP_URL}/dashboard`);
          break;
        default:
          break;
      }
    };
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

      Router.push("/dashboard");
      authChannel.postMessage("signIn");
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
