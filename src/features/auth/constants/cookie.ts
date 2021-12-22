const prefix = "nextauth";

export const Cookie = {
  Token: `${prefix}.token`,
  RefreshToken: `${prefix}.refreshToken`,
} as const;
