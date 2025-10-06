import { useEffect, useMemo, useRef, useState } from "react";
import { ScreenHeader, ScreenShell } from "../components/ui/Screen";
import { MoodTodaySection } from "./relatorios/MoodTodaySection";
import { MoodSummarySection } from "./relatorios/MoodSummarySection";
import { MoodMapSection } from "./relatorios/MoodMapSection";
import { MoodNotesSection } from "./relatorios/MoodNotesSection";

/** =========================
 * Tipos
 * ========================= */
export type MoodOption = {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  gradient: string;
  barGradient: string;
  badge: string;
  ring: string;
};

export type MoodLog = {
  dateISO: string;
  moodId: MoodOption["id"];
  note: string;
};

export type MoodScaleStep = {
  moodId: MoodOption["id"];
  score: number;
  mood: MoodOption;
};

export type MoodLeaderboardEntry = {
  mood: MoodOption;
  count: number;
  percentage: number;
};

/** =========================
 * Formatadores
 * ========================= */
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const noteFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });

/** =========================
 * Catálogo de humores (constante de UI)
 * ========================= */
const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "radiante",
    label: "Radiante",
    emoji: "\uD83C\uDF1E",
    tagline: "Energia alta e curiosidade",
    gradient: "from-amber-200/70 via-orange-100/40 to-white",
    barGradient: "from-amber-400 via-orange-400 to-orange-500",
    badge: "bg-amber-500/15 text-amber-700",
    ring: "ring-amber-400/40",
  },
  {
    id: "focado",
    label: "Concentrado",
    emoji: "\uD83C\uDFAF",
    tagline: "Calmo e atento às atividades",
    gradient: "from-sky-200/60 via-sky-100/30 to-white",
    barGradient: "from-sky-400 via-sky-400 to-sky-500",
    badge: "bg-sky-500/15 text-sky-700",
    ring: "ring-sky-400/40",
  },
  {
    id: "curioso",
    label: "Curioso",
    emoji: "\uD83D\uDD0D",
    tagline: "Explorando novidades com brilho nos olhos",
    gradient: "from-violet-200/60 via-violet-100/35 to-white",
    barGradient: "from-violet-400 via-violet-400 to-violet-500",
    badge: "bg-violet-500/15 text-violet-700",
    ring: "ring-violet-400/40",
  },
  {
    id: "sereno",
    label: "Tranquilo",
    emoji: "\uD83C\uDF43",
    tagline: "Rotina fluindo sem maiores desafios",
    gradient: "from-emerald-200/60 via-emerald-100/35 to-white",
    barGradient: "from-emerald-400 via-emerald-400 to-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700",
    ring: "ring-emerald-400/40",
  },
  {
    id: "afetuoso",
    label: "Afetuoso",
    emoji: "\uD83D\uDC96",
    tagline: "Abraços, toques e conexões genuínas",
    gradient: "from-rose-200/60 via-rose-100/35 to-white",
    barGradient: "from-rose-400 via-rose-400 to-rose-500",
    badge: "bg-rose-500/15 text-rose-700",
    ring: "ring-rose-400/40",
  },
  {
    id: "sensivel",
    label: "Sensível",
    emoji: "\uD83C\uDF19",
    tagline: "Precisando de acolhimento extra",
    gradient: "from-cyan-200/60 via-cyan-100/35 to-white",
    barGradient: "from-cyan-400 via-cyan-400 to-cyan-500",
    badge: "bg-cyan-500/15 text-cyan-700",
    ring: "ring-cyan-400/40",
  },
  {
    id: "agitado",
    label: "Agitado",
    emoji: "\u26A1",
    tagline: "Muita energia para direcionar",
    gradient: "from-orange-200/60 via-orange-100/35 to-white",
    barGradient: "from-orange-400 via-orange-400 to-orange-500",
    badge: "bg-orange-500/15 text-orange-700",
    ring: "ring-orange-400/40",
  },
];

/** =========================
 * Presets
 * ========================= */
