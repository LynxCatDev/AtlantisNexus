import "dotenv/config";

import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { defineConfig } from "prisma/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set; cannot configure Prisma.");
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  adapter: () => new PrismaPg({ connectionString }),
});
