const fs = require('node:fs');
const path = 'apps/frontend/src/screens/relatorios/MoodTodaySection.tsx';
const content = `import { ScreenSection } from "../../components/ui/Screen";
import { cn } from "../../utils/cn";
import type { MoodLog, MoodOption, MoodScaleStep, SummaryPreset } from "../Relatorios";

type MoodTodaySectionProps = {
  minScaleValue: number;
  maxScaleValue: number;
  sliderScore: number;
  onSliderChange: (value: number) => void;
  moodScaleSteps: MoodScaleStep[];
  selectedMoodId: MoodOption["id"];
  onSelectScaleStep: (step: MoodScaleStep) => void;
  selectedMood: MoodOption;
  selectedStats: { week: number; month: number; total: number };
  summaryPreset: SummaryPreset;
  summaryShare: number;
  overallShare: number;
  note: string;
  noteLimit: number;
  onNoteChange: (value: string) => void;
  onAppendHint: (hint: string) => void;
  hints: readonly string[];
  onSaveMood: () => void;
  feedback: string | null;
  selectedMoodHistory: MoodLog[];
  noteFormatter: Intl.DateTimeFormat;
  moods: MoodOption[];
};

export function MoodTodaySection({
  minScaleValue,
  maxScaleValue,
  sliderScore,
  onSliderChange,
  moodScaleSteps,
  selectedMoodId,
  onSelectScaleStep,
  selectedMood,
  selectedStats,
  summaryPreset,
  summaryShare,
  overallShare,
  note,
  noteLimit,
  onNoteChange,
  onAppendHint,
  hints,
  onSaveMood,
  feedback,
  selectedMoodHistory,
  noteFormatter,
  moods,
}: MoodTodaySectionProps) {
  return (
    <ScreenSection
      title="Como a família está hoje?"
      description="Selecione o humor que melhor representa o dia e deixe uma observação para o diário inteligente."
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border/70 bg-background/95 p-4 shadow-soft">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>{minScaleValue}</span>
              <span>{maxScaleValue}</span>
            </div>
            <input
              type="range"
              min={minScaleValue}
              max={10}
              step={1}
              value={sliderScore}
              onChange={(event) => onSliderChange(Number(event.target.value))}
              className="mt-3 w-full accent-primary"
              aria-label="Intensidade emocional de 0 a 10"
            />
            <div className="mt-4 flex flex-col gap-2 text-center text-[11px] text-muted sm:grid sm:grid-cols-2 sm:gap-2 xl:grid-cols-3">
              {moodScaleSteps.map((step) => (
                <button
                  key={step.moodId}
                  type="button"
                  onClick={() => onSelectScaleStep(step)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-2xl border px-4 py-3 transition",
                    step.moodId === selectedMoodId
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/40 bg-background hover:border-primary/40"
                  )}
                >
                  <span className="text-xs font-semibold">{step.score}</span>
                  <span className="text-lg">{step.mood.emoji}</span>
                  <span className="leading-tight">{step.mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <article className="rounded-3xl border border-border/70 bg-surface/95 p-5 shadow-soft transition-shadow">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{selectedMood.emoji}</span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{selectedMood.label}</h3>
                <p className="text-xs text-muted">{selectedMood.tagline}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-border/60 bg-background/90 px-2 py-3 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">7 dias</p>
                <p className="text-base font-semibold text-foreground">{selectedStats.week}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/90 px-2 py-3 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">30 dias</p>
                <p className="text-base font-semibold text-foreground">{selectedStats.month}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/90 px-2 py-3 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Histórico</p>
                <p className="text-base font-semibold text-foreground">{selectedStats.total}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{'Participação em ' + summaryPreset.copy}</span>
                <span className="font-semibold text-foreground">{summaryShare}%</span>
              </div>
              <div className="h-2 rounded-full bg-border/60">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${summaryShare}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Histórico geral</span>
                <span className="font-semibold text-foreground">{overallShare}%</span>
              </div>
            </div>
          </article>

          <article className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Observação do dia</p>
              <span className="text-[11px] text-muted">
                {note.length}/{noteLimit}
              </span>
            </div>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              placeholder="Ex: Hoje o Pedro ficou animado com a aula de música e respondeu bem às pausas sensoriais."
              rows={4}
              maxLength={noteLimit}
              className="w-full rounded-2xl border border-border/60 bg-surface/95 px-4 py-3 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-2">
              {hints.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => onAppendHint(hint)}
                  className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted transition hover:border-primary/50 hover:text-primary"
                >
                  {hint}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onSaveMood}
                className="rounded-2xl border border-transparent bg-primary px-5 py-2 text-xs font-semibold text-white shadow-elevated transition-transform duration-200 hover:-translate-y-0.5"
              >
                Salvar humor de hoje
              </button>
              {feedback && <span className="text-xs font-semibold text-primary">{feedback}</span>}
              {!feedback && note.trim().length === 0 && (
                <span className="text-xs text-muted">
                  Dica: inclua gatilhos, estratégias que funcionaram ou o que deixou o dia especial.
                </span>
              )}
            </div>
          </article>

          {selectedMoodHistory.length > 0 && (
            <article className="rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Últimos registros desse humor</p>
              <ul className="mt-3 space-y-3">
                {selectedMoodHistory.map((log) => {
                  const mood = moods.find((option) => option.id === log.moodId) ?? moods[0];
                  return (
                    <li key={`${log.dateISO}-${log.moodId}`} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-muted">
                        {noteFormatter.format(new Date(log.dateISO))}
                      </span>
                      <p className="flex-1 text-xs text-muted sm:text-sm">{log.note}</p>
                      <span className="hidden rounded-full border border-border/50 bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted sm:inline-flex">
                        {mood.emoji} {mood.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}
        </div>
      </div>
    </ScreenSection>
  );
}
`;
fs.writeFileSync(path, content, 'utf8');