const SUMMARY_PRESETS = [
  { id: "7d", label: "7 dias", copy: "os últimos 7 dias", hint: "Visão rápida da semana", days: 7 },
  { id: "30d", label: "30 dias", copy: "os últimos 30 dias", hint: "Tendência do último mês", days: 30 },
  { id: "all", label: "Histórico", copy: "todo o histórico", hint: "Acúmulo completo de registros", days: undefined },
] as const;

type SummaryPreset = (typeof SUMMARY_PRESETS)[number];
export type SummaryPresetId = SummaryPreset["id"];

const TIMELINE_PRESETS = [
  { id: 7, label: "7 dias" },
  { id: 14, label: "14 dias" },
  { id: 21, label: "21 dias" },
] as const;

const QUICK_NOTE_HINTS = [
  "Se acalmou com a playlist favorita.",
  "Precisou de um intervalo sensorial.",
  "Mostrou curiosidade extra durante a terapia.",
  "Compartilhou carinho espontâneo com a família.",
] as const;

const MOOD_SCALE: Array<{ moodId: MoodOption["id"]; score: number }> = [
  { moodId: "sensivel", score: 1 },
  { moodId: "afetuoso", score: 3 },
  { moodId: "sereno", score: 4 },
  { moodId: "curioso", score: 5 },
  { moodId: "focado", score: 7 },
  { moodId: "radiante", score: 9 },
  { moodId: "agitado", score: 10 },
];

/** =========================
 * Componente principal
 * ========================= */

type RelatoriosScreenProps = {
  logs: MoodLog[]; // vem da API — sem mocks aqui
};

