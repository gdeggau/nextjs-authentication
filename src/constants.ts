export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL as string;

export const ROUTES = {
  home: {
    path: "/",
  },
  dashboard: {
    path: "/dashboard",
  },
  metrics: {
    path: "/metrics",
  },
} as const;
