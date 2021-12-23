import { destroyCookie } from "nookies";
import { AuthMessage } from "../../constants";
import { Context, Cookie } from "../../types";
import { getAuthChannel } from "../broadcast/authChannel";

export function deleteAuthToken(ctx?: Context) {
  destroyCookie(ctx, Cookie.Token);
  destroyCookie(ctx, Cookie.RefreshToken);
  if (process.browser) {
    getAuthChannel().postMessage(AuthMessage.SignOut);
  }
}
