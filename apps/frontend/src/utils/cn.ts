export type ClassValue =
  | string
  | number
  | null
  | boolean
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  inputs.forEach((value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) classes.push(nested);
    } else {
      classes.push(String(value));
    }
  });

  return classes.join(" ");
}
