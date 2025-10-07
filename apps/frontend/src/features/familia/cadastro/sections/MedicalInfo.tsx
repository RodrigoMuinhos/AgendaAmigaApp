// apps/frontend/src/features/familia/cadastro/sections/MedicalInfo.tsx
import { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ChildProfileFormValues } from "../schema";
import { cadastroStrings } from "../strings";
import PhoneField from "../components/PhoneField";
import { EmptyState, FormFieldWrapper, RemoveButton, SectionCard } from "./SectionHelpers";

const condicoesOptions = [
  "TDAH (Transtorno de Déficit de Atenção e Hiperatividade)",
  "Ansiedade",
  "Distúrbios do sono",
  "Epilepsia",
  "Transtornos de linguagem ou fala",
  "Atraso no desenvolvimento global",
  "Distúrbios sensoriais",
  "Transtornos alimentares (seletividade alimentar)",
  "Problemas gastrointestinais (refluxo, constipação)",
  "Alergia alimentar",
  "Asma",
  "Rinite alérgica",
  "Dermatite atópica",
  "Obesidade ou sobrepeso",
  "Outros",
];


const calcIMC = (pesoKg?: number, alturaCm?: number) => {
  if (!pesoKg || !alturaCm) return "";
  const m = alturaCm / 100;
  if (!m) return "";
  const imc = pesoKg / (m * m);
  return Number.isFinite(imc) ? imc.toFixed(1) : "";
};

