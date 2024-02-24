export function isValidString(
  input: string,
  allowedChars: string = '',
): boolean {
  // Construct the regular expression pattern with additional characters
  const regexPattern = `^[a-zA-Z0-9_\\-${allowedChars}]+$`;

  // Create the regular expression with the constructed pattern
  const regex = new RegExp(regexPattern);

  // Test the input against the regular expression
  return regex.test(input);
}

export function stringToArray(value: string | string[]): string[] {
  if (typeof value === 'string') {
    return value.split(',').map((v) => v.trim());
  } else if (Array.isArray(value)) {
    return value.map((v) => v.trim());
  } else {
    return [];
  }
}
