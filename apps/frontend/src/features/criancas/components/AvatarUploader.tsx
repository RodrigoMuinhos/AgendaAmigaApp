import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, XCircle } from 'lucide-react';

type AvatarUploaderProps = {
  value?: string;
  onChange: (value?: string) => void;
};

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | undefined>(value);

  const preview = localPreview ?? value;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : undefined;
      setLocalPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setLocalPreview(undefined);
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.95)] shadow-soft transition hover:border-[rgb(var(--color-primary))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]"
      >
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <Camera className="h-9 w-9 text-[rgba(var(--color-text),0.45)] transition group-hover:text-[rgb(var(--color-primary))]" aria-hidden />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Selecionar avatar"
      />

      {preview ? (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.95)] text-[rgb(var(--color-danger))] shadow-soft transition hover:bg-[rgb(var(--color-danger))] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,136,229,0.35)]"
          aria-label="Remover avatar"
        >
          <XCircle className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}



