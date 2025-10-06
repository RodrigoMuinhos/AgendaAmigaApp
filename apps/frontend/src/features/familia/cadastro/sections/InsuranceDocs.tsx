import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { ChildProfileFormValues } from "../schema";
import { cadastroStrings } from "../strings";
import { FormFieldWrapper, SectionCard } from "./SectionHelpers";

const acceptedDocs = ".jpg,.jpeg,.png,.pdf";

export function InsuranceDocsSection() {
  const { register, watch, setValue, formState } = useFormContext<ChildProfileFormValues>();
  const temConvenio = watch("temConvenio");
  const frontFile = watch("carteirinhaFrenteFile") as File | undefined;
  const backFile = watch("carteirinhaVersoFile") as File | undefined;
  const documents = (watch("documentosFiles") as File[]) ?? [];

  useEffect(() => {
    if (!temConvenio) {
      setValue("convenio", undefined, { shouldDirty: true });
      setValue("carteirinhaFrenteFile", undefined, { shouldDirty: true });
      setValue("carteirinhaVersoFile", undefined, { shouldDirty: true });
      setValue("documentosFiles", [], { shouldDirty: true });
    }
  }, [setValue, temConvenio]);
  const handleFile = useCallback(
    (field: "carteirinhaFrenteFile" | "carteirinhaVersoFile") =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          setValue(field, file, { shouldDirty: true });
        }
        event.target.value = "";
      },
    [setValue],
  );

  const handleDocuments = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files ? Array.from(event.target.files) : [];
      if (files.length > 0) {
        setValue("documentosFiles", files, { shouldDirty: true });
      }
      event.target.value = "";
    },
    [setValue],
  );

  return (
    <div className="space-y-6">
      <SectionCard title={cadastroStrings.insurance.hasInsuranceLabel}>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input type="checkbox" {...register("temConvenio")} className="h-4 w-4 rounded border-border/70" />
          <span>{temConvenio ? "Com convênio ativo" : "Sem convênio"}</span>
        </label>
      </SectionCard>

      {temConvenio ? (
        <SectionCard title={cadastroStrings.insurance.providerLabel}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormFieldWrapper label={cadastroStrings.insurance.providerLabel} error={formState.errors.convenio?.operadora?.message}>
              <input
                {...register("convenio.operadora")}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={cadastroStrings.insurance.cardNumberLabel} error={formState.errors.convenio?.numeroCarteirinha?.message}>
              <input
                {...register("convenio.numeroCarteirinha")}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={cadastroStrings.insurance.validadeLabel} error={formState.errors.convenio?.validade?.message}>
              <input
                {...register("convenio.validade")}
                type="date"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </FormFieldWrapper>
            <FormFieldWrapper label={cadastroStrings.insurance.planLabel} error={formState.errors.convenio?.plano?.message}>
              <input
                {...register("convenio.plano")}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </FormFieldWrapper>
          </div>
        </SectionCard>
      ) : null}

      {temConvenio ? (
        <SectionCard title={cadastroStrings.insurance.cardUploadTitle}>
          <div className="grid gap-4 md:grid-cols-2">
            <UploadField
              label="Frente"
              file={frontFile}
              error={formState.errors.carteirinhaFrenteFile?.message as string | undefined}
              onSelect={handleFile("carteirinhaFrenteFile")}
            />
            <UploadField
              label="Verso"
              file={backFile}
              error={formState.errors.carteirinhaVersoFile?.message as string | undefined}
              onSelect={handleFile("carteirinhaVersoFile")}
            />
          </div>
          <p className="text-xs text-muted">{cadastroStrings.insurance.uploadHint}</p>
        </SectionCard>
      ) : null}

      <SectionCard title={cadastroStrings.insurance.docUploadTitle}>
        <div className="space-y-3">
          <label className="flex w-full cursor-pointer flex-col gap-2 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground shadow-soft transition hover:border-primary/60 focus-within:border-primary/60">
            <span className="font-semibold">Selecionar arquivos</span>
            <span className="text-xs text-muted">{cadastroStrings.insurance.uploadHint}</span>
            <input type="file" accept={acceptedDocs} multiple onChange={handleDocuments} className="sr-only" />
          </label>
          {documents.length ? (
            <ul className="space-y-2 text-sm text-muted">
              {documents.map((file) => (
                <li key={file.name} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2">
                  <span className="truncate" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-xs">{formatSize(file.size)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">Nenhum documento selecionado</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

type UploadFieldProps = {
  label: string;
  file?: File;
  error?: string;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function UploadField({ label, file, error, onSelect }: UploadFieldProps) {
  return (
    <FormFieldWrapper label={label} error={error}>
      <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground shadow-soft transition hover:border-primary/60 focus-within:border-primary/60">
        <span>{file ? file.name : "Selecionar arquivo"}</span>
        <span className="text-xs text-muted">{cadastroStrings.insurance.uploadHint}</span>
        <input type="file" accept={acceptedDocs} onChange={onSelect} className="sr-only" />
      </label>
      {file ? <span className="text-xs text-muted">{formatSize(file.size)}</span> : null}
    </FormFieldWrapper>
  );
}

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "-";
  }
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value > 9 ? 0 : 1)} ${units[exponent]}`;
}
