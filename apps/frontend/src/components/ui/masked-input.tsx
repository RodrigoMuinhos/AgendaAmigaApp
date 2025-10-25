import type { ChangeEvent, FocusEvent, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

export function stripMask(value: string) {
  return value.replace(/\D/g, '');
}

export function formatWithMask(value: string, mask: string) {
  const digits = stripMask(value);
  let result = '';
  let digitIndex = 0;

  for (let i = 0; i < mask.length; i += 1) {
    const maskChar = mask[i];

    if (maskChar === '9') {
      if (digitIndex >= digits.length) {
        break;
      }
      result += digits[digitIndex];
      digitIndex += 1;
    } else {
      if (digitIndex >= digits.length) {
        break;
      }
      result += maskChar;
    }
  }

  return result;
}

type MaskedInputChildProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

type MaskedInputProps = {
  mask: string;
  value?: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  children: (props: MaskedInputChildProps) => ReactNode;
};

export function MaskedInput({ mask, value, onChange, onBlur, children }: MaskedInputProps) {
  const maskedValue = useMemo(() => formatWithMask(value ?? '', mask), [mask, value]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const masked = formatWithMask(event.target.value, mask);
      if (event.target.value !== masked) {
        event.target.value = masked;
        const input = event.target;
        const position = masked.length;
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            input.setSelectionRange(position, position);
          });
        } else {
          input.setSelectionRange(position, position);
        }
      }
      onChange(event);
    },
    [mask, onChange],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      const masked = formatWithMask(event.target.value, mask);
      if (event.target.value !== masked) {
        event.target.value = masked;
      }
      onBlur?.(event);
    },
    [mask, onBlur],
  );

  return <>{children({ value: maskedValue, onChange: handleChange, onBlur: handleBlur })}</>;
}
