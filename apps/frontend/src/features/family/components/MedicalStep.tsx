import { Plus, Trash2 } from 'lucide-react';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import type { FamilyFormValues } from '../utils/familyFormSchema';
import { MemberCard } from './MemberCard';
import { WizardField } from './WizardField';

type MedicalStepProps = {
  form: UseFormReturn<FamilyFormValues>;
  membersArray: UseFieldArrayReturn<FamilyFormValues, 'members'>;
  caregiversArray: UseFieldArrayReturn<FamilyFormValues, 'caregivers'>;
  easyMode: boolean;
  onAddMember: () => void;
  removeLabel: string;
  t: (key: string) => string;
};

export function MedicalStep({
  form,
  membersArray,
  caregiversArray,
  easyMode,
  onAddMember,
  removeLabel,
  t,
}: MedicalStepProps) {
  return (
    <>
      <div className="space-y-4">
        {membersArray.fields.map((field, index) => (
          <MemberCard
            key={field.id}
            index={index}
            form={form}
            easyMode={easyMode}
            canRemove={index > 0}
            onRemove={() => membersArray.remove(index)}
            removeLabel={removeLabel}
            t={t}
            mode={index === 0 ? 'medical' : 'full'}
          />
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={onAddMember}>
          <Plus className="h-5 w-5" aria-hidden />
          {t('family.form.addMember')}
        </Button>
      </div>

      <div className="space-y-4 rounded-3xl border border-[rgb(var(--color-border))] p-4">
        <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">{t('family.form.careTeam')}</h3>
        {caregiversArray.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-4 rounded-2xl border border-[rgb(var(--color-border))] p-4 md:grid-cols-3 md:items-end"
          >
            <WizardField
              label={t('family.form.caregiverFields.name')}
              error={
                form.formState.errors.caregivers?.[index]?.name ? t('validation.required') : undefined
              }
            >
              <Input {...form.register(`caregivers.${index}.name` as const)} required />
            </WizardField>
            <WizardField label={t('family.form.caregiverFields.relation')}>
              <Input {...form.register(`caregivers.${index}.relation` as const)} />
            </WizardField>
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
    </>
  );
}


