import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { fetchAttendances } from '../../core/api/resources';
import { asArray, safeFilter } from '../../core/utils/arrays';
import type { Attendance, AttendanceStatus, AttendanceType } from '../../core/types/api';

type CareSection = 'agenda' | 'nutricao' | 'medicamentos';

const mainSections: Array<{ id: CareSection; label: string; description: string }> = [
  {
    id: 'agenda',
    label: 'Agenda medica',
    description: 'Consultas, exames e terapias programadas para a familia.',
  },
  {
    id: 'nutricao',
    label: 'Nutricao',
    description: 'Diario alimentar simples para registrar refeicoes e observacoes.',
  },
  {
    id: 'medicamentos',
    label: 'Medicamentos e tratamentos',
    description: 'Controle de prescricoes, doses e aplicacoes.',
  },
];

const typeFilters: Array<{ value: AttendanceType; labelKey: string }> = [
  { value: 'CONSULTA', labelKey: 'care.filters.types.CONSULTA' },
  { value: 'EXAME', labelKey: 'care.filters.types.EXAME' },
  { value: 'TERAPIA', labelKey: 'care.filters.types.TERAPIA' },
];

const statusFilters: Array<{ value: AttendanceStatus; labelKey: string }> = [
  { value: 'AGENDADO', labelKey: 'care.filters.status.AGENDADO' },
  { value: 'REALIZADO', labelKey: 'care.filters.status.REALIZADO' },
  { value: 'FALTOU', labelKey: 'care.filters.status.FALTOU' },
  { value: 'CANCELADO', labelKey: 'care.filters.status.CANCELADO' },
];

const quickTypeLabels: Record<AttendanceType, string> = {
  CONSULTA: 'consulta',
  EXAME: 'exame',
  TERAPIA: 'terapia',
};

