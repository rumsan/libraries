import { Service } from '@prisma/client';
import { ERRORS, EVENTS } from '../constants';

export function getServiceTypeByAddress(input: string): Service | null {
  // Regular expressions for email, Ethereum wallet address, phone number, and username
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  const phoneRegex = /^\+?\d{10,15}$/; // Flexible phone: 10-15 digits, optional + prefix
  const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/; // Username: 3-30 chars, alphanumeric, underscore, dot

  if (emailRegex.test(input)) {
    return Service.EMAIL;
  } else if (walletRegex.test(input)) {
    return Service.WALLET;
  } else if (phoneRegex.test(input)) {
    return Service.PHONE;
  } else if (usernameRegex.test(input)) {
    return Service.USERNAME;
  } else {
    throw ERRORS.SERVICE_TYPE_INVALID;
  }
}

// Helper function to get the appropriate verification event name
export function getVerificationEventName(service: Service) {
  switch (service) {
    case Service.EMAIL:
      return EVENTS.EMAIL_TO_VERIFY;
    case Service.PHONE:
      return EVENTS.PHONE_TO_VERIFY;
    case Service.WALLET:
      return EVENTS.WALLET_TO_VERIFY;
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
}
