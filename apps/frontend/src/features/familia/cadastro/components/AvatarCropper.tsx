import { useEffect, useMemo, useRef, useState } from "react";
import { cadastroStrings } from "../strings";

const CONTAINER_SIZE = 240;
const OUTPUT_SIZE = 512;

export type AvatarCropperResult = {
  file: File;
  previewUrl: string;
};

type AvatarCropperProps = {
  source: string;
  fileName: string;
  mimeType?: string;
  onCancel: () => void;
  onConfirm: (result: AvatarCropperResult) => void;
};

type Offset = {
  x: number;
  y: number;
};

type ImageDataState = {
  element: HTMLImageElement;
  baseScale: number;
};

export function AvatarCropper({ source, fileName, mimeType = "image/jpeg", onCancel, onConfirm }: AvatarCropperProps) {
  const [imageData, setImageData] = useState<ImageDataState | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; lastX: number; lastY: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const baseScale = Math.max(CONTAINER_SIZE / img.naturalWidth, CONTAINER_SIZE / img.naturalHeight);
      setImageData({ element: img, baseScale });
      setOffset({ x: 0, y: 0 });
    };
    img.src = source;
  }, [source]);

  const constraints = useMemo(() => {
    if (!imageData) {
      return { maxOffsetX: 0, maxOffsetY: 0, scaleFactor: 1 };
    }
    const scaleFactor = imageData.baseScale * zoom;
    const displayWidth = imageData.element.naturalWidth * scaleFactor;
    const displayHeight = imageData.element.naturalHeight * scaleFactor;
    const maxOffsetX = Math.max(0, (displayWidth - CONTAINER_SIZE) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - CONTAINER_SIZE) / 2);
    return { maxOffsetX, maxOffsetY, scaleFactor };
  }, [imageData, zoom]);

  useEffect(() => {
    setOffset((current) => clampOffset(current, constraints.maxOffsetX, constraints.maxOffsetY));
  }, [constraints.maxOffsetX, constraints.maxOffsetY]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageData) {
      return;
    }
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    setOffset((current) =>
      clampOffset(
        { x: current.x + dx, y: current.y + dy },
        constraints.maxOffsetX,
        constraints.maxOffsetY,
      ),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragRef.current = null;
    }
  };

  const handleConfirm = async () => {
    if (!imageData) {
      return;
    }
    const { element, baseScale } = imageData;
    const { scaleFactor } = constraints;
    const cropWidth = CONTAINER_SIZE / scaleFactor;
    const cropHeight = CONTAINER_SIZE / scaleFactor;
    const centerX = element.naturalWidth / 2;
    const centerY = element.naturalHeight / 2;
    const left = clamp(
      centerX - cropWidth / 2 - offset.x / scaleFactor,
      0,
      element.naturalWidth - cropWidth,
    );
    const top = clamp(
      centerY - cropHeight / 2 - offset.y / scaleFactor,
      0,
      element.naturalHeight - cropHeight,
    );

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.drawImage(element, left, top, cropWidth, cropHeight, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), mimeType, 0.9),
    );
    if (!blob) {
      return;
    }
    const finalFile = new File([blob], fileName.replace(/\.(png|jpe?g)$/i, ".jpg"), { type: mimeType });
    const previewUrl = URL.createObjectURL(blob);
    onConfirm({ file: finalFile, previewUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-3xl border border-border/60 bg-surface p-6 shadow-elevated">
        <header className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">{cadastroStrings.personal.cropTitle}</h2>
          <p className="text-sm text-muted">{cadastroStrings.personal.cropDescription}</p>
        </header>
        <div
          className="mx-auto flex h-[260px] w-[260px] items-center justify-center overflow-hidden rounded-2xl bg-muted/10"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {imageData ? (
            <img
              src={source}
              alt="Prï¿½-visualizaï¿½ï¿½o do recorte"
              className="pointer-events-none select-none"
              style={{
                width: imageData.element.naturalWidth * imageData.baseScale * zoom,
                height: imageData.element.naturalHeight * imageData.baseScale * zoom,
                transform: `translate(${offset.x}px, ${offset.y}px)` ,
              }}
              draggable={false}
            />
          ) : (
            <span className="text-sm text-muted">Carregandoï¿½</span>
          )}
        </div>
        <label className="mt-6 flex items-center gap-3 text-sm text-muted">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {cadastroStrings.personal.cropZoomLabel}
          </span>
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-primary"
          />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border/80 px-4 py-2 text-sm font-medium text-muted transition hover:border-primary hover:text-primary"
          >
            {cadastroStrings.personal.cropCancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover"
            disabled={!imageData}
          >
            {cadastroStrings.personal.cropConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampOffset(offset: Offset, maxX: number, maxY: number): Offset {
  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
}
