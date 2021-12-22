import { AxiosInstance } from "axios";

export function setAuthorizationHeader(token: string, api: AxiosInstance) {
  api.defaults.headers["Authorization"] = token ? `Bearer ${token}` : "";
}
