export interface Position {
  left: number;
  top: number;
}

export type BooleanMap<T> = {
  [P in keyof T]: boolean;
};
