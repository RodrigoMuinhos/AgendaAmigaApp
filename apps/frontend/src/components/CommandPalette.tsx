import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type CommandPaletteItem = {
  id: string;
  label: string;
  group: string;
  description?: string;
  to?: string;
  keywords?: string[];
  onSelect?: () => void;
};

export type CommandPaletteHandle = {
  open: () => void;
  close: () => void;
};

type CommandPaletteProps = {
  items: CommandPaletteItem[];
  onNavigate: (to: string) => void;
};

type FlattenedItem = CommandPaletteItem & { groupLabel: string };

export const CommandPalette = forwardRef<CommandPaletteHandle, CommandPaletteProps>(function CommandPalette(
  { items, onNavigate },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  useImperativeHandle(ref, () => ({ open, close }), [open, close]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((value) => !value);
      }
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery("");
    setActiveIndex(0);
    return undefined;
  }, [isOpen]);

  const results = useMemo(() => filterItems(items, query), [items, query]);

  useEffect(() => {
    if (results.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= results.length) {
      setActiveIndex(results.length - 1);
    }
  }, [activeIndex, results]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    const active = scrollRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, results]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const item = results[activeIndex];
        if (item) {
          executeItem(item, onNavigate, close);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    },
    [activeIndex, close, onNavigate, results]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-16 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
        <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
          <input
            ref={inputRef}
            className="flex-1 border-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            placeholder="Buscar pacientes, tratamentos ou rotas…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            aria-label="Buscar"
          />
          <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted">Esc</kbd>
        </div>
        <div ref={scrollRef} className="max-h-80 overflow-y-auto">
          {results.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted">Nenhum resultado para "{query}"</p>
          )}
          {results.map((item, index) => (
            <button
              key={item.id}
              data-index={index}
              onClick={() => executeItem(item, onNavigate, close)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition ${
                index === activeIndex ? "bg-primary/10" : "hover:bg-primary/5"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{item.label}</span>
                {item.description && <span className="text-xs text-muted">{item.description}</span>}
              </div>
              <span className="ml-auto text-xs uppercase tracking-wide text-muted">{item.groupLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

function executeItem(item: FlattenedItem, onNavigate: (to: string) => void, close: () => void) {
  if (item.to) {
    onNavigate(item.to);
  }
  item.onSelect?.();
  close();
}

function filterItems(items: CommandPaletteItem[], query: string): FlattenedItem[] {
  const normalized = query.trim().toLowerCase();
  const flatten: FlattenedItem[] = [];

  items.forEach((item) => {
    if (!normalized) {
      flatten.push({ ...item, groupLabel: item.group });
      return;
    }

    const haystack = [item.label, item.description, ...(item.keywords ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (haystack.includes(normalized)) {
      flatten.push({ ...item, groupLabel: item.group });
    }
  });

  return flatten;
}

