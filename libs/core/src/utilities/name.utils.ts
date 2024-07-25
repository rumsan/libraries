export interface NameComponents {
  salutation: string;
  first: string;
  middle: string;
  last: string;
  suffix: string;
}

export function parseFullName(fullName: string): NameComponents {
  // List of common salutations as prefix
  const salutations: string[] = [
    'Mr.',
    'Mrs.',
    'Miss',
    'Ms.',
    'Dr.',
    'Prof.',
    'Rev.',
  ];

  // Split the full name into words
  const nameParts: string[] = fullName.split(' ');

  // Initialize variables to store different components
  let salutation: string = '';
  let first: string = '';
  let middle: string = '';
  let last: string = '';
  let suffix: string = '';

  // Check if the first word is a salutation
  if (salutations.includes(nameParts[0])) {
    salutation = nameParts[0];
    nameParts.shift();
  }

  // Check if the last word is a suffix (e.g., Jr., Sr.)
  const lastWord: string = nameParts[nameParts.length - 1];
  if (lastWord.endsWith('Jr.') || lastWord.endsWith('Sr.')) {
    suffix = lastWord;
    nameParts.pop();
  }

  // The remaining words are considered as the first and middle names
  if (nameParts.length > 0) {
    first = nameParts[0];
  }
  if (nameParts.length > 1) {
    middle = nameParts.slice(1).join(' ');
  }

  // If the last name is not already set due to the suffix check, set it now
  if (!suffix && nameParts.length > 0) {
    last = nameParts[nameParts.length - 1];
  }

  return {
    salutation,
    first,
    middle,
    last,
    suffix,
  };
}

export function createFullName(components: NameComponents): string {
  const fullNameParts: string[] = [];

  // Add salutation if present
  if (components.salutation) {
    fullNameParts.push(components.salutation);
  }

  // Add first name
  if (components.first) {
    fullNameParts.push(components.first);
  }

  // Add middle name
  if (components.middle) {
    fullNameParts.push(components.middle);
  }

  // Add last name
  if (components.last) {
    fullNameParts.push(components.last);
  }

  // Add suffix if present
  if (components.suffix) {
    fullNameParts.push(components.suffix);
  }

  // Join the parts to create the full name
  const fullName: string = fullNameParts.join(' ');

  return fullName;
}
