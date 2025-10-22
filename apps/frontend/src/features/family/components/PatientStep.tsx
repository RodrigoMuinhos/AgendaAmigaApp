import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { MemberCard } from './MemberCard';
import type { FamilyFormValues } from '../utils/familyFormSchema';

type PatientStepProps = {
  form: UseFormReturn<FamilyFormValues>;
  membersArray: UseFieldArrayReturn<FamilyFormValues, 'members'>;
  easyMode: boolean;
  removeLabel: string;
  t: (key: string) => string;
};

export function PatientStep({ form, membersArray, easyMode, removeLabel, t }: PatientStepProps) {
  if (!membersArray.fields.length) {
    return null;
  }

  return (
    <MemberCard
      index={0}
      form={form}
      easyMode={easyMode}
      canRemove={false}
      onRemove={() => undefined}
      removeLabel={removeLabel}
      t={t}
      mode="general"
    />
  );
}


