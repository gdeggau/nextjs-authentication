import { Permission, Role } from ".";

export interface Authorizations {
  permissions: Permission[];
  roles: Role[];
}
