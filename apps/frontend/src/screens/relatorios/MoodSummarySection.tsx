import { HighlightCard } from "../../components/ui/HighlightCard";
import { ScreenSection } from "../../components/ui/Screen";
import { cn } from "../../utils/cn";
import type {
  MoodLeaderboardEntry,
  SummaryPreset,
  SummaryPresetId,
  TopMood,
} from "../Relatorios";

type MoodSummarySectionProps = {
  summaryRangeId: SummaryPresetId;
  onSummaryRangeChange: (id: SummaryPresetId) => void;
  summaryPresets: readonly SummaryPreset[];
  summaryTop: TopMood;
  summaryLeaderboard: MoodLeaderboardEntry[];
  summaryTotalEntries: number;
};

export function MoodSummarySection({
  summaryRangeId,
  onSummaryRangeChange,
  summaryPresets,
  summaryTop,
  summaryLeaderboard,
  summaryTotalEntries,
}: MoodSummarySectionProps) {
  const selectedPreset = summaryPresets.find((preset) => preset.id === summaryRangeId) ?? summaryPresets[0];

  return (
    <ScreenSection
      title="Resumo de humores"
      description="Compare rapidamente os registros do período selecionado e descubra quais emoções lideram a jornada."
    >
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Período</span>
          {summaryPresets.map((preset) => {
            const isActive = preset.id === summaryRangeId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSummaryRangeChange(preset.id)}
                className={cn(
                  "rounded-2xl border px-3 py-1.5 text-xs font-semibold transition",
                  isActive
                    ? "border-transparent bg-primary text-white shadow-soft"
                    : "border-border/60 bg-background/90 text-muted hover:border-primary/40 hover:text-primary"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:[grid-template-columns:minmax(0,1.2fr)_minmax(0,1fr)]">
          <HighlightCard
            tone="neutral"
            className="hover:border-primary/40"
            subtitle="Humor destaque"
            title={summaryTop ? `${summaryTop.mood.label} ${summaryTop.mood.emoji}` : "Registre um novo humor"}
            description={
              summaryTop
                ? `${summaryTop.count} registros em ${selectedPreset.copy}`
                : "Comece registrando o humor de hoje para liberar os comparativos."
            }
            footer={selectedPreset.hint}
          >
            {summaryTop && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Participação</span>
                  <span className="font-semibold text-foreground">{Math.round(summaryTop.percentage)}%</span>
                </div>
                <div className="h-2 rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full bg-white/80 transition-all duration-500"
                    style={{ width: `${summaryTop.percentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                  <div className="rounded-2xl border border-border/60 bg-background/90 px-3 py-2 text-foreground shadow-soft">
                    <p className="text-[11px] uppercase tracking-wide text-muted">Segundo lugar</p>
                    <p className="text-sm font-semibold text-foreground">
                      {summaryLeaderboard[1]?.mood.label ?? "?"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/90 px-3 py-2 text-foreground shadow-soft">
                    <p className="text-[11px] uppercase tracking-wide text-muted">Total de registros</p>
                    <p className="text-sm font-semibold text-foreground">{summaryTotalEntries}</p>
                  </div>
                </div>
              </>
            )}
          </HighlightCard>

          <div className="min-w-0 flex flex-col gap-3">
            {summaryLeaderboard.slice(0, 4).map((entry, index) => {
              const barWidth = entry.percentage === 0 ? 0 : Math.max(entry.percentage, 12);
              return (
                <div
                  key={entry.mood.id}
                  className="rounded-3xl border border-border/60 bg-background/95 px-4 py-3 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-muted">#{index + 1}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-background text-lg">
                      {entry.mood.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{entry.mood.label}</p>
                      <p className="text-xs text-muted">{entry.count} registro(s)</p>
                    </div>
                    <span className="rounded-full bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted">
                      {Math.round(entry.percentage)}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-border/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        entry.count === 0 ? "bg-border/80" : "bg-primary"
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenSection>
  );
}
