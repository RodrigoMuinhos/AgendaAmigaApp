import { useEffect } from 'react';
import type { TFunction } from 'i18next';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import InputMask from 'react-input-mask';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import type { FamilyFormValues } from '../utils/familyFormSchema';
import { WizardField } from './WizardField';

type FamilyAddressStepProps = {
  form: UseFormReturn<FamilyFormValues>;
  t: TFunction;
};

const caregiverRelationshipOptions = [
  { value: 'mae', label: 'Mae' },
  { value: 'pai', label: 'Pai' },
  { value: 'avo', label: 'Avo/Avo' },
  { value: 'tutor', label: 'Responsavel legal' },
  { value: 'outro', label: 'Outro vinculo' },
];

const careFocusOptions = [
  { value: 'seguimento-medico', label: 'Consultas e seguimento medico' },
  { value: 'reabilitacao', label: 'Reabilitacao e terapias' },
  { value: 'medicamentos', label: 'Gestao de medicamentos' },
  { value: 'rede-apoio', label: 'Articulacao com rede de apoio' },
  { value: 'outro', label: 'Outro foco' },
];

export function FamilyAddressStep({ form, t }: FamilyAddressStepProps) {
  const caregiverRelationship = useWatch({
    control: form.control,
    name: 'primaryCaregiverRelationship',
  }) as string | undefined;

  const careFocus = useWatch({
    control: form.control,
    name: 'careFocus',
  }) as string | undefined;

  useEffect(() => {
    if (caregiverRelationship !== 'outro' && form.getValues('primaryCaregiverRelationshipDetail')) {
      form.setValue('primaryCaregiverRelationshipDetail', '', { shouldDirty: true, shouldTouch: true });
    }

    if (careFocus !== 'outro' && form.getValues('notes')) {
      form.setValue('notes', '', { shouldDirty: true, shouldTouch: true });
    }
  }, [careFocus, caregiverRelationship, form]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <WizardField
        label={t('family.form.fields.postalCode', 'CEP')}
        error={form.formState.errors.postalCode?.message}
      >
        <Controller
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <InputMask
              mask="99999-999"
              maskChar={null}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  ref={field.ref}
                  inputMode="numeric"
                  placeholder="00000-000"
                />
              )}
            </InputMask>
          )}
        />
      </WizardField>

      <WizardField label={t('family.form.fields.address', 'Endereco completo')} className="md:col-span-2">
        <Input {...form.register('address')} placeholder="Rua, numero e complemento" />
      </WizardField>

      <WizardField label={t('family.form.fields.neighborhood', 'Bairro')}>
        <Input {...form.register('neighborhood')} />
      </WizardField>

      <WizardField label={t('family.form.fields.city', 'Cidade')}>
        <Input {...form.register('city')} />
      </WizardField>

      <WizardField label={t('family.form.fields.state', 'Estado')}>
        <Input {...form.register('state')} maxLength={2} placeholder="UF" />
      </WizardField>

      <WizardField label={t('family.form.fields.primaryCaregiver', 'Nome do responsavel principal')}>
        <Input {...form.register('primaryCaregiver')} placeholder="Quem responde pelo paciente" />
      </WizardField>

      <WizardField label={t('family.form.fields.primaryCaregiverRelationship', 'Vinculo com o paciente')}>
        <Select {...form.register('primaryCaregiverRelationship')}>
          <option value="">{t('family.form.placeholders.selectOption', 'Selecione')}</option>
          {caregiverRelationshipOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </WizardField>

      {caregiverRelationship === 'outro' ? (
        <WizardField
          label={t('family.form.fields.primaryCaregiverRelationshipOther', 'Descreva o vinculo')}
          className="md:col-span-2"
        >
          <Input
            {...form.register('primaryCaregiverRelationshipDetail')}
            placeholder="Informe o vinculo do responsavel"
          />
        </WizardField>
      ) : null}

      <WizardField
        label={t('family.form.fields.caregiverPhone', 'Telefone do responsavel')}
        error={form.formState.errors.caregiverPhone?.message}
      >
        <Controller
          control={form.control}
          name="caregiverPhone"
          render={({ field }) => (
            <InputMask
              mask="(99) 99999-9999"
              maskChar={null}
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            >
              {(inputProps: any) => (
                <Input
                  {...inputProps}
                  ref={field.ref}
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                />
              )}
            </InputMask>
          )}
        />
      </WizardField>

      <WizardField
        label={t('family.form.fields.careFocus', 'Qual o foco principal deste acompanhamento?')}
        className="md:col-span-2"
      >
        <Select {...form.register('careFocus')}>
          <option value="">{t('family.form.placeholders.selectOption', 'Selecione')}</option>
          {careFocusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </WizardField>

      {careFocus === 'outro' ? (
        <WizardField
          label={t('family.form.fields.notes', 'Descreva o foco do cuidado')}
          className="md:col-span-2"
        >
          <Textarea rows={3} {...form.register('notes')} placeholder="Detalhe o que a equipe precisa saber" />
        </WizardField>
      ) : null}
    </div>
  );
}
