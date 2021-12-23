import jwtDecode from "jwt-decode";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";
import { AuthTokenError } from "../../errors/AuthTokenError";
import { Cookie, Permission, Role, Authorizations } from "../../types";
import { deleteAuthToken } from "../token/deleteAuthToken";
import { validateUserPermissions } from "./validateUserPermissions";

export function withSSRAuth<P>(
  fn: GetServerSideProps<P>,
  options?: Partial<Authorizations>
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies[Cookie.Token];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (options) {
      const user =
        jwtDecode<{ permissions: Permission[]; roles: Role[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: "/dashboard",
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        deleteAuthToken(ctx);
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
