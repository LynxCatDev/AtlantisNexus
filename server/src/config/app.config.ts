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
  storage: {
    driver: "local" | "r2";
    localRoot: string;
    localPublicBase: string;
    r2: {
      accountId: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      publicUrlBase: string;
    };
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
    storage: {
      driver: (process.env.STORAGE_DRIVER as "local" | "r2") ?? "local",
      localRoot: process.env.STORAGE_LOCAL_ROOT ?? "uploads",
      localPublicBase:
        process.env.STORAGE_LOCAL_PUBLIC_BASE ?? "http://localhost:4000/uploads",
      r2: {
        accountId: process.env.R2_ACCOUNT_ID ?? "",
        bucket: process.env.R2_BUCKET ?? "",
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
        publicUrlBase: process.env.R2_PUBLIC_URL_BASE ?? "",
      },
    },
  };
}