export function RelatoriosScreen({ logs }: RelatoriosScreenProps) {
  const noteLimit = 280;
  const safeLogs = logs ?? [];

  const [selectedMoodId, setSelectedMoodId] = useState<MoodOption["id"]>(MOOD_OPTIONS[0].id);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [summaryRangeId, setSummaryRangeId] = useState<SummaryPresetId>("7d");
  const [mapView, setMapView] = useState<"ranking" | "timeline">("ranking");
  const [timelineRange, setTimelineRange] = useState<number>(TIMELINE_PRESETS[0].id);

  const moodScaleSteps = useMemo<MoodScaleStep[]>(() => {
    const lookup = new Map(MOOD_OPTIONS.map((mood) => [mood.id, mood] as const));
    return MOOD_SCALE.map((step) => ({
      ...step,
      mood: lookup.get(step.moodId) ?? MOOD_OPTIONS[0],
    }));
  }, []);

  const scoreByMood = useMemo(() => {
    const map = new Map<MoodOption["id"], number>();
    moodScaleSteps.forEach((step) => {
      if (!map.has(step.moodId) || (map.get(step.moodId) ?? -1) < step.score) {
        map.set(step.moodId, step.score);
      }
    });
    return map;
  }, [moodScaleSteps]);

  const [sliderScore, setSliderScore] = useState(() => scoreByMood.get(selectedMoodId) ?? moodScaleSteps[0].score);

  useEffect(() => {
    const mapped = scoreByMood.get(selectedMoodId);
    if (typeof mapped === "number") setSliderScore(mapped);
  }, [selectedMoodId, scoreByMood]);

  const minScaleValue = moodScaleSteps[0]?.score ?? 1;
  const maxScaleValue = moodScaleSteps[moodScaleSteps.length - 1]?.score ?? minScaleValue;

  const handleSliderChange = (value: number) => {
    const clamped = Math.min(maxScaleValue, Math.max(minScaleValue, value));
    setSliderScore(clamped);
    const nearest = moodScaleSteps.reduce((closest, step) => {
      const closestDelta = Math.abs(closest.score - clamped);
      const stepDelta = Math.abs(step.score - clamped);
      return stepDelta < closestDelta ? step : closest;
    }, moodScaleSteps[0]);
    if (nearest.moodId !== selectedMoodId) setSelectedMoodId(nearest.moodId);
  };

  const handleSelectScaleStep = (step: MoodScaleStep) => {
    setSelectedMoodId(step.moodId);
    setSliderScore(step.score);
  };

  const selectedMood = useMemo(
    () => MOOD_OPTIONS.find((mood) => mood.id === selectedMoodId) ?? MOOD_OPTIONS[0],
    [selectedMoodId]
  );

  const summaryPreset = SUMMARY_PRESETS.find((preset) => preset.id === summaryRangeId) ?? SUMMARY_PRESETS[0];
  const summaryCounts = useMemo(() => aggregateMoodCounts(safeLogs, summaryPreset.days), [safeLogs, summaryPreset]);
  const summaryTop = useMemo(() => getTopMood(summaryCounts), [summaryCounts]);
  const summaryLeaderboard = useMemo(() => buildLeaderboard(summaryCounts), [summaryCounts]);
  const summaryTotalEntries = useMemo(() => Object.values(summaryCounts).reduce((acc, v) => acc + v, 0), [summaryCounts]);

  const weeklyCounts = useMemo(() => aggregateMoodCounts(safeLogs, 7), [safeLogs]);
  const monthlyCounts = useMemo(() => aggregateMoodCounts(safeLogs, 30), [safeLogs]);
  const totalCounts = useMemo(() => aggregateMoodCounts(safeLogs), [safeLogs]);
  const totalEntries = useMemo(() => Object.values(totalCounts).reduce((acc, v) => acc + v, 0), [totalCounts]);

  const overallLeaderboard = useMemo(() => buildLeaderboard(totalCounts), [totalCounts]);
  const timeline = useMemo(() => buildTimeline(safeLogs, timelineRange), [safeLogs, timelineRange]);

  const latestNotes = useMemo(() => {
    return [...safeLogs]
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
      .slice(0, 5);
  }, [safeLogs]);

  const selectedMoodHistory = useMemo(() => buildMoodHistory(safeLogs, selectedMoodId, 3), [safeLogs, selectedMoodId]);

  useEffect(() => () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  }, []);

  const selectedStats = {
    week: weeklyCounts[selectedMoodId] ?? 0,
    month: monthlyCounts[selectedMoodId] ?? 0,
    total: totalCounts[selectedMoodId] ?? 0,
  };

  const summaryShare = summaryTotalEntries > 0 ? Math.round(((summaryCounts[selectedMoodId] ?? 0) / summaryTotalEntries) * 100) : 0;
  const overallShare = totalEntries > 0 ? Math.round(((totalCounts[selectedMoodId] ?? 0) / totalEntries) * 100) : 0;

  const handleSaveMood = () => {
    const trimmed = note.trim();

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    if (trimmed.length < 6) {
      setFeedback("Inclua uma observação rápida para enriquecer o registro.");
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 3500);
      return;
    }

    // TODO: enviar para a API (POST /moods) — manter o arquivo sem mocks
    setFeedback(`Humor ${selectedMood.label.toLowerCase()} registrado com carinho.`);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 3500);
    setNote("");
  };

  const handleAppendHint = (hint: string) => {
    setNote((current) => {
      const base = current.trim().length > 0 ? `${current.trim()} ${hint}` : hint;
      return base.length > noteLimit ? base.slice(0, noteLimit) : base;
    });
  };

  return (
    <ScreenShell>
      <ScreenHeader
        overline="Insights"
        title="Controle emocional com carinho"
        description="Revise tendências, registre como sua família está hoje e compartilhe avanços com quem acompanha a rotina."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="group relative flex items-center gap-2 rounded-2xl border border-transparent bg-primary px-5 py-2 text-xs font-semibold text-white shadow-elevated transition-transform duration-200 hover:-translate-y-0.5">
              Compartilhar PDF
            </button>
            <button className="group relative flex items-center gap-2 rounded-2xl border border-border/70 bg-surface/95 px-5 py-2 text-xs font-semibold text-muted shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-elevated">
              Exportar CSV
            </button>
          </div>
        }
      />

      <MoodTodaySection
        minScaleValue={minScaleValue}
        maxScaleValue={maxScaleValue}
        sliderScore={sliderScore}
        onSliderChange={handleSliderChange}
        moodScaleSteps={moodScaleSteps}
        selectedMoodId={selectedMoodId}
        onSelectScaleStep={handleSelectScaleStep}
        selectedMood={selectedMood}
        selectedStats={selectedStats}
        summaryPreset={summaryPreset}
        summaryShare={summaryShare}
        overallShare={overallShare}
        note={note}
        noteLimit={noteLimit}
        onNoteChange={setNote}
        onAppendHint={handleAppendHint}
        hints={QUICK_NOTE_HINTS}
        onSaveMood={handleSaveMood}
        feedback={feedback}
        selectedMoodHistory={selectedMoodHistory}
        noteFormatter={noteFormatter}
        moods={MOOD_OPTIONS}
      />

      <MoodSummarySection
        summaryRangeId={summaryRangeId}
        onSummaryRangeChange={setSummaryRangeId}
        summaryPresets={SUMMARY_PRESETS}
        summaryTop={summaryTop}
        summaryLeaderboard={summaryLeaderboard}
        summaryTotalEntries={summaryTotalEntries}
      />

      <MoodMapSection
        mapView={mapView}
        onChangeView={setMapView}
        timelineRange={timelineRange}
        onTimelineRangeChange={setTimelineRange}
        timelinePresets={TIMELINE_PRESETS}
        overallLeaderboard={overallLeaderboard}
        timeline={timeline}
      />

      <MoodNotesSection latestNotes={latestNotes} moods={MOOD_OPTIONS} noteFormatter={noteFormatter} />
    </ScreenShell>
  );
}

