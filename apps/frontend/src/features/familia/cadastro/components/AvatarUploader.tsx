import { useCallback, useId, useRef, useState } from "react";
import { cadastroStrings } from "../strings";
import { AvatarCropper, type AvatarCropperResult } from "./AvatarCropper";

type AvatarValue = {
  file?: File | null;
  url?: string | null;
};

type AvatarUploaderProps = {
  value?: AvatarValue;
  onChange: (value: AvatarValue) => void;
  onError?: (message: string) => void;
};

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUploader({ value, onChange, onError }: AvatarUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropSource, setCropSource] = useState<{ url: string; fileName: string; mimeType: string } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE_BYTES) {
        onError?.("Selecione um arquivo de até 2 MB");
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError?.("Formato inválido. Use JPG, PNG ou WebP");
        return;
      }
      const previewUrl = await readFileAsDataUrl(file);
      setCropSource({ url: previewUrl, fileName: file.name, mimeType: file.type });
    },
    [onError]
  );

  const handleInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const file = event.target.files?.[0];
      if (file) void handleFile(file);
      event.target.value = "";
    },
    [handleFile]
  );

  const handleDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>(() => {
    setIsDragging(false);
  }, []);

  const handleCropConfirm = useCallback(
    (result: AvatarCropperResult) => {
      setCropSource(null);
      onChange({ file: result.file, url: result.previewUrl });
    },
    [onChange]
  );

  const handleCropCancel = useCallback(() => {
    setCropSource(null);
  }, []);

  const handleRemove = useCallback(() => {
    onChange({ file: null, url: null });
  }, [onChange]);

  return (
    <div className="space-y-3" aria-live="polite">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {cadastroStrings.personal.avatarLabel}
      </label>

      <div
        role="button"
        tabIndex={0}
        aria-label={cadastroStrings.personal.avatarLabel}
        aria-describedby={`${inputId}-hint`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex aspect-square w-44 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
          isDragging ? "border-primary bg-primary/5" : "border-border/70 bg-background"
        }`}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full border border-border/60" />

        {value?.url ? (
          <div className="relative h-full w-full">
            <img src={value.url} alt="Avatar selecionado" className="h-full w-full object-cover" />
            <span id={`${inputId}-hint`} className="sr-only">
              {cadastroStrings.personal.avatarHint}
            </span>

            
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 rounded-b-full bg-black/60 px-3 py-1.5 text-xs text-white">
              <button type="button" onClick={handleRemove} className="underline">
                {cadastroStrings.personal.removeAvatar}
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="underline">
                {cadastroStrings.personal.cropCta}
              </button>
            </div>
          </div>
        ) : (
       
          <div className="flex h-full w-full items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-muted text-muted">
              <svg viewBox="0 0 40 40" className="h-10 w-10" fill="currentColor" aria-hidden="true">
                <circle cx="20" cy="14" r="8" />
                <path d="M4 34c3-8.5 9-13 16-13s13 4.5 16 13" />
                <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span id={`${inputId}-hint`} className="sr-only">
              {cadastroStrings.personal.avatarHint}
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
          className="sr-only"
        />
      </div>

      {cropSource ? (
        <AvatarCropper
          source={cropSource.url}
          fileName={cropSource.fileName}
          mimeType={cropSource.mimeType}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      ) : null}
    </div>
  );
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
