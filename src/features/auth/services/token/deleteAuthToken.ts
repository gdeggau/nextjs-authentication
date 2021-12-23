import { destroyCookie } from "nookies";
import { Context, Cookie } from "../../types";

export function deleteAuthToken(ctx?: Context) {
  destroyCookie(ctx, Cookie.Token);
  destroyCookie(ctx, Cookie.RefreshToken);
}