/** =========================
 * Helpers puros (sem mocks)
 * ========================= */
function aggregateMoodCounts(logs: MoodLog[], days?: number) {
  const baseline = Object.fromEntries(MOOD_OPTIONS.map((m) => [m.id, 0])) as Record<MoodOption["id"], number>;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const limitTimestamp = typeof days === "number" ? now.getTime() - days * 24 * 60 * 60 * 1000 : null;

  logs.forEach((log) => {
    const timestamp = new Date(log.dateISO).getTime();
    if (limitTimestamp !== null && timestamp < limitTimestamp) return;
    baseline[log.moodId] = (baseline[log.moodId] ?? 0) + 1;
  });

  return baseline;
}

function getTopMood(counts: Record<MoodOption["id"], number>) {
  const entries = Object.entries(counts) as Array<[MoodOption["id"], number]>;
  if (entries.length === 0) return null;
  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  if (total === 0) return null;

  const [bestId, bestCount] = entries.reduce<[MoodOption["id"], number]>((acc, cur) => (cur[1] > acc[1] ? cur : acc), entries[0]);
  const mood = MOOD_OPTIONS.find((o) => o.id === bestId) ?? MOOD_OPTIONS[0];
  return { mood, count: bestCount, percentage: (bestCount / total) * 100 };
}

function buildLeaderboard(counts: Record<MoodOption["id"], number>): MoodLeaderboardEntry[] {
  const total = Object.values(counts).reduce((acc, v) => acc + v, 0);
  return MOOD_OPTIONS
    .map((mood) => ({
      mood,
      count: counts[mood.id] ?? 0,
      percentage: total === 0 ? 0 : ((counts[mood.id] ?? 0) / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildTimeline(logs: MoodLog[], days: number) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    const moodLog = logs.find((log) => isSameDay(new Date(log.dateISO), date));
    const mood = moodLog ? MOOD_OPTIONS.find((o) => o.id === moodLog.moodId) ?? null : null;

    return {
      date,
      mood,
      label: `${capitalize(dayFormatter.format(date))} · ${dateFormatter.format(date)}`,
    };
  });
}

function buildMoodHistory(logs: MoodLog[], moodId: MoodOption["id"], limit: number) {
  return logs
    .filter((log) => log.moodId === moodId)
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
    .slice(0, limit);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function capitalize(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
