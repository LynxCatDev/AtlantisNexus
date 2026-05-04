import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { ObjectStorage, StoredObject } from "./storage.types";

@Injectable()
export class R2StorageService implements ObjectStorage {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.getOrThrow<string>("storage.r2.accountId");
    const accessKeyId = this.config.getOrThrow<string>("storage.r2.accessKeyId");
    const secretAccessKey = this.config.getOrThrow<string>("storage.r2.secretAccessKey");

    this.bucket = this.config.getOrThrow<string>("storage.r2.bucket");
    this.publicBase = this.config
      .getOrThrow<string>("storage.r2.publicUrlBase")
      .replace(/\/+$/, "");

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
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
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    this.logger.debug(`Uploaded ${body.byteLength}B to r2://${this.bucket}/${key}`);
    return { key, url: `${this.publicBase}/${key}` };
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (err) {
      this.logger.warn(`Failed to delete r2://${this.bucket}/${key}: ${(err as Error).message}`);
    }
  }
}
