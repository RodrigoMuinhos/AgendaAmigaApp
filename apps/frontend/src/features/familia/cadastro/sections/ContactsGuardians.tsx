// apps/frontend/src/features/familia/cadastro/sections/ContactsGuardians.tsx
import { useFieldArray, useFormContext, type Path } from "react-hook-form";
import type { ChildProfileFormValues } from "../schema";
import { cadastroStrings } from "../strings";
import PhoneField from "../components/PhoneField";
import {
  EmptyState,
  FormFieldWrapper,
  RemoveButton,
  SectionCard,
} from "./SectionHelpers";

export function ContactsGuardiansSection() {
  const { control, register, formState } =
    useFormContext<ChildProfileFormValues>();

  const responsaveisField = useFieldArray<
    ChildProfileFormValues,
    "responsaveis"
  >({ control, name: "responsaveis" });

  const emergenciaField = useFieldArray<
    ChildProfileFormValues,
    "emergencia"
  >({ control, name: "emergencia" });

  const autorizadosField = useFieldArray<
    ChildProfileFormValues,
    "autorizadosRetirada"
  >({ control, name: "autorizadosRetirada" });

  return (
    <div className="space-y-6">
      {/* RESPONSÁVEIS */}
      <SectionCard
        title={cadastroStrings.contacts.responsaveisTitle}
        actionLabel={cadastroStrings.contacts.addResponsavel}
        onAdd={() =>
          responsaveisField.append({
            nome: "",
            parentesco: "",
            telefone: "",
          } as ChildProfileFormValues["responsaveis"][number])
        }
      >
        {responsaveisField.fields.length === 0 ? (
          <EmptyState label="Inclua pelo menos um responsável" />
        ) : (
          <div className="space-y-4">
            {responsaveisField.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-2xl border border-border/60 p-4 lg:grid-cols-3"
              >
                <FormFieldWrapper
                  label="Nome"
                  error={formState.errors.responsaveis?.[index]?.nome?.message}
                >
                  <input
                    {...register(`responsaveis.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Parentesco"
                  error={
                    formState.errors.responsaveis?.[index]?.parentesco?.message
                  }
                >
                  <input
                    {...register(`responsaveis.${index}.parentesco` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <PhoneField
                  name={
                    `responsaveis.${index}.telefone` as Path<ChildProfileFormValues>
                  }
                  label="Telefone"
                  inputClassName="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                />

                <PhoneField
                  name={
                    `responsaveis.${index}.whatsapp` as Path<ChildProfileFormValues>
                  }
                  label="WhatsApp"
                  inputClassName="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                />

                <FormFieldWrapper
                  label="CPF"
                  error={formState.errors.responsaveis?.[index]?.cpf?.message}
                >
                  <input
                    {...register(`responsaveis.${index}.cpf` as const)}
                    placeholder="00000000000"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="RG"
                  error={formState.errors.responsaveis?.[index]?.rg?.message}
                >
                  <input
                    {...register(`responsaveis.${index}.rg` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Data de nascimento"
                  error={
                    formState.errors.responsaveis?.[index]?.dataNascimento
                      ?.message
                  }
                >
                  <input
                    {...register(
                      `responsaveis.${index}.dataNascimento` as const
                    )}
                    type="date"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="E-mail"
                  error={formState.errors.responsaveis?.[index]?.email?.message}
                >
                  <input
                    {...register(`responsaveis.${index}.email` as const)}
                    type="email"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Observações"
                  error={
                    formState.errors.responsaveis?.[index]?.relacao?.message
                  }
                >
                  <input
                    {...register(`responsaveis.${index}.relacao` as const)}
                    placeholder="Guardiões legais, detalhes de cuidado"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <div className="lg:col-span-3">
                  <RemoveButton
                    onClick={() => responsaveisField.remove(index)}
                    label={
                      responsaveisField.fields.length === 1
                        ? "Obrigatório"
                        : "Remover"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* EMERGÊNCIA */}
      <SectionCard
        title={cadastroStrings.contacts.emergenciaTitle}
        actionLabel={cadastroStrings.contacts.addEmergencia}
        onAdd={() =>
          emergenciaField.append({
            nome: "",
            telefone: "",
          } as ChildProfileFormValues["emergencia"][number])
        }
      >
        {emergenciaField.fields.length === 0 ? (
          <EmptyState label="Inclua pelo menos um contato" />
        ) : (
          <div className="space-y-4">
            {emergenciaField.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-3"
              >
                <FormFieldWrapper
                  label="Nome"
                  error={formState.errors.emergencia?.[index]?.nome?.message}
                >
                  <input
                    {...register(`emergencia.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <PhoneField
                  name={
                    `emergencia.${index}.telefone` as Path<ChildProfileFormValues>
                  }
                  label="Telefone"
                  inputClassName="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                />

                <FormFieldWrapper
                  label="Relação"
                  error={formState.errors.emergencia?.[index]?.relacao?.message}
                >
                  <input
                    {...register(`emergencia.${index}.relacao` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <div className="md:col-span-3">
                  <RemoveButton
                    onClick={() => emergenciaField.remove(index)}
                    label={
                      emergenciaField.fields.length === 1
                        ? "Obrigatório"
                        : "Remover"
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* AUTORIZADOS PARA RETIRADA */}
      <SectionCard
        title={cadastroStrings.contacts.autorizadosTitle}
        actionLabel={cadastroStrings.contacts.addAutorizado}
        onAdd={() =>
          autorizadosField.append({
            nome: "",
            telefone: "",
          } as ChildProfileFormValues["autorizadosRetirada"][number])
        }
      >
        {autorizadosField.fields.length === 0 ? (
          <EmptyState label="Cadastre pessoas autorizadas" />
        ) : (
          <div className="space-y-4">
            {autorizadosField.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2"
              >
                <FormFieldWrapper
                  label="Nome"
                  error={
                    formState.errors.autorizadosRetirada?.[index]?.nome?.message
                  }
                >
                  <input
                    {...register(`autorizadosRetirada.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>

                <PhoneField
                  name={
                    `autorizadosRetirada.${index}.telefone` as Path<ChildProfileFormValues>
                  }
                  label="Telefone"
                  inputClassName="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                />

                <div className="md:col-span-2">
                  <RemoveButton onClick={() => autorizadosField.remove(index)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
