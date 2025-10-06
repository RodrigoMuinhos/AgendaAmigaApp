import React from "react";
import type { MoodLog, MoodOption, MoodScaleStep, SummaryPresetId } from "../Relatorios";

// Tipos locais reimportados do arquivo pai
export type SummaryPreset = {
  id: SummaryPresetId;
  label: string;
  copy: string;
  hint: string;
  days?: number;
};

type SelectedStats = { week: number; month: number; total: number };

type MoodTodaySectionProps = {
  minScaleValue: number;
  maxScaleValue: number;
  sliderScore: number;
  onSliderChange: (value: number) => void;
  moodScaleSteps: MoodScaleStep[];
  selectedMoodId: MoodOption["id"];
  onSelectScaleStep: (step: MoodScaleStep) => void;
  selectedMood: MoodOption;
  selectedStats: SelectedStats;
  summaryPreset: SummaryPreset;
  summaryShare: number;
  overallShare: number;
  note: string;
  noteLimit: number;
  onNoteChange: (v: string) => void;
  onAppendHint: (hint: string) => void;
  hints: readonly string[];
  onSaveMood: () => void;
  feedback: string | null;
  selectedMoodHistory: MoodLog[];
  noteFormatter: Intl.DateTimeFormat;
  moods: MoodOption[];
};

export function MoodTodaySection(props: MoodTodaySectionProps) {
  const {
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
  } = props;

  return (
    <section className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-5">
      {/* Coluna 1-3: Slider + card principal */}
      <div className="md:col-span-3 space-y-4">
        <article className={`relative rounded-3xl border border-border/60 bg-surface/95 p-5 shadow-soft`}>
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                {selectedMood.emoji}
              </span>
              <div>
                <h3 className="text-lg font-semibold leading-tight">Como está hoje?</h3>
                <p className="text-xs text-muted -mt-0.5">{selectedMood.tagline}</p>
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selectedMood.badge}`}>{selectedMood.label}</span>
          </header>

          {/* Slider discreto */}
          <div className="mt-4">
            <input
              type="range"
              min={minScaleValue}
              max={maxScaleValue}
              step={1}
              value={sliderScore}
              onChange={(e) => onSliderChange(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Seletor de humor"
            />
            <div className="mt-3 grid grid-cols-7 gap-1">
              {moodScaleSteps.map((step) => (
                <button
                  key={step.moodId}
                  onClick={() => onSelectScaleStep(step)}
                  className={`flex items-center justify-center rounded-xl border px-2 py-1 text-[10px] transition ${
                    step.moodId === selectedMoodId ? "border-primary bg-primary/10 font-semibold" : "border-border/60 bg-white/60 dark:bg-background/60"
                  }`}
                  title={`${step.mood.label} (${step.score})`}
                >
                  {step.mood.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Nota rápida */}
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold text-muted">Observação de hoje</label>
            <textarea
              value={note}
              maxLength={noteLimit}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Descreva um detalhe que ajude a entender o dia…"
              className="min-h-[80px] w-full resize-y rounded-2xl border border-border/60 bg-surface/95 p-3 text-sm outline-none focus:border-primary"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {hints.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onAppendHint(h)}
                    className="rounded-xl border border-border/60 bg-surface/95 px-2 py-1 text-[11px] text-muted hover:border-primary hover:text-primary"
                  >
                    + {h}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-muted">{note.length}/{noteLimit}</span>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onSaveMood}
                className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-elevated hover:brightness-105"
              >
                Salvar registro
              </button>
            </div>

            {feedback && (
              <p className="mt-2 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">{feedback}</p>
            )}
          </div>
        </article>
      </div>

      {/* Coluna 4-5: Estatísticas rápidas */}
      <div className="md:col-span-2 space-y-4">
        <article className="rounded-3xl border border-border/60 bg-surface/95 p-4 shadow-soft">
          <h4 className="text-sm font-semibold">Seu resumo de {summaryPreset.copy}</h4>
          <p className="text-xs text-muted">{summaryPreset.hint}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-border/60 p-3">
              <div className="text-xl font-bold">{selectedStats.week}</div>
              <div className="text-[11px] text-muted">Semana</div>
            </div>
            <div className="rounded-2xl border border-border/60 p-3">
              <div className="text-xl font-bold">{selectedStats.month}</div>
              <div className="text-[11px] text-muted">30 dias</div>
            </div>
            <div className="rounded-2xl border border-border/60 p-3">
              <div className="text-xl font-bold">{selectedStats.total}</div>
              <div className="text-[11px] text-muted">Histórico</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-border/60 p-3">
              <div className="text-[11px] text-muted">Participação neste período</div>
              <div className="text-lg font-semibold">{summaryShare}%</div>
            </div>
            <div className="rounded-2xl border border-border/60 p-3">
              <div className="text-[11px] text-muted">Participação no total</div>
              <div className="text-lg font-semibold">{overallShare}%</div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-border/60 bg-surface/95 p-4 shadow-soft">
          <h4 className="text-sm font-semibold">Últimos registros deste humor</h4>
          <ul className="mt-2 space-y-2">
            {selectedMoodHistory.length === 0 && (
              <li className="text-xs text-muted">Sem registros para este humor ainda.</li>
            )}
            {selectedMoodHistory.map((log) => (
              <li
                key={`${log.dateISO}-${log.moodId}`}
                className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2"
              >
                <span className="text-[12px]">{log.note}</span>
                <span className="text-[11px] text-muted">{noteFormatter.format(new Date(log.dateISO))}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
