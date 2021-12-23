import { Authorizations } from "../../types/authorizations";

type UserAuthorizations = Authorizations;

interface ValidateUserPermissionsParams extends Partial<Authorizations> {
  user: UserAuthorizations;
}

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  // Check user permissions
  if (Boolean(permissions?.length)) {
    const hasAllPermissions = permissions.every((permission) => {
      return user.permissions.includes(permission);
    });

    if (!hasAllPermissions) {
      return false;
    }
  }

  // Check user roles
  if (Boolean(roles?.length)) {
    const hasAllRoles = roles.some((role) => {
      return user.roles.includes(role);
    });

    if (!hasAllRoles) {
      return false;
    }
  }
  return true;
}
