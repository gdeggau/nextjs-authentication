import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../constants";
import { parseCookies, setCookie } from "nookies";
import { GetServerSidePropsContext } from "next";
import { AuthTokenError } from "./errors/AuthTokenError";
import { signOut } from "../features/auth/contexts/AuthContext";

interface FailedRequestQueue {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

type Context = undefined | GetServerSidePropsContext;

let isRefreshing = false;
let failedRequestsQueue: Array<FailedRequestQueue> = [];

export function setupAPIClient(ctx: Context = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
  });

  // Refresh token mechanism
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);

          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                    path: "/",
                  }
                );

                api.defaults.headers["Authorization"] = `Bearer ${token}`;
                failedRequestsQueue.forEach((req) => req.onSuccess(token));
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((req) => req.onFailure(err));
                failedRequestsQueue = [];
                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;
                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
}
