export type AppConfiguration = {
  app: {
    name: string;
    environment: string;
    debug: boolean;
    apiPrefix: string;
    port: string;
    corsOrigins: string;
  };
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
    accessTtl: string;
    refreshSecret: string;
    refreshTtl: string;
    refreshCookieName: string;
  };
  superadmin: {
    email: string;
    password: string;
    nickname: string;
  };
};

export function appConfig(): AppConfiguration {
  return {
    app: {
      name: process.env.APP_NAME ?? "Atlantis Nexus API",
      environment: process.env.APP_ENV ?? "development",
      debug: process.env.APP_DEBUG === "true",
      apiPrefix: process.env.API_V1_PREFIX ?? "/api/v1",
      port: process.env.PORT ?? "4000",
      corsOrigins:
        process.env.BACKEND_CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000",
    },
    database: {
      url: process.env.DATABASE_URL ?? "",
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
      accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me",
      refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
      refreshCookieName: process.env.JWT_REFRESH_COOKIE ?? "atlantis_refresh",
    },
    superadmin: {
      email: process.env.SUPERADMIN_EMAIL ?? "",
      password: process.env.SUPERADMIN_PASSWORD ?? "",
      nickname: process.env.SUPERADMIN_NICKNAME ?? "",
    },
  };
}
