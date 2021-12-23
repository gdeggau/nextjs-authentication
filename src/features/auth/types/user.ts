import { Permission, Role } from ".";

export interface User {
  email: string;
  permissions: Permission[];
  roles: Role[];
}
