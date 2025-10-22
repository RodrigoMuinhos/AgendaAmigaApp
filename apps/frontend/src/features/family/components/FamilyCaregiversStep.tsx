import { Plus, Trash2 } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { FamilyFormValues } from '../utils/familyFormSchema';
import { WizardField } from './WizardField';

type FamilyCaregiversStepProps = {
  form: UseFormReturn<FamilyFormValues>;
  caregiversArray: UseFieldArrayReturn<FamilyFormValues, 'caregivers'>;
  easyMode: boolean;
  removeLabel: string;
  t: TFunction;
};

export function FamilyCaregiversStep({
  form,
  caregiversArray,
  easyMode,
  removeLabel,
  t,
}: FamilyCaregiversStepProps) {
  return (
    <div className="space-y-4">
      {caregiversArray.fields.map((field, index) => (
        <div
          key={field.id ?? index}
          className="grid gap-4 rounded-3xl border border-[rgb(var(--color-border))] p-4 md:grid-cols-3 md:items-end"
        >
          <WizardField
            label={t('family.form.caregiverFields.name')}
            error={form.formState.errors.caregivers?.[index]?.name ? t('validation.required') : undefined}
            className="md:col-span-1"
          >
            <Input {...form.register(`caregivers.${index}.name` as const)} required />
          </WizardField>

          {!easyMode ? (
            <WizardField label={t('family.form.caregiverFields.relation')}>
              <Input {...form.register(`caregivers.${index}.relation` as const)} />
            </WizardField>
          ) : null}

          <WizardField label={t('family.form.caregiverFields.phone')}>
            <Input {...form.register(`caregivers.${index}.phone` as const)} inputMode="tel" />
          </WizardField>

          {caregiversArray.fields.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => caregiversArray.remove(index)}
              className="md:col-span-3 md:justify-self-end"
            >
              <Trash2 className="h-5 w-5" aria-hidden />
              {removeLabel}
            </Button>
          ) : null}
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => caregiversArray.append({ name: '', relation: '', phone: '' })}
      >
        <Plus className="h-5 w-5" aria-hidden />
        {t('family.form.addCaregiver')}
      </Button>
    </div>
  );
}
