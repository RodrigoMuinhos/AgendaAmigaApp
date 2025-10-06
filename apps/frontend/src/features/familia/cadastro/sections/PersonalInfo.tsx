import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { AvatarUploader } from "../components/AvatarUploader";
import { cadastroStrings } from "../strings";
import type { ChildProfileFormValues } from "../schema";
import { useToast } from "../../../../components/Toast";

const sexoOptions = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "intersexo", label: "Intersexo" },
  { value: "outro", label: "Outro" },
];

const pronomeOptions = [
  { value: "ele/dele", label: "ele/deles" },
  { value: "ela/dela", label: "ela/delas" },
  { value: "elu/delu", label: "elu/delu" },
  { value: "outro", label: "Outro" },
];

const corRacaOptions = [
  "Branca",
  "Preta",
  "Parda",
  "Amarela",
  "Indígena",
  "Não informar",
];

const tipoSanguineoOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PersonalInfoSection() {
  const { register, watch, setValue, formState } = useFormContext<ChildProfileFormValues>();
  const { pushToast } = useToast();
  const avatarUrl = watch("avatarUrl") ?? undefined;
  const avatarFile = watch("avatarFile");
  const nascimento = watch("dataNascimento");

  const idadeLabel = useMemo(() => {
    if (!nascimento) {
      return null;
    }
    const birthDate = new Date(nascimento);
    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const monthDelta = now.getMonth() - birthDate.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
      years -= 1;
    }
    const monthsTotal = (years * 12 + monthDelta + 12) % 12;
    if (years < 0) {
      return null;
    }
    if (years === 0) {
      return `${monthsTotal} mês(es)`;
    }
    return `${years} ano(s) e ${monthsTotal} mês(es)`;
  }, [nascimento]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
        <AvatarUploader
          value={{ file: (avatarFile as File | null) ?? null, url: avatarUrl ?? null }}
          onChange={(avatar) => {
            setValue("avatarFile", avatar.file ?? undefined, { shouldDirty: true });
            setValue("avatarUrl", avatar.url ?? undefined, { shouldDirty: true });
          }}
          onError={(message) =>
            pushToast({ title: message, variant: "danger" })
          }
        />
      </div>

      <div className="grid gap-5 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft md:grid-cols-2">
        <Field label={cadastroStrings.personal.nameLabel} error={formState.errors.nomeCompleto?.message}>
          <input
            {...register("nomeCompleto")}
            placeholder={cadastroStrings.personal.namePlaceholder}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
        </Field>
        <Field label={cadastroStrings.personal.nicknameLabel} error={formState.errors.apelido?.message}>
          <input
            {...register("apelido")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
        </Field>
        <Field label={cadastroStrings.personal.birthDateLabel} error={formState.errors.dataNascimento?.message}>
          <input
            {...register("dataNascimento")}
            type="date"
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
        </Field>
        <div className="flex flex-col gap-1 text-sm text-muted">
          <span className="font-medium text-foreground">Resumo</span>
          <span>{idadeLabel ? cadastroStrings.personal.idadeResumo(idadeLabel) : "Informe a data de nascimento"}</span>
        </div>
        <Field label={cadastroStrings.personal.sexoLabel} error={formState.errors.sexo?.message}>
          <select
            {...register("sexo")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {sexoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={cadastroStrings.personal.pronomeLabel} error={formState.errors.pronome?.message}>
          <select
            {...register("pronome")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <option value="">Selecione</option>
            {pronomeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={cadastroStrings.personal.corLabel} error={formState.errors.corRaca?.message}>
          <select
            {...register("corRaca")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <option value="">Selecione</option>
            {corRacaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label={cadastroStrings.personal.bloodTypeLabel} error={formState.errors.tipoSanguineo?.message}>
          <select
            {...register("tipoSanguineo")}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <option value="">Selecione</option>
            {tipoSanguineoOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-foreground">{cadastroStrings.personal.addressTitle}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={cadastroStrings.personal.addressStreet} error={formState.errors.endereco?.logradouro?.message}>
            <input
              {...register("endereco.logradouro")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.addressNumber} error={formState.errors.endereco?.numero?.message}>
            <input
              {...register("endereco.numero")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.addressDistrict} error={formState.errors.endereco?.bairro?.message}>
            <input
              {...register("endereco.bairro")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.addressCity} error={formState.errors.endereco?.cidade?.message}>
            <input
              {...register("endereco.cidade")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.addressState} error={formState.errors.endereco?.uf?.message}>
            <input
              {...register("endereco.uf")}
              maxLength={2}
              className="w-full uppercase rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.addressZip} error={formState.errors.endereco?.cep?.message}>
            <input
              {...register("endereco.cep")}
              placeholder="00000-000"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
        <h3 className="text-sm font-semibold text-foreground">{cadastroStrings.personal.contactsTitle}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={cadastroStrings.personal.contactMain} error={formState.errors.contatos?.principal?.message}>
            <input
              {...register("contatos.principal")}
              placeholder="11999999999"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.contactExtra} error={formState.errors.contatos?.extra?.message}>
            <input
              {...register("contatos.extra")}
              placeholder="11999999999"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
          <Field label={cadastroStrings.personal.contactEmail} error={formState.errors.contatos?.email?.message}>
            <input
              {...register("contatos.email")}
              type="email"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
