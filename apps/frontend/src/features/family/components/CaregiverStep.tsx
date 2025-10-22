import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import InputMask from 'react-input-mask';
import type { FamilyFormValues } from '../FamilyFormWizard';
import { WizardField } from './WizardField';

type CaregiverStepProps = {
  form: UseFormReturn<FamilyFormValues>;
  postalCodeValue: string;
  postalCodeRef: (element: HTMLInputElement | null) => void;
  postalCodeName: string;
  postalCodeOnBlur: () => void;
  onPostalCodeChange: (value: string) => void;
  t: (key: string) => string;
};

export function CaregiverStep({
  form,
  postalCodeValue,
  postalCodeRef,
  postalCodeName,
  postalCodeOnBlur,
  onPostalCodeChange,
  t,
}: CaregiverStepProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <WizardField label={t('family.form.fields.postalCode')} error={form.formState.errors.postalCode?.message}>
        <Input
          ref={postalCodeRef}
          name={postalCodeName}
          autoComplete="postal-code"
          value={postalCodeValue}
          inputMode="numeric"
          maxLength={9}
          placeholder="00000-000"
          onBlur={postalCodeOnBlur}
          onChange={(event) => onPostalCodeChange(event.target.value)}
        />
      </WizardField>

      <WizardField label={t('family.form.fields.address')} className="md:col-span-2">
        <Input {...form.register('address')} />
      </WizardField>

      <WizardField label={t('family.form.fields.neighborhood')}>
        <Input {...form.register('neighborhood')} />
      </WizardField>

      <WizardField label={t('family.form.fields.city')}>
        <Input {...form.register('city')} />
      </WizardField>

      <WizardField label={t('family.form.fields.state')}>
        <Input {...form.register('state')} />
      </WizardField>

      <WizardField label={t('family.form.fields.primaryCaregiver')}>
        <Input {...form.register('primaryCaregiver')} />
      </WizardField>

      <WizardField
        label={t('family.form.fields.caregiverPhone')}
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

      <WizardField label={t('family.form.fields.notes')} className="md:col-span-2">
        <Textarea rows={3} {...form.register('notes')} />
      </WizardField>
    </div>
  );
}

