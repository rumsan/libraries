import * as crypto from 'crypto';
import * as zlib from 'zlib';

// export const CryptoUtils = {
//   generateKeyFromString: (key: string) =>
//     crypto.createHash('sha256').update(key).digest(),

//   encrypt(text: string, key: string): string {
//     const iv = crypto.randomBytes(16);
//     const cipher = crypto.createCipheriv(
//       'aes-256-gcm',
//       generateKeyFromString(key),
//       iv,
//     );

//     const encryptedText = Buffer.concat([
//       cipher.update(text, 'utf-8'),
//       cipher.final(),
//     ]);
//     const tag = cipher.getAuthTag();

//     // Combine IV, tag, and encryptedText with a delimiter
//     const combinedData = `${iv.toString('hex')}:${tag.toString(
//       'hex',
//     )}:${encryptedText.toString('hex')}`;

//     // Compress the combined data
//     const compressedData = zlib.deflateSync(combinedData);

//     // Return the compressed data as a base64-encoded string
//     return compressedData.toString('base64');
//   },

//   decrypt(encryptedData: string, key: string): string {
//     // Decompress the base64-encoded compressed data
//     const compressedData = Buffer.from(encryptedData, 'base64');
//     const decompressedData = zlib.inflateSync(compressedData).toString('utf-8');

//     const [ivHex, tagHex, encryptedTextHex] = decompressedData.split(':');

//     const decipher = crypto.createDecipheriv(
//       'aes-256-gcm',
//       generateKeyFromString(key),
//       Buffer.from(ivHex, 'hex'),
//     );

//     decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

//     const decryptedText = Buffer.concat([
//       decipher.update(Buffer.from(encryptedTextHex, 'hex')),
//       decipher.final(),
//     ]);

//     return decryptedText.toString('utf-8');
//   },
// };

export const generateKeyFromString = (key: string) =>
  crypto.createHash('sha256').update(key).digest();

export function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    generateKeyFromString(key),
    iv,
  );

  const encryptedText = Buffer.concat([
    cipher.update(text, 'utf-8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Combine IV, tag, and encryptedText with a delimiter
  const combinedData = `${iv.toString('hex')}:${tag.toString(
    'hex',
  )}:${encryptedText.toString('hex')}`;

  // Compress the combined data
  const compressedData = zlib.deflateSync(combinedData);

  // Return the compressed data as a base64-encoded string
  return compressedData.toString('base64');
}

export function decrypt(encryptedData: string, key: string): string {
  // Decompress the base64-encoded compressed data
  const compressedData = Buffer.from(encryptedData, 'base64');
  const decompressedData = zlib.inflateSync(compressedData).toString('utf-8');

  const [ivHex, tagHex, encryptedTextHex] = decompressedData.split(':');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    generateKeyFromString(key),
    Buffer.from(ivHex, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  const decryptedText = Buffer.concat([
    decipher.update(Buffer.from(encryptedTextHex, 'hex')),
    decipher.final(),
  ]);

  return decryptedText.toString('utf-8');
}
