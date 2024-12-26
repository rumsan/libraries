import { Buffer } from 'buffer';

/**
 * Checks if a JWT token has expired.
 * @param token - The JWT token to check.
 * @returns True if the token is expired, otherwise false.
 */

export function isJwtTokenExpired(token: string): boolean {
  try {
    // Split the JWT into its components
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) {
      throw new Error('Invalid token format.');
    }

    // Decode the payload (Base64Url decoding)
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (!payload.exp) {
      throw new Error('Expiration claim (exp) not found in token.');
    }

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return payload.exp < currentTime;
  } catch (error) {
    throw error; // Optionally re-throw or handle error as needed
  }
}
