import { useAuth } from "../contexts/AuthContext";
import { validateUserPermissions } from "../services/authorization";
import { Authorizations } from "../types";

type UseCanParams = Partial<Authorizations>;

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
}
