import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { ObjectStorage, StoredObject } from "./storage.types";

@Injectable()
export class LocalStorageService implements ObjectStorage {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly root: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    this.root = resolve(
      process.cwd(),
      this.config.get<string>("storage.localRoot", "uploads"),
    );
    this.publicBase = this.config
      .get<string>("storage.localPublicBase", "http://localhost:4000/uploads")
      .replace(/\/+$/, "");
  }

  async put({
    key,
    body,
    contentType,
  }: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<StoredObject> {
    const target = join(this.root, key);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, body);
    this.logger.debug(`Wrote ${body.byteLength}B to ${target} (${contentType})`);
    return { key, url: `${this.publicBase}/${key}` };
  }

  async delete(key: string): Promise<void> {
    const target = join(this.root, key);
    try {
      await unlink(target);
    } catch {
      // ignore — best-effort delete
    }
  }
}
