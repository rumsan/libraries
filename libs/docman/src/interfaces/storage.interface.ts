export interface Storage {
  initialize(config: any): void;
  upload(file: Buffer, filename: string): Promise<string>;
  download(fileKey: string): Promise<Buffer>;
  delete(fileKey: string): Promise<void>;
}
