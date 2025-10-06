import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cadastroStrings } from "./strings";
import type { ChildProfile } from "./types";
import {
  childProfileSchema,
  type ChildProfileFormValues,
  stepFieldPaths,
} from "./schema";
import { defaultProfileValues, mapFormToDto } from "./formDefaults";
import { uploadAttachment, uploadAvatar, createFamilyProfile } from "./api";
import { PersonalInfoSection } from "./sections/PersonalInfo";
import { MedicalInfoSection } from "./sections/MedicalInfo";
import { ContactsGuardiansSection } from "./sections/ContactsGuardians";
import { InsuranceDocsSection } from "./sections/InsuranceDocs";
import { RoutineSchoolSection } from "./sections/RoutineSchool";
import { AttachmentsNotesSection } from "./sections/AttachmentsNotes";
import { useToast } from "../../../components/Toast";

const steps = [
  cadastroStrings.steps.personal,
  cadastroStrings.steps.medical,
  cadastroStrings.steps.contacts,
  cadastroStrings.steps.insurance,
  cadastroStrings.steps.routine,
  cadastroStrings.steps.attachments,
];

type FamilyFormProps = {
  onCancel: () => void;
  onSuccess?: (profile: ChildProfile) => void;
};

export function FamilyForm({ onCancel, onSuccess }: FamilyFormProps) {
  const form = useForm<ChildProfileFormValues>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: defaultProfileValues,
    mode: "onChange",
  });
  const { handleSubmit, trigger, reset, formState } = form;
  const { isSubmitting } = formState;
  const { pushToast } = useToast();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const progress = useMemo(() => ((activeStepIndex + 1) / steps.length) * 100, [activeStepIndex]);

  const goToStep = useCallback((index: number) => {
    setActiveStepIndex(Math.min(Math.max(index, 0), steps.length - 1));
  }, []);

  const validateCurrentStep = useCallback(async () => {
    const current = steps[activeStepIndex];
    const fields = stepFieldPaths[current.id] ?? [];
    const result = await trigger(fields as (keyof ChildProfileFormValues)[], {
      shouldFocus: true,
    });
    return result;
  }, [activeStepIndex, trigger]);

  const handleNext = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (valid) {
      goToStep(activeStepIndex + 1);
    }
  }, [activeStepIndex, goToStep, validateCurrentStep]);

  const handleBack = useCallback(() => {
    goToStep(activeStepIndex - 1);
  }, [activeStepIndex, goToStep]);

  const handleFormSubmit = handleSubmit(async (values: ChildProfileFormValues) => {
    try {
      const validated = await validateCurrentStep();
      if (!validated) {
        return;
      }
      let avatarUrl = values.avatarUrl;
      if (values.avatarFile instanceof File) {
        const avatarResult = await uploadAvatar(values.avatarFile);
        avatarUrl = avatarResult.url;
      }

      let frenteUrl = values.convenio?.frenteUrl;
      if (values.carteirinhaFrenteFile instanceof File) {
        const upload = await uploadAttachment(values.carteirinhaFrenteFile);
        frenteUrl = upload.url;
      }
      let versoUrl = values.convenio?.versoUrl;
      if (values.carteirinhaVersoFile instanceof File) {
        const upload = await uploadAttachment(values.carteirinhaVersoFile);
        versoUrl = upload.url;
      }

      const convenioPayload =
        values.temConvenio && values.convenio
          ? {
              ...values.convenio,
              frenteUrl,
              versoUrl,
            }
          : undefined;

      const attachments: typeof values.anexos = [...(values.anexos ?? [])];
      const pendingFiles: File[] = [];
      if (Array.isArray(values.documentosFiles)) {
        for (const file of values.documentosFiles) {
          if (file instanceof File) {
            pendingFiles.push(file);
          }
        }
      }
      if (Array.isArray(values.anexosUploads)) {
        for (const file of values.anexosUploads) {
          if (file instanceof File) {
            pendingFiles.push(file);
          }
        }
      }
      for (const file of pendingFiles) {
        const upload = await uploadAttachment(file);
        attachments.push(upload);
      }

      const normalized: ChildProfileFormValues = {
        ...values,
        avatarUrl,
        anexos: attachments,
        anexosUploads: [],
        carteirinhaFrenteFile: undefined,
        carteirinhaVersoFile: undefined,
        documentosFiles: [],
        avatarFile: undefined,
        convenio: convenioPayload,
      };

      const payload = mapFormToDto(normalized);
      const profile = await createFamilyProfile(payload);
      pushToast({ title: cadastroStrings.messages.created, variant: "success" });
      onSuccess?.(profile);
      reset(defaultProfileValues);
      setActiveStepIndex(0);
    } catch (error) {
      pushToast({
        title: cadastroStrings.messages.createError,
        description: error instanceof Error ? error.message : undefined,
        variant: "danger",
      });
    }
  });

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-6" onSubmit={handleFormSubmit}>
        <header className="space-y-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 text-sm font-medium text-muted">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  index === activeStepIndex
                    ? "bg-primary/15 text-primary"
                    : index < activeStepIndex
                    ? "bg-success/15 text-success"
                    : "bg-muted/15 text-muted"
                }`}
                onClick={() => goToStep(index)}
                aria-current={index === activeStepIndex}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {index + 1}
                </span>
                <span>{step.title}</span>
              </button>
            ))}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <section className="space-y-6">
          {activeStepIndex === 0 && <PersonalInfoSection />}
          {activeStepIndex === 1 && <MedicalInfoSection />}
          {activeStepIndex === 2 && <ContactsGuardiansSection />}
          {activeStepIndex === 3 && <InsuranceDocsSection />}
          {activeStepIndex === 4 && <RoutineSchoolSection />}
          {activeStepIndex === 5 && <AttachmentsNotesSection />}
        </section>

        <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-inner">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-border/70 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-border/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {cadastroStrings.modal.cancel}
            </button>
            {activeStepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-border/70 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-border/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {cadastroStrings.modal.back}
              </button>
            )}
          </div>
          {activeStepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => void handleNext()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {cadastroStrings.modal.next}
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-success/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-success/60 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />}
              <span>{cadastroStrings.modal.save}</span>
            </button>
          )}
        </footer>
      </form>
    </FormProvider>
  );
}





