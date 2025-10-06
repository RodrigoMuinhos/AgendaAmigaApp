import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import type { ChildProfileFormValues } from "../schema";
import { cadastroStrings } from "../strings";
import { EmptyState, FormFieldWrapper, RemoveButton, SectionCard } from "./SectionHelpers";
import { useToast } from "../../../../components/Toast";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export function AttachmentsNotesSection() {
  const { register, watch, setValue, formState } = useFormContext<ChildProfileFormValues>();
  const { pushToast } = useToast();
  const anexosExistentes = (watch("anexos") as ChildProfileFormValues["anexos"]) ?? [];
  const anexosUploads = (watch("anexosUploads") as File[]) ?? [];

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      const valid: File[] = [];
      files.forEach((file) => {
        if (file.size > MAX_ATTACHMENT_SIZE) {
          pushToast({ title: "Arquivo muito grande", description: file.name, variant: "danger" });
        } else if (!ACCEPTED_TYPES.has(file.type)) {
          pushToast({ title: "Formato não suportado", description: file.name, variant: "danger" });
        } else {
          valid.push(file);
        }
      });
      if (valid.length > 0) {
        setValue("anexosUploads", [...anexosUploads, ...valid], { shouldDirty: true });
      }
      event.target.value = "";
    },
    [anexosUploads, pushToast, setValue],
  );

  const removePending = useCallback(
    (index: number) => {
      const next = anexosUploads.filter((file, currentIndex) => currentIndex !== index);
      setValue("anexosUploads", next, { shouldDirty: true });
    },
    [anexosUploads, setValue],
  );

  const removeExisting = useCallback(
    (index: number) => {
      const next = anexosExistentes.filter((item, currentIndex) => currentIndex !== index);
      setValue("anexos", next, { shouldDirty: true });
    },
    [anexosExistentes, setValue],
  );

  return (
    <div className="space-y-6">
      <SectionCard title={cadastroStrings.attachments.uploadTitle}>
        <div className="space-y-4">
          <label className="flex w-full cursor-pointer flex-col gap-2 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground shadow-soft transition hover:border-primary/60 focus-within:border-primary/60">
            <span className="font-semibold">Selecionar arquivos</span>
            <span className="text-xs text-muted">{cadastroStrings.attachments.uploadHint}</span>
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleUpload} className="sr-only" />
          </label>
          <div className="space-y-3">
            <AttachmentList
              title="Anexos selecionados"
              emptyLabel="Nenhum anexo novo"
              items={anexosUploads.map((file) => ({ id: file.name, label: file.name, size: file.size }))}
              onRemove={removePending}
            />
            <AttachmentList
              title="Anexos já enviados"
              emptyLabel="Nenhum anexo existente"
              items={anexosExistentes.map((anexo, index) => ({ id: `${anexo.url}-${index}`, label: anexo.name, size: anexo.size }))}
              onRemove={removeExisting}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title={cadastroStrings.attachments.notesLabel}>
        <FormFieldWrapper label={cadastroStrings.attachments.notesLabel} error={formState.errors.observacoesGerais?.message}>
          <textarea
            {...register("observacoesGerais")}
            rows={5}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            maxLength={2000}
          />
        </FormFieldWrapper>
        <label className="flex items-start gap-2 text-sm text-foreground">
          <input type="checkbox" {...register("consentimentoLGPD")} className="mt-1 h-4 w-4 rounded border-border/70" />
          <span>{cadastroStrings.attachments.consentLabel}</span>
        </label>
        {formState.errors.consentimentoLGPD?.message ? (
          <p className="text-xs font-semibold text-danger" role="alert">
            {formState.errors.consentimentoLGPD.message}
          </p>
        ) : null}
      </SectionCard>
    </div>
  );
}

type AttachmentListProps = {
  title: string;
  emptyLabel: string;
  items: { id: string; label: string; size?: number }[];
  onRemove: (index: number) => void;
};

function AttachmentList({ title, emptyLabel, items, onRemove }: AttachmentListProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {items.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <ul className="space-y-2 text-sm text-muted">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{item.label}</span>
                {item.size ? <span className="text-xs">{formatSize(item.size)}</span> : null}
              </div>
              <RemoveButton onClick={() => onRemove(index)} label="Remover" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return "-";
  }
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value > 9 ? 0 : 1)} ${units[exponent]}`;
}
