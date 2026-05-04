export type StoredObject = {
  url: string;
  key: string;
};

export interface ObjectStorage {
  put(input: { key: string; body: Buffer; contentType: string }): Promise<StoredObject>;
  delete(key: string): Promise<void>;
}
