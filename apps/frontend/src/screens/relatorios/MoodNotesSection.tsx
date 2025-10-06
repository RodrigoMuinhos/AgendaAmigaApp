import { ScreenSection } from "../../components/ui/Screen";
import type { MoodLog, MoodOption } from "../Relatorios";

type MoodNotesSectionProps = {
  latestNotes: MoodLog[];
  moods: MoodOption[];
  noteFormatter: Intl.DateTimeFormat;
};

export function MoodNotesSection({ latestNotes, moods, noteFormatter }: MoodNotesSectionProps) {
  return (
    <ScreenSection
      title="Observações que valem ouro"
      description="Leve para consultas os detalhes que mostram evolução e gatilhos importantes."
    >
      <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:'none'] [-ms-overflow-style:'none']">
        {latestNotes.map((log) => {
          const mood = moods.find((option) => option.id === log.moodId) ?? moods[0];
          return (
            <article
              key={`${log.dateISO}-${log.moodId}`}
              className="min-w-[240px] rounded-3xl border border-border/60 bg-background/95 px-4 py-4 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-elevated sm:min-w-[260px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {mood.emoji} {mood.label}
                </span>
                <span className="rounded-full bg-background/80 px-3 py-1 text-[11px] font-semibold text-muted">
                  {noteFormatter.format(new Date(log.dateISO))}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted">{log.note}</p>
            </article>
          );
        })}
      </div>
    </ScreenSection>
  );
}
