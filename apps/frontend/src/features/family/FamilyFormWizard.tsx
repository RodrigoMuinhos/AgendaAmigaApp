import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import type { Family } from '../../core/types/api';
import { createFamily } from '../../core/api/resources';
import {
  createEmptyMember,
  familyFormSchema,
  initialFamilyFormValues,
  type FamilyFormValues,
  type ViaCepResponse,
} from './utils/familyFormSchema';
import { FamilyAddressStep } from './components/FamilyAddressStep';
import { FamilyMembersStep } from './components/FamilyMembersStep';
import { FamilyCaregiversStep } from './components/FamilyCaregiversStep';
import { StepNavigation } from './components/StepNavigation';
import { WizardProgress } from './components/WizardProgress';

const careFocusLabelMap: Record<string, string> = {
  'seguimento-medico': 'Consultas e seguimento medico',
  reabilitacao: 'Reabilitacao e terapias',
  medicamentos: 'Gestao de medicamentos',
  'rede-apoio': 'Articulacao com rede de apoio',
  outro: 'Outro foco',
};

export function FamilyFormWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enabled: easyMode } = useEasyMode();

  const [step, setStep] = useState(0);
  const steps = [
    t('family.form.sections.address', 'Endereco e contato'),
    t('family.form.members', 'Membros da familia'),
    t('family.form.careTeam', 'Rede de cuidado'),
  ];

  const form = useForm<FamilyFormValues>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: initialFamilyFormValues,
    mode: 'onChange',
  });

  const postalCodeValue = form.watch('postalCode') ?? '';
  const lastFetchedCep = useRef<string>('');

  useEffect(() => {
    if (typeof fetch === 'undefined') return;
    const digits = (postalCodeValue || '').replace(/\D/g, '');

    if (digits.length !== 8) {
      if (!postalCodeValue) {
        form.clearErrors('postalCode');
      }
      lastFetchedCep.current = '';
      return;
    }

    if (lastFetchedCep.current === digits) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (!response.ok) throw new Error('CEP lookup failed');
        const data = (await response.json()) as ViaCepResponse;
        if (data.erro) throw new Error('CEP not found');
        if (cancelled) return;

        lastFetchedCep.current = digits;
        const cepResponseValue = data.cep ?? postalCodeValue;
        if (cepResponseValue) {
          form.setValue('postalCode', cepResponseValue, { shouldDirty: false, shouldTouch: true });
        }
        form.clearErrors('postalCode');

        const applyIfPristine = (field: keyof FamilyFormValues, value?: string | null) => {
          if (!value) return;
          const state = form.getFieldState(field);
          if (!state.isDirty) {
            form.setValue(field, value, { shouldDirty: false, shouldTouch: true });
          }
        };

        applyIfPristine('address', data.logradouro ?? null);
        applyIfPristine('neighborhood', data.bairro ?? null);
        applyIfPristine('city', data.localidade ?? null);
        applyIfPristine('state', data.uf ?? null);
      } catch (error) {
        if (cancelled) return;
        lastFetchedCep.current = '';
        form.setError('postalCode', { type: 'manual', message: t('validation.invalidPostalCode') });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form, postalCodeValue, t]);

  const membersArray = useFieldArray({ control: form.control, name: 'members' });
  useEffect(() => {
    if (membersArray.fields.length === 0) {
      membersArray.append(createEmptyMember());
    }
  }, [membersArray]);

  const caregiversArray = useFieldArray({ control: form.control, name: 'caregivers' });

  const mutation = useMutation({
    mutationFn: (values: FamilyFormValues) => {
      const sanitize = (value?: string) => (value && value.trim().length ? value.trim() : undefined);
      const onlyDigits = (value?: string) => {
        const trimmed = sanitize(value);
        return trimmed ? trimmed.replace(/\D/g, '') : undefined;
      };
      const caregiverRelationshipValue =
        values.primaryCaregiverRelationship === 'outro'
          ? sanitize(values.primaryCaregiverRelationshipDetail) ?? 'Outro vinculo'
          : sanitize(values.primaryCaregiverRelationship);
      const careFocusLabel = values.careFocus ? careFocusLabelMap[values.careFocus] ?? values.careFocus : undefined;
      const fallbackName =
        sanitize(values.primaryCaregiver) || sanitize(values.caregivers[0]?.name) || t('family.form.defaultName');

      const payload: Omit<Family, 'id'> = {
        name: fallbackName!,
        postalCode: sanitize(values.postalCode?.replace(/\D/g, '')),
        address: sanitize(values.address),
        neighborhood: sanitize(values.neighborhood),
        city: sanitize(values.city),
        state: sanitize(values.state),
        primaryCaregiver: sanitize(values.primaryCaregiver),
        primaryCaregiverRelationship: caregiverRelationshipValue,
        contact: onlyDigits(values.caregiverPhone),
        caregiverPhone: sanitize(values.caregiverPhone),
        careFocus: sanitize(careFocusLabel),
        notes: sanitize(values.notes),
        members: values.members.map((member) => ({
          id: (globalThis as any).crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
          name: member.name,
          birthdate: member.birthdate,
          document: sanitize(member.document?.replace(/\D/g, '')),
          postalCode: sanitize(member.postalCode?.replace(/\D/g, '')),
          addressNumber: sanitize(member.addressNumber),
          address: sanitize(member.address),
          neighborhood: sanitize(member.neighborhood),
          city: sanitize(member.city),
          state: sanitize(member.state),
          avatar: sanitize(member.avatar),
          needs: sanitize(member.needs),
        })),
        caregivers: values.caregivers.map((caregiver) => ({
          id: (globalThis as any).crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
          name: caregiver.name,
          relation: sanitize(caregiver.relation),
          phone: onlyDigits(caregiver.phone),
        })),
      };

      return createFamily(payload);
    },
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['families'] });
      } finally {
        navigate('/family');
      }
    },
  });

  const onSubmit = (values: FamilyFormValues) => mutation.mutate(values);
  const removeLabel = t('common.delete');

  const goNext = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const goPrev = () => setStep((current) => Math.max(current - 1, 0));

  const handleAddMember = () => membersArray.append(createEmptyMember());

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">{t('family.form.title')}</h1>
        {easyMode ? (
          <p className="mt-2 rounded-full bg-[rgba(30,136,229,0.15)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
            {t('app.easyModeDescription')}
          </p>
        ) : null}
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <WizardProgress steps={steps} currentStep={step} />

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{steps[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <FamilyAddressStep form={form} t={t} />
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>{steps[1]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FamilyMembersStep
                form={form}
                membersArray={membersArray}
                easyMode={easyMode}
                removeLabel={removeLabel}
                onAddMember={handleAddMember}
                t={t}
              />
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>{steps[2]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FamilyCaregiversStep
                form={form}
                caregiversArray={caregiversArray}
                easyMode={easyMode}
                removeLabel={removeLabel}
                t={t}
              />
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/family')}>
            {t('common.cancel')}
          </Button>
          <StepNavigation
            currentStep={step}
            totalSteps={steps.length}
            onNext={goNext}
            onPrev={goPrev}
            isSubmitting={mutation.isPending}
            isLastStep={step === steps.length - 1}
            t={t}
          />
        </div>
      </form>
    </section>
  );
}

export default FamilyFormWizard;
