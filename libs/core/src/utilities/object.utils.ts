export const convertObjectKeysToUpperCase = (
  source: Record<string, any>,
): Record<string, any> => {
  return Object.keys(source).reduce((destination: any, key) => {
    destination[key.toUpperCase()] = source[key];
    return destination;
  }, {});
};

export const convertObjectKeysToLowerCase = (
  source: Record<string, any>,
): Record<string, any> => {
  return Object.keys(source).reduce((destination: any, key) => {
    destination[key.toLowerCase()] = source[key];
    return destination;
  }, {});
};

export const removeProperties = (
  obj: Record<string, any>,
  props: string[],
): void => {
  for (let i = 0; i < props.length; i++) {
    delete obj[props[i]];
  }
};

export const getValueByPath = (obj: Record<string, any>, path: string): any => {
  return path
    .split('.')
    .reduce(
      (obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined),
      obj,
    );
};

export const isJsonObject = (value: any): boolean => {
  try {
    const parsedValue = JSON.parse(JSON.stringify(value));
    return (
      typeof parsedValue === 'object' &&
      !Array.isArray(parsedValue) &&
      parsedValue !== null
    );
  } catch (error) {
    return false;
  }
};
