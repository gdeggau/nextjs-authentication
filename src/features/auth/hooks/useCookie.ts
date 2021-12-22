import {
  setCookie as setCookeNookie,
  parseCookies,
  destroyCookie,
} from "nookies";
import { Context } from "../types";

export const useCookie = <K extends string, V>(key: K, ctx?: Context) => {
  const setCookie = (value: V) => {
    setCookeNookie(ctx, key, JSON.stringify(value));
  };

  const getCookie = (): V | null => {
    const cookies = parseCookies(ctx);
    const valueStored = cookies[key];
    return valueStored ? JSON.parse(valueStored) : null;
  };

  const deleteCookie = () => {
    destroyCookie(ctx, key);
  };

  return { getCookie, setCookie, deleteCookie } as const;
};
