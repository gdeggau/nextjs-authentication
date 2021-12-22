import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { API_BASE_URL } from "../../../constants";
import { setupRefreshToken } from "../../features/auth/utils/setupRefreshToken";

type Context = undefined | GetServerSidePropsContext;

export function setupApiClient(ctx: Context = undefined) {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
  });

  const api = setupRefreshToken({ ctx, apiClient });
  return api;
}
