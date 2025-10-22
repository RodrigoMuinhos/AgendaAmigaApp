import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../../components/ui/button';

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
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-[rgba(var(--color-border),0.5)] p-4">
      <div className="flex items-center gap-4">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="h-20 w-20 rounded-full object-cover ring-2 ring-[rgba(var(--color-primary),0.4)]"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-lg font-semibold text-[rgb(var(--color-primary))]">
            ?
          </div>
        )}
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            onClick={() => inputRef.current?.click()}
            variant="ghost"
            className="border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
          >
            {preview ? 'Alterar avatar' : 'Selecionar avatar'}
          </Button>
          {preview ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm font-medium text-red-500 underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Selecionar avatar"
      />
      <p className="text-xs text-[rgba(var(--color-text),0.65)]">PNG, JPG ou WEBP ate 2MB.</p>
    </div>
  );
}



