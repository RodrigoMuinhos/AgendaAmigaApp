import { useFieldArray, useFormContext } from "react-hook-form";
import type { ChildProfileFormValues } from "../schema";
import { cadastroStrings } from "../strings";
import { EmptyState, FormFieldWrapper, RemoveButton, SectionCard } from "./SectionHelpers";

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function RoutineSchoolSection() {
  const { register, control, watch, setValue, formState } = useFormContext<ChildProfileFormValues>();
  const terapiasField = useFieldArray<ChildProfileFormValues, "terapias">({ control, name: "terapias" });
  const atividadesField = useFieldArray<ChildProfileFormValues, "atividades">({ control, name: "atividades" });
  const qualidadeSono = watch("rotinaSono.qualidadeSono") ?? 0;

  const toggleDia = (indice: number, dia: string) => {
    const atual = watch(`terapias.${indice}.diasDaSemana`) ?? [];
    const jaExiste = atual.includes(dia);
    const atualizado = jaExiste ? atual.filter((item) => item !== dia) : [...atual, dia];
    setValue(`terapias.${indice}.diasDaSemana` as const, atualizado, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <SectionCard title={cadastroStrings.routine.schoolTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldWrapper label="Nome da escola" error={formState.errors.escola?.nome?.message}>
            <input
              {...register("escola.nome")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Série" error={formState.errors.escola?.serie?.message}>
            <input
              {...register("escola.serie")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Turno" error={formState.errors.escola?.turno?.message}>
            <input
              {...register("escola.turno")}
              placeholder="Integral, manhã, tarde"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Contato coordenação" error={formState.errors.escola?.contato?.message}>
            <input
              {...register("escola.contato")}
              placeholder="11999999999"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
        </div>
      </SectionCard>

      <SectionCard title={cadastroStrings.routine.routineSleepTitle}>
        <div className="grid gap-4 md:grid-cols-3">
          <FormFieldWrapper label="Hora dormir" error={formState.errors.rotinaSono?.horaDormir?.message}>
            <input
              {...register("rotinaSono.horaDormir")}
              type="time"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Hora acordar" error={formState.errors.rotinaSono?.horaAcordar?.message}>
            <input
              {...register("rotinaSono.horaAcordar")}
              type="time"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Sonecas" error={formState.errors.rotinaSono?.sonecas?.message}>
            <input
              {...register("rotinaSono.sonecas", { valueAsNumber: true })}
              type="number"
              min={0}
              max={6}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
        </div>
        <div className="space-y-2">
          <FormFieldWrapper label="Qualidade do sono" error={formState.errors.rotinaSono?.qualidadeSono?.message}>
            <input
              {...register("rotinaSono.qualidadeSono", { valueAsNumber: true })}
              type="range"
              min={1}
              max={5}
              className="w-full"
            />
          </FormFieldWrapper>
          <p className="text-xs text-muted">{qualidadeSono ? `${qualidadeSono}/5` : "Informe a percepção de sono"}</p>
        </div>
      </SectionCard>

      <SectionCard title={cadastroStrings.routine.routineFoodTitle}>
        <div className="grid gap-4 md:grid-cols-3">
          <FormFieldWrapper label="Restrições" error={formState.errors.rotinaAlimentacao?.restricoes?.message}>
            <input
              {...register("rotinaAlimentacao.restricoes")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Preferências" error={formState.errors.rotinaAlimentacao?.preferencias?.message}>
            <input
              {...register("rotinaAlimentacao.preferencias")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Água (L/dia)" error={formState.errors.rotinaAlimentacao?.aguaLitrosDia?.message}>
            <input
              {...register("rotinaAlimentacao.aguaLitrosDia", { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
        </div>
      </SectionCard>

      <SectionCard
        title={cadastroStrings.routine.therapiesTitle}
        actionLabel={cadastroStrings.routine.addTherapy}
        onAdd={() => terapiasField.append({ tipo: "" })}
      >
        {terapiasField.fields.length === 0 ? (
          <EmptyState label="Cadastre terapias em andamento" />
        ) : (
          <div className="space-y-4">
            {terapiasField.fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-2xl border border-border/60 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormFieldWrapper label="Tipo" error={formState.errors.terapias?.[index]?.tipo?.message}>
                    <input
                      {...register(`terapias.${index}.tipo` as const)}
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Profissional" error={formState.errors.terapias?.[index]?.profissional?.message}>
                    <input
                      {...register(`terapias.${index}.profissional` as const)}
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Local" error={formState.errors.terapias?.[index]?.local?.message}>
                    <input
                      {...register(`terapias.${index}.local` as const)}
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Observação" error={formState.errors.terapias?.[index]?.observacao?.message}>
                    <textarea
                      {...register(`terapias.${index}.observacao` as const)}
                      rows={2}
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                </div>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map((dia) => {
                    const selecionado = Boolean(watch(`terapias.${index}.diasDaSemana`)?.includes(dia));
                    return (
                      <button
                        type="button"
                        key={`${field.id}-${dia}`}
                        onClick={() => toggleDia(index, dia)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          selecionado ? "border-primary bg-primary/15 text-primary" : "border-border/60 bg-background text-muted"
                        }`}
                      >
                        {dia}
                      </button>
                    );
                  })}
                </div>
                <RemoveButton onClick={() => terapiasField.remove(index)} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={cadastroStrings.routine.activitiesTitle}
        actionLabel={cadastroStrings.routine.addActivity}
        onAdd={() => atividadesField.append({ nome: "" })}
      >
        {atividadesField.fields.length === 0 ? (
          <EmptyState label="Cadastre esportes ou atividades" />
        ) : (
          <div className="space-y-4">
            {atividadesField.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2">
                <FormFieldWrapper label="Atividade" error={formState.errors.atividades?.[index]?.nome?.message}>
                  <input
                    {...register(`atividades.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Frequência" error={formState.errors.atividades?.[index]?.frequencia?.message}>
                  <input
                    {...register(`atividades.${index}.frequencia` as const)}
                    placeholder="2x por semana"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <div className="md:col-span-2">
                  <RemoveButton onClick={() => atividadesField.remove(index)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