export function MedicalInfoSection() {
  const { control, register, watch, formState } = useFormContext<ChildProfileFormValues>();
  const alergiasField = useFieldArray<ChildProfileFormValues, "alergias">({ control, name: "alergias" });
  const medicacoesField = useFieldArray<ChildProfileFormValues, "medicacoesAtuais">({ control, name: "medicacoesAtuais" });
  const cirurgiasField = useFieldArray<ChildProfileFormValues, "cirurgiasInternacoes">({ control, name: "cirurgiasInternacoes" });
  const vacinasField = useFieldArray<ChildProfileFormValues, "vacinas">({ control, name: "vacinas" });
  const medidasField = useFieldArray<ChildProfileFormValues, "crescimento">({ control, name: "crescimento" });

  const medidas = watch("crescimento");
  const imcResumo = useMemo(() => {
    if (!medidas || medidas.length === 0) return null;
    const u = medidas[medidas.length - 1];
    const imc = calcIMC(u?.pesoKg, u?.alturaCm);
    return imc ? cadastroStrings.medical.imcResumo(imc) : null;
  }, [medidas]);

  return (
    <div className="space-y-6">
      <SectionCard
        title={cadastroStrings.medical.alergiasTitle}
        actionLabel={cadastroStrings.medical.addAlergia}
        onAdd={() => alergiasField.append({ nome: "", gravidade: "leve" })}
      >
        {alergiasField.fields.length === 0 ? (
          <EmptyState label="Nenhuma alergia cadastrada" />
        ) : (
          <div className="space-y-4">
            {alergiasField.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2">
                <FormFieldWrapper label="Nome" error={formState.errors.alergias?.[index]?.nome?.message}>
                  <input
                    {...register(`alergias.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Gravidade" error={formState.errors.alergias?.[index]?.gravidade?.message}>
                  <select
                    {...register(`alergias.${index}.gravidade` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="grave">Grave</option>
                  </select>
                </FormFieldWrapper>
                <RemoveButton onClick={() => alergiasField.remove(index)} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title={cadastroStrings.medical.condicoesTitle}>
        <div className="grid gap-2 md:grid-cols-3">
          {condicoesOptions.map((condicao) => (
            <label key={condicao} className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm">
              <input type="checkbox" value={condicao} {...register("condicoes")} />
              <span>{condicao}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={cadastroStrings.medical.medicacoesTitle}
        actionLabel={cadastroStrings.medical.addMedicacao}
        onAdd={() => medicacoesField.append({ nome: "", dose: "", via: "", frequencia: "" })}
      >
        {medicacoesField.fields.length === 0 ? (
          <EmptyState label="Nenhuma medicação registrada" />
        ) : (
          <div className="space-y-4">
            {medicacoesField.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2">
                <FormFieldWrapper label="Nome" error={formState.errors.medicacoesAtuais?.[index]?.nome?.message}>
                  <input
                    {...register(`medicacoesAtuais.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Dose" error={formState.errors.medicacoesAtuais?.[index]?.dose?.message}>
                  <input
                    {...register(`medicacoesAtuais.${index}.dose` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Via" error={formState.errors.medicacoesAtuais?.[index]?.via?.message}>
                  <input
                    {...register(`medicacoesAtuais.${index}.via` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper
                  label="Frequência"
                  error={formState.errors.medicacoesAtuais?.[index]?.frequencia?.message}
                >
                  <input
                    {...register(`medicacoesAtuais.${index}.frequencia` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Horário" error={formState.errors.medicacoesAtuais?.[index]?.horarioLivre?.message}>
                  <input
                    {...register(`medicacoesAtuais.${index}.horarioLivre` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <RemoveButton onClick={() => medicacoesField.remove(index)} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={cadastroStrings.medical.cirurgiasTitle}
        actionLabel={cadastroStrings.medical.addCirurgia}
        onAdd={() => cirurgiasField.append({ evento: "" })}
      >
        {cirurgiasField.fields.length === 0 ? (
          <EmptyState label="Nenhum evento cadastrado" />
        ) : (
          <div className="space-y-4">
            {cirurgiasField.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2">
                <FormFieldWrapper label="Evento" error={formState.errors.cirurgiasInternacoes?.[index]?.evento?.message}>
                  <input
                    {...register(`cirurgiasInternacoes.${index}.evento` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Data" error={formState.errors.cirurgiasInternacoes?.[index]?.data?.message}>
                  <input
                    {...register(`cirurgiasInternacoes.${index}.data` as const)}
                    type="date"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper
                  label="Observação"
                  error={formState.errors.cirurgiasInternacoes?.[index]?.observacao?.message}
                >
                  <textarea
                    {...register(`cirurgiasInternacoes.${index}.observacao` as const)}
                    rows={2}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <RemoveButton onClick={() => cirurgiasField.remove(index)} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={cadastroStrings.medical.vacinasTitle}
        actionLabel={cadastroStrings.medical.addVacina}
        onAdd={() => vacinasField.append({ nome: "", data: "" })}
      >
        {vacinasField.fields.length === 0 ? (
          <EmptyState label="Nenhuma vacina registrada" />
        ) : (
          <div className="space-y-4">
            {vacinasField.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-2">
                <FormFieldWrapper label="Vacina" error={formState.errors.vacinas?.[index]?.nome?.message}>
                  <input
                    {...register(`vacinas.${index}.nome` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Data" error={formState.errors.vacinas?.[index]?.data?.message}>
                  <input
                    {...register(`vacinas.${index}.data` as const)}
                    type="date"
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Lote" error={formState.errors.vacinas?.[index]?.lote?.message}>
                  <input
                    {...register(`vacinas.${index}.lote` as const)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <FormFieldWrapper label="Reação" error={formState.errors.vacinas?.[index]?.reacao?.message}>
                  <textarea
                    {...register(`vacinas.${index}.reacao` as const)}
                    rows={2}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                </FormFieldWrapper>
                <RemoveButton onClick={() => vacinasField.remove(index)} />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={cadastroStrings.medical.crescimentoTitle}
        actionLabel={cadastroStrings.medical.addMedida}
        onAdd={() => medidasField.append({ data: "" })}
      >
        {medidasField.fields.length === 0 ? (
          <EmptyState label="Nenhuma medida registrada" />
        ) : (
          <div className="space-y-4">
            {medidasField.fields.map((field, index) => {
              // mostra IMC instantaneamente conforme digita
              const peso = medidas?.[index]?.pesoKg;
              const altura = medidas?.[index]?.alturaCm;
              const imc = calcIMC(peso, altura);

              return (
                <div key={field.id} className="grid gap-4 rounded-2xl border border-border/60 p-4 md:grid-cols-5">
                  <FormFieldWrapper label="Data" error={formState.errors.crescimento?.[index]?.data?.message}>
                    <input
                      {...register(`crescimento.${index}.data` as const)}
                      type="date"
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Peso (kg)" error={formState.errors.crescimento?.[index]?.pesoKg?.message}>
                    <input
                      {...register(`crescimento.${index}.pesoKg` as const, { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Altura (cm)" error={formState.errors.crescimento?.[index]?.alturaCm?.message}>
                    <input
                      {...register(`crescimento.${index}.alturaCm` as const, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper
                    label="Perímetro cefálo (cm)"
                    error={formState.errors.crescimento?.[index]?.perimetroCefalicoCm?.message}
                  >
                    <input
                      {...register(`crescimento.${index}.perimetroCefalicoCm` as const, { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    />
                  </FormFieldWrapper>

                  {/* IMC calculado automaticamente (somente leitura) */}
                  <FormFieldWrapper label="IMC (auto)">
                    <input
                      value={imc}
                      readOnly
                      className="w-full rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground/80"
                      aria-label={`IMC calculado${imc ? `: ${imc}` : ""}`}
                    />
                  </FormFieldWrapper>

                  <RemoveButton onClick={() => medidasField.remove(index)} />
                </div>
              );
            })}
          </div>
        )}
        {imcResumo ? <p className="text-sm text-muted">{imcResumo}</p> : null}
      </SectionCard>

      <SectionCard title={cadastroStrings.medical.pediatraTitle}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldWrapper label="Nome" error={formState.errors.pediatra?.nome?.message}>
            <input
              {...register("pediatra.nome")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="CRM" error={formState.errors.pediatra?.crm?.message}>
            <input
              {...register("pediatra.crm")}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>

          <PhoneField
            name="pediatra.celular"
            label="Celular"
            inputClassName="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />

          <FormFieldWrapper label="E-mail" error={formState.errors.pediatra?.email?.message}>
            <input
              {...register("pediatra.email")}
              type="email"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          label={cadastroStrings.medical.preferenciasTitle}
          error={formState.errors.preferenciasCuidados?.message}
        >
          <textarea
            {...register("preferenciasCuidados")}
            rows={3}
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
        </FormFieldWrapper>
      </SectionCard>
    </div>
  );
}
