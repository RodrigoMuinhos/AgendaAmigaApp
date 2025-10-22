import { useRef, type ChangeEvent } from 'react';

type AvatarPickerProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  onBlur: () => void;
  addLabel: string;
  changeLabel: string;
  removeLabel: string;
};

export function AvatarPicker({
  value,
  onChange,
  onBlur,
  addLabel,
  changeLabel,
  removeLabel,
}: AvatarPickerProps) {
  const inputId = useRef(`avatar-${Math.random().toString(36).slice(2)}`);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onChange(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <div className="flex flex-col items-center gap-3 md:items-start">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[rgb(var(--color-border))] bg-[rgba(var(--color-border),0.1)]">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-muted">
            {addLabel}
          </span>
        )}
      </div>
      <label
        htmlFor={inputId.current}
        className="cursor-pointer text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline"
      >
        {value ? changeLabel : addLabel}
      </label>
      <input
        id={inputId.current}
        type="file"
        accept="image/*"
        className="sr-only"
        onBlur={onBlur}
        onChange={handleFileChange}
      />
      {value ? (
        <button type="button" onClick={handleRemove} className="text-xs text-muted hover:underline">
          {removeLabel}
        </button>
      ) : null}
    </div>
  );
}

