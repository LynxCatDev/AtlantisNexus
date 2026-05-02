export type AppConfiguration = {
  app: {
    name: string;
    environment: string;
    debug: boolean;
    apiPrefix: string;
    port: string;
    corsOrigins: string;
  };
  postgres: {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
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
    postgres: {
      host: process.env.POSTGRES_HOST ?? "localhost",
      port: process.env.POSTGRES_PORT ?? "5432",
      database: process.env.POSTGRES_DB ?? "atlantis_nexus",
      username: process.env.POSTGRES_USER ?? "atlantis",
      password: process.env.POSTGRES_PASSWORD ?? "atlantis",
    },
  };
}
