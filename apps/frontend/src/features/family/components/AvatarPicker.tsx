import { useRef, type ChangeEvent } from 'react';
import { Camera, XCircle } from 'lucide-react';

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
  addLabel: _addLabel,
  changeLabel: _changeLabel,
  removeLabel,
}: AvatarPickerProps) {
  const inputId = useRef(`avatar-${Math.random().toString(36).slice(2)}`);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.9)] shadow-soft transition hover:border-[rgb(var(--color-primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]"
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-8 w-8 text-[rgba(var(--color-text),0.45)] transition group-hover:text-[rgb(var(--color-primary))]" aria-hidden />
        )}
      </button>

      <input
        id={inputId.current}
        type="file"
        accept="image/*"
        className="sr-only"
        ref={inputRef}
        onBlur={onBlur}
        onChange={handleFileChange}
      />

      {value ? (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,255,255,0.9)] text-[rgb(var(--color-danger))] shadow-soft transition hover:bg-[rgb(var(--color-danger))] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,136,229,0.35)]"
          aria-label={removeLabel}
        >
          <XCircle className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
