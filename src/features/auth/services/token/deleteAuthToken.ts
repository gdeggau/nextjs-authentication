import Router from "next/router";
import { destroyCookie } from "nookies";
import { AuthTokenError } from "../../errors/AuthTokenError";
import { Cookie } from "../../types";

export function deleteAuthToken(context = undefined, broadcast = true) {
  destroyCookie(context, Cookie.Token);
  destroyCookie(context, Cookie.RefreshToken);

  // if(broadcast) {
  //   getAuthChannel().postMessage("signOut");
  // };

  if (process.browser) {
    Router.push("/");
  } else {
    return Promise.reject(new AuthTokenError());
  }
}
