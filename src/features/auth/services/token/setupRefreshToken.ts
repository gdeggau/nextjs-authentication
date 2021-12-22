import { AxiosError, AxiosInstance } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../../contexts/AuthContext";
import { AuthTokenError } from "../../errors/AuthTokenError";
import { Context, Cookie } from "../../types";
import { saveAuthToken } from "./saveAuthToken";
import { setAuthorizationHeader } from "./setAuthorizationHeader";

interface FailedRequestQueue {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

let isRefreshing = false;
let failedRequestsQueue: Array<FailedRequestQueue> = [];

interface setupRefreshTokenParams {
  ctx?: Context;
  apiClient: AxiosInstance;
}

export function setupRefreshToken({ ctx, apiClient }: setupRefreshTokenParams) {
  let cookies = parseCookies(ctx);
  const tokenJwt = cookies[Cookie.Token];
  setAuthorizationHeader(tokenJwt, apiClient);
  // Refresh token mechanism
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);

          const { [Cookie.RefreshToken]: actualRefreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            apiClient
              .post("/refresh", {
                refreshToken: actualRefreshToken,
              })
              .then((response) => {
                const { token, refreshToken } = response.data;

                saveAuthToken({
                  refreshToken,
                  token,
                  ctx,
                  apiClient,
                });

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
                resolve(apiClient(originalConfig));
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
  return apiClient;
}