export function CareOverviewPage() {
  const { t } = useTranslation();
  const [typeFilter, setTypeFilter] = useState<AttendanceType | null>(null);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | null>(null);
  const [activeSection, setActiveSection] = useState<CareSection>('agenda');
  const [showNutritionDiary, setShowNutritionDiary] = useState(false);
  const nutritionDiaryRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendances'],
    queryFn: () => fetchAttendances(),
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [createType, setCreateType] = useState<AttendanceType>('CONSULTA');

  const attendancesData = asArray<Attendance>(data);

  const attendances = useMemo(() => {
    const sorted = [...attendancesData].sort((a, b) => a.datetime.localeCompare(b.datetime));
    return safeFilter<Attendance>(sorted, (attendance) => {
      if (typeFilter && attendance.type !== typeFilter) {
        return false;
      }
      if (statusFilter && attendance.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [attendancesData, statusFilter, typeFilter]);

  const createDialogTitle = `Novo atendimento (${quickTypeLabels[createType]})`;

  useEffect(() => {
    if (activeSection !== 'nutricao') {
      setShowNutritionDiary(false);
    }
  }, [activeSection]);

  const handleStartNutritionDiary = () => {
    setShowNutritionDiary(true);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        nutritionDiaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  const quickActions: Array<{ type: AttendanceType; label: string }> = [
    { type: 'CONSULTA', label: stripLeadingNovo(t('care.actions.newConsultation')) },
    { type: 'EXAME', label: stripLeadingNovo(t('care.actions.newExam')) },
    { type: 'TERAPIA', label: stripLeadingNovo(t('care.actions.newTherapy')) },
  ];

  return (
    <>
      <section className="space-y-6">
        <header className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">{t('care.title')}</h1>
              <p className="text-lg text-muted">{t('care.subtitle')}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {mainSections.map((section) => (
                <Button
                  key={section.id}
                  type="button"
                  variant={activeSection === section.id ? 'primary' : 'secondary'}
                  className="flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold"
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {activeSection === 'agenda' ? (
          <>
            <section className="space-y-4">
              <div className="flex flex-wrap gap-1 sm:flex-nowrap sm:gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.type}
                    type="button"
                    size="xs"
                    variant="outline"
                    className="rounded-full px-3 text-xs font-semibold uppercase tracking-wide"
                    onClick={() => {
                      setCreateType(action.type);
                      setOpenCreate(true);
                    }}
                  >
                    <span aria-hidden className="text-lg leading-none text-[rgb(var(--color-primary))]">
                      +
                    </span>
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>
              <Card className="border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.6)]">
                <CardContent className="flex flex-col gap-4 py-4">
                  <FilterPills
                    label="Tipo"
                    options={typeFilters.map((filter) => ({
                      value: filter.value,
                      label: t(filter.labelKey),
                    }))}
                    activeValue={typeFilter}
                    onSelect={setTypeFilter}
                  />
                  <FilterPills
                    label="Status"
                    options={statusFilters.map((filter) => ({
                      value: filter.value,
                      label: t(filter.labelKey),
                    }))}
                    activeValue={statusFilter}
                    onSelect={setStatusFilter}
                  />
                </CardContent>
              </Card>
            </section>

            {isError ? (
              <Card>
                <CardContent className="flex flex-col gap-3 py-6 text-[rgb(var(--color-danger))]">
                  <span>{t('common.error')}</span>
                  <Button onClick={() => refetch()} size="sm" variant="secondary">
                    {t('common.retry')}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {isLoading ? (
              <p className="text-lg text-muted">{t('common.loading')}</p>
            ) : attendances.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted">{t('care.empty')}</CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {attendances.map((attendance) => (
                  <CareCard key={attendance.id} attendance={attendance} />
                ))}
              </div>
            )}
          </>
        ) : null}

        {activeSection === 'nutricao' ? (
          <div className="space-y-6">
            {showNutritionDiary ? (
              <div ref={nutritionDiaryRef}>
                <NutritionDiary manualContent={<NutritionManualContent />} />
              </div>
            ) : (
              <NutritionIntroCard onStartDiary={handleStartNutritionDiary} />
            )}
          </div>
        ) : null}

        {activeSection === 'medicamentos' ? (
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos e tratamentos</CardTitle>
              <CardDescription>Organize prescricoes, doses e responsaveis pelas aplicacoes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Utilize o controle de tratamentos para registrar medicamentos, horarios e observacoes importantes.
              </p>
              <Button asChild size="sm" variant="secondary">
                <Link to="/treatments">Abrir controle</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{createDialogTitle}</DialogTitle>
            <DialogDescription>
              Estamos finalizando este formulario. Enquanto isso, utilize os registros existentes para acompanhar os
              atendimentos da familia.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.4)] bg-white px-4 py-6 text-sm text-[rgba(var(--color-text),0.7)]">
            Em breve voce podera registrar novos atendimentos diretamente por aqui.
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpenCreate(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CareCard({ attendance }: { attendance: Attendance }) {
  const { t } = useTranslation();
  const dateLabel = dayjs(attendance.datetime).format('DD/MM/YYYY HH:mm');
  const typeLabel = t(`care.filters.types.${attendance.type}`);
  const statusLabel = t(`care.filters.status.${attendance.status}`);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl text-[rgb(var(--color-text))]">{attendance.patientName}</CardTitle>
          <CardDescription className="space-x-2 text-sm">
            <span>{typeLabel}</span>
            <span>|</span>
            <span>{dateLabel}</span>
            {attendance.professionalName ? (
              <>
                <span>|</span>
                <span>{attendance.professionalName}</span>
              </>
            ) : null}
          </CardDescription>
        </div>
        <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
          {statusLabel}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-muted">
          {attendance.location ? <p>{attendance.location}</p> : null}
          {attendance.notes ? <p>{attendance.notes}</p> : null}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/care/${attendance.type.toLowerCase()}/${attendance.id}`}>{t('common.edit')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterPillsProps<T extends string> = {
  label: string;
  options: Array<FilterOption<T>>;
  activeValue: T | null;
  onSelect: (value: T | null) => void;
};

function FilterPills<T extends string>({ label, options, activeValue, onSelect }: FilterPillsProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === activeValue;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(isActive ? null : option.value)}
              className={[
                'rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgba(30,136,229,0.35)]',
                isActive
                  ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]'
                  : 'border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.9)] text-[rgba(var(--color-text),0.7)] hover:border-[rgba(var(--color-primary),0.4)] hover:text-[rgb(var(--color-primary))]',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type FlowSectionProps = {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

function FlowSection({ label, title, description, children }: FlowSectionProps) {
  return (
    <div className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.7)] p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-primary))]">
            {label}
          </span>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">{title}</h3>
        </div>
        {description ? (
          <p className="text-sm leading-relaxed text-[rgba(var(--color-text),0.75)]">{description}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

type SuggestionMatrixRow = {
  meal: string;
  below: string;
  adequate: string;
  above: string;
};

const suggestionMatrix: SuggestionMatrixRow[] = [
  {
    meal: 'Cafe da manha',
    below: 'Pao integral com queijo, leite e fruta.',
    adequate: 'Pao integral, leite ou iogurte e fruta.',
    above: 'Iogurte light, aveia e fruta.',
  },
  {
    meal: 'Almoco',
    below: 'Arroz, feijao, carne vermelha, legumes e porcao extra de carboidrato.',
    adequate: 'Arroz, feijao, frango ou peixe, legumes e fruta.',
    above: 'Arroz integral, feijao, frango grelhado, salada e fruta.',
  },
  {
    meal: 'Lanches',
    below: 'Frutas com pasta de amendoim e vitaminas.',
    adequate: 'Frutas e biscoitos integrais.',
    above: 'Frutas frescas e oleaginosas.',
  },
  {
    meal: 'Jantar / Ceia',
    below: 'Sopa de legumes com proteina ou refeicao completa.',
    adequate: 'Sopa leve ou refeicao menor.',
    above: 'Caldos e sopas leves, sem fritura.',
  },
];

type NutritionIntroCardProps = {
  onStartDiary: () => void;
};

function NutritionIntroCard({ onStartDiary }: NutritionIntroCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutricao</CardTitle>
        <CardDescription>Diario alimentar para acompanhar refeicoes e preferencias.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-[rgba(var(--color-text),0.75)]">
        <p>
          Registre refeicoes da crianca, acompanhe observacoes importantes e gere relatorios nutricionais com base nos
          objetivos definidos.
        </p>
        <div className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.5)] p-4">
          <p>O diario alimenta graficos de evolucao, alertas inteligentes e sugestoes personalizadas.</p>
        </div>
        <Button type="button" onClick={onStartDiary} className="w-full sm:w-auto">
          Diario alimentar &gt;
        </Button>
      </CardContent>
    </Card>
  );
}

function NutritionManualContent() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Fluxograma conceitual</CardTitle>
        <CardDescription>
          Controle alimentar infantil com etapas claras para registro, analise e recomendacoes personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <FlowSection label="Entrada" title="Perfil da crianca">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[rgb(var(--color-text))]">Dados coletados</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-[rgba(var(--color-text),0.75)]">
                <li>Idade, peso, altura e IMC calculado automaticamente.</li>
                <li>Alergias e restricoes como lactose, gluten e sensibilidades.</li>
                <li>Preferencias alimentares, aversoes e observacoes clinicas.</li>
              </ul>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[rgb(var(--color-text))]">Objetivo nutricional</h4>
              <ul className="ml-4 list-disc space-y-1 text-sm text-[rgba(var(--color-text),0.75)]">
                <li>Escolha entre manter, ganhar ou reduzir peso.</li>
                <li>Define metas de calorias e porcoes alinhadas ao pediatra.</li>
              </ul>
            </div>
          </div>
        </FlowSection>

        <FlowSection
          label="Etapa 1"
          title="Registro diario"
          description="Responsavel registra momentos-chave com rapidez e consistencia."
        >
          <ul className="ml-4 list-disc space-y-1 text-sm text-[rgba(var(--color-text),0.75)]">
            <li>Cafe da manha, lanche da manha (opcional), almoco, lanche da tarde, jantar e ceia quando aplicavel.</li>
            <li>Campos para alimentos, horario, quantidade e observacoes importantes.</li>
            <li>Entradas alimentam o Diario Alimentar e atualizam graficos de peso e ingestao calorica.</li>
          </ul>
        </FlowSection>

        <FlowSection
          label="Etapa 2"
          title="Analise de estado nutricional"
          description="Sistema aplica IMC infantil com percentil por idade e sexo."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-white p-4 text-sm text-[rgba(var(--color-text),0.75)]">
              <h4 className="text-base font-semibold text-[rgb(var(--color-text))]">Abaixo do peso</h4>
              <p>Plano de complementacao calorica saudavel com foco em densidade nutricional.</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-white p-4 text-sm text-[rgba(var(--color-text),0.75)]">
              <h4 className="text-base font-semibold text-[rgb(var(--color-text))]">Peso adequado</h4>
              <p>Manutencao priorizando qualidade, variedade e equilibrio entre grupos alimentares.</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-white p-4 text-sm text-[rgba(var(--color-text),0.75)]">
              <h4 className="text-base font-semibold text-[rgb(var(--color-text))]">Acima do peso</h4>
              <p>Ajuste leve de calorias com incentivo a frutas, fibras, hidratacao e rotina ativa.</p>
            </div>
          </div>
        </FlowSection>

        <FlowSection
          label="Etapa 3"
          title="Sugestoes automaticas"
          description="Refeicoes sugeridas mudam conforme a classificacao nutricional."
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-[rgba(var(--color-text),0.8)]">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  <th className="rounded-l-xl bg-[rgba(var(--color-surface),0.7)] px-4 py-2 font-semibold">Refeicao</th>
                  <th className="bg-[rgba(var(--color-surface),0.7)] px-4 py-2 font-semibold">Abaixo do peso</th>
                  <th className="bg-[rgba(var(--color-surface),0.7)] px-4 py-2 font-semibold">Peso adequado</th>
                  <th className="rounded-r-xl bg-[rgba(var(--color-surface),0.7)] px-4 py-2 font-semibold">
                    Acima do peso
                  </th>
                </tr>
              </thead>
              <tbody>
                {suggestionMatrix.map((row) => (
                  <tr key={row.meal} className="align-top">
                    <td className="rounded-l-xl bg-white px-4 py-3 font-semibold text-[rgb(var(--color-text))]">
                      {row.meal}
                    </td>
                    <td className="bg-white px-4 py-3">{row.below}</td>
                    <td className="bg-white px-4 py-3">{row.adequate}</td>
                    <td className="rounded-r-xl bg-white px-4 py-3">{row.above}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FlowSection>

        <FlowSection
          label="Etapa 4"
          title="Controle de restricoes e alergias"
          description="Personaliza automaticamente conforme alergias informadas."
        >
          <ul className="ml-4 list-disc space-y-1 text-sm text-[rgba(var(--color-text),0.75)]">
            <li>Alergia a lactose remove leite e derivados das sugestoes e oferece substitutos vegetais.</li>
            <li>Alergia a gluten troca paes e massas comuns por opcoes sem gluten.</li>
            <li>Refeicoes inseguras recebem icone de alerta e proposta de substituicao segura.</li>
          </ul>
        </FlowSection>

        <FlowSection
          label="Etapa 5"
          title="Indicadores e relatorios"
          description="Visoes para acompanhar progresso e habitos alimentares."
        >
          <ul className="ml-4 list-disc space-y-1 text-sm text-[rgba(var(--color-text),0.75)]">
            <li>Graficos de evolucao: peso, altura, IMC e calorias medias.</li>
            <li>Resumo semanal com frutas ingeridas, agua consumida e variedade de grupos alimentares.</li>
            <li>Alertas inteligentes como baixa ingestao de frutas ou tendencia de ganho de peso.</li>
          </ul>
        </FlowSection>

        <FlowSection label="Etapa 6" title="Acoes automaticas" description="Engajam familia e equipe de saude.">
          <ul className="ml-4 list-disc space-y-1 text-sm text-[rgba(var(--color-text),0.75)]">
            <li>Gera plano semanal sugerido com base nos objetivos.</li>
            <li>Lembretes de hidratacao e frutas via notificacao push.</li>
            <li>Resumo nutricional enviado para acompanhamento medico ou pediatrico.</li>
          </ul>
        </FlowSection>

        <div className="rounded-2xl border border-[rgba(var(--color-primary),0.2)] bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm text-[rgba(var(--color-text),0.75)]">
          O app adapta linguagem e porcoes conforme a faixa etaria (3-5, 6-10 ou 11-14 anos), garantindo orientacoes
          alinhadas ao desenvolvimento infantil.
        </div>
      </CardContent>
    </Card>
  );
}

type MealType = 'cafe' | 'lanche' | 'almoco' | 'jantar' | 'extra';

type MealEntry = {
  id: string;
  dateISO: string;
  meal: MealType;
  notes: string;
  createdAt: string;
};

const mealTypeOptions: Array<{ value: MealType; label: string }> = [
  { value: 'cafe', label: 'Cafe da manha' },
  { value: 'lanche', label: 'Lanche' },
  { value: 'almoco', label: 'Almoco' },
  { value: 'jantar', label: 'Jantar' },
  { value: 'extra', label: 'Observacao extra' },
];

type QuickNote = {
  key: string;
  label: string;
  selectLabel: string;
  note: string;
  quantity: string;
  suggestion: string;
};

const quickNotes: QuickNote[] = [
  {
    key: 'fruta',
    label: 'Fruta',
    selectLabel: 'Fruta — 1/2 xic. ou 1 un. pequena',
    note: 'Fruta fresca',
    quantity: '1 porcao (1/2 xicara picada ou 1 unidade pequena).',
    suggestion: 'Combine cores diferentes ao longo do dia e ofereca com casca quando possivel para aumentar fibras.',
  },
  {
    key: 'legumes',
    label: 'Legumes',
    selectLabel: 'Legumes — 1/2 prato',
    note: 'Legumes cozidos',
    quantity: '1/2 prato de legumes cozidos ou crus variados.',
    suggestion: 'Misture legumes em preparacoes ou sirva em palitinhos com molhos leves para estimular o consumo.',
  },
  {
    key: 'proteina',
    label: 'Proteina',
    selectLabel: 'Proteina — 60 g',
    note: 'Proteina magra',
    quantity: '1 porcao (60 g) de frango, peixe, carne magra ou ovos.',
    suggestion: 'Priorize cortes magros preparados assados, grelhados ou cozidos. Evite frituras frequentes.',
  },
  {
    key: 'agua',
    label: 'Agua 200ml',
    selectLabel: 'Agua — 200 ml',
    note: 'Agua 200ml',
    quantity: '200 ml de agua ou 1 garrafinha pequena.',
    suggestion: 'Ofereca agua ao longo do dia e associe o habito a pausas entre brincadeiras ou estudos.',
  },
  {
    key: 'suplemento',
    label: 'Suplemento',
    selectLabel: 'Suplemento — dose pediatra',
    note: 'Suplemento conforme prescricao',
    quantity: 'Dose orientada pelo pediatra (ex.: 5 ml ou 1 sache).',
    suggestion: 'Verifique dias e horarios prescritos. Registrar ajuda a nao perder doses importantes.',
  },
  {
    key: 'sem_apetite',
    label: 'Sem apetite',
    selectLabel: 'Sem apetite — reforco leve',
    note: 'Sem apetite',
    quantity: 'Oferecer opcoes leves: vitamina de frutas, iogurte, sopa cremosa.',
    suggestion:
      'Respeite sinais de saciedade e monitore. Se persistir, anote ocorrencias para compartilhar com o pediatra.',
  },
];

type NutritionDiaryProps = {
  manualContent?: ReactNode;
};

function NutritionDiary({ manualContent }: NutritionDiaryProps) {
  const today = dayjs().format('YYYY-MM-DD');
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [mealDate, setMealDate] = useState<string>(today);
  const [mealType, setMealType] = useState<MealType>('almoco');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<QuickNote[]>([]);
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>('');
  const [manualOpen, setManualOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<QuickNote | null>(null);

  const groupedEntries = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    entries.forEach((entry) => {
      const list = map.get(entry.dateISO) ?? [];
      list.push(entry);
      map.set(entry.dateISO, list);
    });

    return Array.from(map.entries())
      .map(([dateISO, items]) => ({
        dateISO,
        items: items.sort((a, b) => mealOrder(a.meal) - mealOrder(b.meal) || b.createdAt.localeCompare(a.createdAt)),
      }))
      .sort((a, b) => dayjs(b.dateISO).valueOf() - dayjs(a.dateISO).valueOf());
  }, [entries]);

  const combinedNotes = useMemo(() => {
    const base = selectedItems.map((item) => `${item.note} (${item.quantity})`).join(', ');
    if (manualNotes.trim()) {
      return base ? `${base}. ${manualNotes.trim()}` : manualNotes.trim();
    }
    return base;
  }, [manualNotes, selectedItems]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!combinedNotes.trim()) {
      return;
    }
    const entry: MealEntry = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      dateISO: mealDate,
      meal: mealType,
      notes: combinedNotes,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setSelectedItems([]);
    setManualNotes('');
    setSelectedOptionKey('');
    setActiveSuggestion(null);
    setMealType('almoco');
    setMealDate(today);
  };

  const ensureItemSelected = (item: QuickNote) => {
    setSelectedItems((prev) => {
      if (prev.some((existing) => existing.key === item.key)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const handleQuickSuggestion = (item: QuickNote) => {
    ensureItemSelected(item);
    setActiveSuggestion((prev) => (prev?.key === item.key ? null : item));
  };

  const handleSelectConsumption = (key: string) => {
    if (!key) {
      setSelectedOptionKey('');
      return;
    }
    const item = quickNotes.find((option) => option.key === key);
    if (!item) {
      return;
    }
    ensureItemSelected(item);
    setActiveSuggestion(item);
    setSelectedOptionKey('');
  };

  const handleRemoveSelectedItem = (key: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.key !== key));
    if (activeSuggestion?.key === key) {
      setActiveSuggestion(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nutricao</CardTitle>
            <CardDescription>Diario alimentar para acompanhar refeicoes e preferencias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[150px_200px_1fr_auto]">
              <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.7)]">
                Data
                <input
                  type="date"
                  value={mealDate}
                  max={today}
                  onChange={(event) => setMealDate(event.target.value)}
                  className="mt-1 rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
                />
              </label>

              <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.7)]">
                Momento
                <select
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value as MealType)}
                  className="mt-1 rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
                >
                  {mealTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="flex flex-col gap-2 text-sm font-medium text-[rgba(var(--color-text),0.7)]">
                <legend className="text-sm font-medium text-[rgba(var(--color-text),0.7)]">O que foi consumido?</legend>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={selectedOptionKey}
                      onChange={(event) => handleSelectConsumption(event.target.value)}
                      className="w-full rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)] sm:min-w-[220px]"
                    >
                      <option value="">Selecione um alimento</option>
                      {quickNotes.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.selectLabel}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] font-normal text-[rgba(var(--color-text),0.5)] sm:text-xs">
                      Escolha itens prontos com porcoes curtas. Ajuste nas observacoes se precisar.
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-3 text-sm text-[rgb(var(--color-text))] shadow-sm">
                    {selectedItems.length === 0 ? (
                      <p className="text-xs text-[rgba(var(--color-text),0.6)]">Nenhum alimento selecionado ainda.</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedItems.map((item) => (
                          <li
                            key={item.key}
                            className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.9)] px-3 py-2"
                          >
                            <div>
                              <span className="block text-sm font-semibold text-[rgb(var(--color-text))]">
                                {item.label}
                              </span>
                              <span className="text-xs text-[rgba(var(--color-text),0.6)]">{item.quantity}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedItem(item.key)}
                              className="text-xs font-semibold text-[rgba(var(--color-text),0.6)] transition hover:text-[rgb(var(--color-primary))]"
                              aria-label={`Remover ${item.note}`}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </fieldset>

              <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.7)]">
                Observacoes adicionais
                <textarea
                  value={manualNotes}
                  onChange={(event) => setManualNotes(event.target.value)}
                  rows={3}
                  placeholder="Ex: Crianca estava com pouco apetite ou pediu repeticao da refeicao."
                  className="mt-1 resize-none rounded-2xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
                />
              </label>

              <div className="flex items-end">
                <Button type="submit" size="sm" className="rounded-full px-4">
                  Registrar
                </Button>
              </div>
            </form>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">Sugestoes rapidas</span>
              {quickNotes.map((item) => {
                const isActive = activeSuggestion?.key === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleQuickSuggestion(item)}
                    className={[
                      'rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgba(30,136,229,0.35)]',
                      isActive
                        ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]'
                        : 'border-[rgba(var(--color-primary),0.3)] bg-[rgba(var(--color-primary),0.08)] text-[rgb(var(--color-primary))] hover:bg-[rgba(var(--color-primary),0.15)]',
                    ].join(' ')}
                    aria-pressed={isActive}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {activeSuggestion ? (
              <div className="relative w-full rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.95)] p-4 text-sm text-[rgba(var(--color-text),0.75)] shadow-soft md:ml-4 md:w-72">
                <div
                  className="absolute -left-2 top-8 hidden h-4 w-4 rotate-45 border-l border-t border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.95)] md:block"
                  aria-hidden
                />
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[rgb(var(--color-primary))]">
                    Sugestao
                  </span>
                  <span className="text-sm font-semibold text-[rgb(var(--color-text))]">{activeSuggestion.label}</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl bg-[rgba(var(--color-primary),0.08)] px-3 py-2 text-[rgb(var(--color-primary))]">
                    {activeSuggestion.quantity}
                  </div>
                  <p>{activeSuggestion.suggestion}</p>
                  <p className="text-xs text-[rgba(var(--color-text),0.55)]">
                    Sugestao adicionada a lista de consumo para facilitar o registro.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          </CardContent>
        </Card>

        {groupedEntries.length === 0 ? (
          <Card className="border border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.4)]">
            <CardContent className="py-10 text-center">
              <p className="text-base font-semibold text-[rgb(var(--color-text))]">Nenhuma refeicao registrada ainda.</p>
              <p className="text-sm text-[rgba(var(--color-text),0.7)]">
                Use o formulario acima para registrar rapidamente o que a crianca consumiu ao longo do dia.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedEntries.map((group) => (
              <Card key={group.dateISO}>
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg text-[rgb(var(--color-text))]">{dayjs(group.dateISO).format('DD/MM/YYYY')}</CardTitle>
                    <CardDescription className="text-sm text-[rgba(var(--color-text),0.65)]">
                      {dayjs(group.dateISO).isSame(dayjs(), 'day') ? 'Hoje' : weekDayLabel(group.dateISO)}
                    </CardDescription>
                  </div>
                  <span className="rounded-full bg-[rgba(var(--color-primary),0.1)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
                    {group.items.length} registro{group.items.length > 1 ? 's' : ''}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.8)] px-4 py-3 text-sm text-[rgb(var(--color-text))]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold capitalize">{mealLabel(entry.meal)}</span>
                        <span className="text-xs text-[rgba(var(--color-text),0.6)]">
                          {dayjs(entry.createdAt).format('HH:mm')}
                        </span>
                      </div>
                      <p className="mt-2 leading-relaxed text-[rgba(var(--color-text),0.85)]">{entry.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      {manualContent ? (
        <section className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm sm:w-auto sm:px-6"
            onClick={() => setManualOpen((prev) => !prev)}
            aria-expanded={manualOpen}
          >
            <span className="font-semibold text-[rgb(var(--color-text))]">Manual alimentar</span>
            <span className="text-xs text-[rgba(var(--color-text),0.6)]">{manualOpen ? 'Fechar' : 'Abrir'}</span>
          </Button>
          {manualOpen ? <div className="space-y-4">{manualContent}</div> : null}
        </section>
      ) : null}
    </div>
  );
}

function mealOrder(meal: MealType) {
  switch (meal) {
    case 'cafe':
      return 1;
    case 'lanche':
      return 2;
    case 'almoco':
      return 3;
    case 'jantar':
      return 4;
    default:
      return 5;
  }
}

function mealLabel(meal: MealType) {
  const option = mealTypeOptions.find((item) => item.value === meal);
  return option ? option.label : meal;
}

function weekDayLabel(dateISO: string) {
  const dayIndex = dayjs(dateISO).day();
  const labels = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];
  return labels[dayIndex] ?? '';
}

function stripLeadingNovo(text: string) {
  return text.replace(/^\s*(Nov[ao]s?|New)\s+/i, '').trim();
}
