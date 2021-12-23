import { ROUTES } from "@constants";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";
import { Cookie } from "../../types";

export function withSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (cookies[Cookie.Token]) {
      return {
        redirect: {
          destination: ROUTES.dashboard.path,
          permanent: false,
        },
      };
    }

    return await fn(ctx);
  };
}
