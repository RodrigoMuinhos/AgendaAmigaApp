import { Plus } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import type { FamilyFormValues } from '../utils/familyFormSchema';
import { MemberCard } from './MemberCard';

type FamilyMembersStepProps = {
  form: UseFormReturn<FamilyFormValues>;
  membersArray: UseFieldArrayReturn<FamilyFormValues, 'members'>;
  easyMode: boolean;
  removeLabel: string;
  onAddMember: () => void;
  t: TFunction;
};

export function FamilyMembersStep({
  form,
  membersArray,
  easyMode,
  removeLabel,
  onAddMember,
  t,
}: FamilyMembersStepProps) {
  return (
    <div className="space-y-4">
      {membersArray.fields.map((field, index) => (
        <MemberCard
          key={field.id ?? index}
          index={index}
          form={form}
          easyMode={easyMode}
          canRemove={membersArray.fields.length > 1}
          onRemove={() => membersArray.remove(index)}
          removeLabel={removeLabel}
          t={t}
        />
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={onAddMember}>
        <Plus className="h-5 w-5" aria-hidden />
        {t('family.form.addMember')}
      </Button>
    </div>
  );
}
