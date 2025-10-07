import { Controller, useFormContext } from "react-hook-form";
import InputMask from "react-input-mask";
import type { ChildProfileFormValues } from "../schema";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  inputClassName?: string;
};

const defaultInputClass = "w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

export default function PhoneField({
  name,
  label,
  placeholder = "(99) 99999-9999",
  inputClassName = defaultInputClass,
}: Props) {
  const methods = useFormContext<ChildProfileFormValues>();

  if (!methods?.control) {
    console.error("PhoneField must be used within a FormProvider.");
    return null;
  }

  const { control } = methods;

  return (
    <Controller
      control={control}
      name={name as any}
      render={({ field, fieldState }) => (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <InputMask
            mask="(99) 99999-9999"
            maskChar=""
            value={field.value ?? ""}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
          >
            {(inputProps) => (
              <input
                {...inputProps}
                ref={field.ref}
                type="tel"
                className={inputClassName}
                placeholder={placeholder}
                aria-invalid={fieldState.invalid}
              />
            )}
          </InputMask>
          {fieldState.error ? (
            <span className="text-xs font-medium text-danger" role="alert">
              {fieldState.error.message}
            </span>
          ) : null}
        </label>
      )}
    />
  );
}