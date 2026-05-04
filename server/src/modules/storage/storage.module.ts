import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LocalStorageService } from "./local-storage.service";
import { R2StorageService } from "./r2-storage.service";
import type { ObjectStorage } from "./storage.types";

export const OBJECT_STORAGE = Symbol("OBJECT_STORAGE");

@Module({
  providers: [
    LocalStorageService,
    {
      provide: OBJECT_STORAGE,
      inject: [ConfigService, LocalStorageService],
      useFactory: (config: ConfigService, local: LocalStorageService): ObjectStorage => {
        const driver = config.get<string>("storage.driver", "local");
        const logger = new Logger("StorageModule");

        if (driver === "r2") {
          try {
            const r2 = new R2StorageService(config);
            logger.log("Object storage driver: r2");
            return r2;
          } catch (err) {
            logger.warn(
              `R2 storage envs incomplete, falling back to local: ${(err as Error).message}`,
            );
          }
        }

        logger.log("Object storage driver: local");
        return local;
      },
    },
  ],
  exports: [OBJECT_STORAGE],
})
export class StorageModule {}
