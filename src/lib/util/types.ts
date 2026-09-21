export interface Position {
  left: number;
  top: number;
}

export type BooleanMap<T> = {
  [P in keyof T]: boolean;
};

/**
 * Reference a property by string with type safety
 * @param key a key of the type
 * @returns the key passed in
 */
export const prop = <T>(key: keyof T & string) => {
  return key;
};
