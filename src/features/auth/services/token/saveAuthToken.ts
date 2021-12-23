import { AxiosInstance } from "axios";
import { CookieSerializeOptions } from "next/dist/server/web/types";
import { setCookie } from "nookies";
import { Context, Cookie } from "../../types";
import { setAuthorizationHeader } from ".";
import { ROUTES } from "@constants";

const cookieConfig: CookieSerializeOptions = {
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: ROUTES.home.path,
};

interface saveAuthTokenParams {
  ctx?: Context;
  token: string;
  refreshToken: string;
  apiClient: AxiosInstance;
}

export function saveAuthToken({
  refreshToken,
  token,
  ctx,
  apiClient,
}: saveAuthTokenParams) {
  setCookie(ctx, Cookie.Token, token, cookieConfig);
  setCookie(ctx, Cookie.RefreshToken, refreshToken, cookieConfig);
  setAuthorizationHeader(token, apiClient);
}
