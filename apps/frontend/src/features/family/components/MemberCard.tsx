import type { TFunction } from 'i18next';
import { useEffect, useRef } from 'react';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { MaskedInput } from '../../../components/ui/masked-input';
import type { FamilyFormValues, ViaCepResponse } from '../utils/familyFormSchema';
import { AvatarPicker } from './AvatarPicker';
import { WizardField } from './WizardField';

type MemberCardProps = {
  index: number;
  form: UseFormReturn<FamilyFormValues>;
  easyMode: boolean;
  canRemove: boolean;
  onRemove: () => void;
  removeLabel: string;
  t: TFunction;
};

export function MemberCard({
  index,
  form,
  easyMode,
  canRemove,
  onRemove,
  removeLabel,
  t,
}: MemberCardProps) {
  const { control, register, setValue, getFieldState, formState, clearErrors, setError } = form;
  const errors = formState.errors.members?.[index];

  const postalCodeValue = useWatch({ control, name: `members.${index}.postalCode` as const }) ?? '';
  const addressValue = useWatch({ control, name: `members.${index}.address` as const }) ?? '';
  const neighborhoodValue = useWatch({ control, name: `members.${index}.neighborhood` as const }) ?? '';
  const cityValue = useWatch({ control, name: `members.${index}.city` as const }) ?? '';
  const stateValue = useWatch({ control, name: `members.${index}.state` as const }) ?? '';
  const showAddressDetails = Boolean(addressValue || neighborhoodValue || cityValue || stateValue);
  const lastFetchedCep = useRef('');

  useEffect(() => {
    if (typeof fetch === 'undefined') return;
    const digits = (postalCodeValue || '').replace(/\D/g, '');

    if (digits.length !== 8) {
      if (!postalCodeValue) {
        clearErrors(`members.${index}.postalCode` as const);
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
        const cepValue = data.cep ?? postalCodeValue;
        if (cepValue) {
          setValue(`members.${index}.postalCode` as const, cepValue, {
            shouldDirty: false,
            shouldTouch: true,
          });
        }
        clearErrors(`members.${index}.postalCode` as const);

        const applyIfPristine = (
          field: keyof FamilyFormValues['members'][number],
          value?: string | null,
        ) => {
          if (!value) return;
          const state = getFieldState(`members.${index}.${field}` as const);
          if (!state.isDirty) {
            setValue(`members.${index}.${field}` as const, value, {
              shouldDirty: false,
              shouldTouch: true,
            });
          }
        };

        applyIfPristine('address', data.logradouro ?? null);
        applyIfPristine('neighborhood', data.bairro ?? null);
        applyIfPristine('city', data.localidade ?? null);
        applyIfPristine('state', data.uf ?? null);
      } catch (error) {
        if (cancelled) return;
        lastFetchedCep.current = '';
        clearErrors(`members.${index}.postalCode` as const);
        setError(`members.${index}.postalCode` as const, {
          type: 'manual',
          message: t('validation.invalidPostalCode'),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clearErrors, getFieldState, index, postalCodeValue, setError, setValue, t]);

  return (
    <div className="space-y-4 rounded-3xl border border-[rgb(var(--color-border))] p-4">
      <div className="grid gap-4 md:grid-cols-[auto,1fr] md:items-start md:gap-6">
        <Controller
          control={control}
          name={`members.${index}.avatar` as const}
          render={({ field }) => (
            <AvatarPicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              addLabel={t('family.form.memberFields.addAvatar')}
              changeLabel={t('family.form.memberFields.changeAvatar')}
              removeLabel={t('family.form.memberFields.removeAvatar')}
            />
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <WizardField
            label={t('family.form.memberFields.name')}
            error={errors?.name ? t('validation.required') : undefined}
            className="md:col-span-2"
          >
            <Input {...register(`members.${index}.name` as const)} required />
          </WizardField>

          <WizardField
            label={t('family.form.memberFields.birthdate')}
            error={errors?.birthdate ? t('validation.required') : undefined}
          >
            <Input type="date" {...register(`members.${index}.birthdate` as const)} required />
          </WizardField>

          <WizardField label={t('family.form.memberFields.document')}>
            <Controller
              control={control}
              name={`members.${index}.document` as const}
              render={({ field }) => (
                <MaskedInput
                  mask="999.999.999-99"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      ref={field.ref}
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                    />
                  )}
                </MaskedInput>
              )}
            />
          </WizardField>

          <WizardField label={t('family.form.memberFields.postalCode')}>
            <Controller
              control={control}
              name={`members.${index}.postalCode` as const}
              render={({ field }) => (
                <MaskedInput
                  mask="99999-999"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      ref={field.ref}
                      inputMode="numeric"
                      placeholder="00000-000"
                    />
                  )}
                </MaskedInput>
              )}
            />
          </WizardField>

          <WizardField label={t('family.form.memberFields.addressNumber')}>
            <Input {...register(`members.${index}.addressNumber` as const)} inputMode="numeric" />
          </WizardField>

          {showAddressDetails ? (
            <>
              <WizardField label={t('family.form.memberFields.address')} className="md:col-span-2">
                <Input {...register(`members.${index}.address` as const)} />
              </WizardField>
              <WizardField label={t('family.form.memberFields.neighborhood')}>
                <Input {...register(`members.${index}.neighborhood` as const)} />
              </WizardField>
              <WizardField label={t('family.form.memberFields.city')}>
                <Input {...register(`members.${index}.city` as const)} />
              </WizardField>
              <WizardField label={t('family.form.memberFields.state')}>
                <Input {...register(`members.${index}.state` as const)} />
              </WizardField>
            </>
          ) : null}

          {!easyMode ? (
            <WizardField label={t('family.form.memberFields.needs')} className="md:col-span-2">
              <Textarea rows={2} {...register(`members.${index}.needs` as const)} />
            </WizardField>
          ) : null}
        </div>
      </div>

      {canRemove ? (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-5 w-5" aria-hidden />
            {removeLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

