import { ScreenSection } from "../../components/ui/Screen";
import { cn } from "../../utils/cn";
import type { MoodLeaderboardEntry, MoodOption } from "../Relatorios";

type MoodMapSectionProps = {
  mapView: "ranking" | "timeline";
  onChangeView: (view: "ranking" | "timeline") => void;
  timelineRange: number;
  onTimelineRangeChange: (range: number) => void;
  timelinePresets: ReadonlyArray<{ id: number; label: string }>;
  overallLeaderboard: MoodLeaderboardEntry[];
  timeline: Array<{ date: Date; mood: MoodOption | null; label: string }>;
};

export function MoodMapSection({
  mapView,
  onChangeView,
  timelineRange,
  onTimelineRangeChange,
  timelinePresets,
  overallLeaderboard,
  timeline,
}: MoodMapSectionProps) {
  const Actions = (
    <div className="flex flex-wrap items-center gap-2">
      {(["ranking", "timeline"] as const).map((view) => {
        const isActive = mapView === view;
        return (
          <button
            key={view}
            type="button"
            onClick={() => onChangeView(view)}
            className={cn(
              "h-9 rounded-2xl border px-3 text-xs font-semibold capitalize transition",
              isActive
                ? "border-transparent bg-primary text-white shadow-soft"
                : "border-border/60 bg-background/90 text-muted hover:border-primary/40 hover:text-primary"
            )}
          >
            {view === "ranking" ? "Ranking" : "Linha do tempo"}
          </button>
        );
      })}

      {mapView === "timeline" && (
        <div className="ml-2 flex gap-2">
          {timelinePresets.map((preset) => {
            const isActive = timelineRange === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onTimelineRangeChange(preset.id)}
                className={cn(
                  "h-8 rounded-full border px-3 text-[11px] font-semibold transition",
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
      )}
    </div>
  );

  return (
    <ScreenSection
      title="Mapa emocional"
      description="Veja o ranking geral e os últimos dias para entender gatilhos e celebrações."
      actions={Actions}
    >
      {mapView === "ranking" ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {overallLeaderboard.slice(0, 6).map((entry, index) => {
            const barWidth = entry.percentage === 0 ? 0 : Math.max(entry.percentage, 10);
            return (
              <li
                key={entry.mood.id}
                className="flex flex-col gap-3 overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-4 shadow-soft transition-transform duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-elevated"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-sm font-semibold text-muted">#{index + 1}</span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-lg">
                    {entry.mood.emoji}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">{entry.mood.label}</span>
                    <span className="truncate text-xs text-muted">{entry.mood.tagline}</span>
                  </div>
                  <span className="ml-auto shrink-0 rounded-full bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted">
                    {entry.count}x
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-border/60">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      entry.count === 0 ? "bg-border/80" : "bg-primary"
                    )}
                    style={{ width: barWidth + "%" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-3">
          {timeline.map((item) => (
            <li
              key={item.date.toISOString()}
              className={cn(
                "flex items-center gap-3 overflow-hidden rounded-3xl border p-4 shadow-soft transition sm:hover:-translate-y-0.5 sm:hover:shadow-elevated",
                item.mood
                  ? "border-border/60 bg-background/95 hover:border-primary/30"
                  : "border-dashed border-border/60 bg-surface/95"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-lg">
                {item.mood ? item.mood.emoji : "?"}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-foreground">{item.label}</span>
                <span className="truncate text-xs text-muted">
                  {item.mood ? item.mood.tagline : "Aguardando registro"}
                </span>
              </div>
              {item.mood && (
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold", item.mood.badge)}>
                  {item.mood.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </ScreenSection>
  );
}
