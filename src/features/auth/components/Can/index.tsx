import { ReactNode } from "react";
import { useCan } from "../../hooks/useCan";
import { Authorizations } from "../../types/authorizations";

interface CanProps extends Partial<Authorizations> {
  children: ReactNode;
}

export function Can({ children, permissions, roles }: CanProps) {
  const userCanSeeComponent = useCan({ permissions, roles });

  if (!userCanSeeComponent) {
    return null;
  }

  return <>{children}</>;
}
