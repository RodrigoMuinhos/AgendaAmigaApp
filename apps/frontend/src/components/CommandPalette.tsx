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
import { cn } from "../utils/cn";
import { asArray, safeFilter } from "../core/utils/arrays";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const safeItems = useMemo(() => asArray<CommandPaletteItem>(items), [items]);
  
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    close: () => {
      setIsOpen(false);
      setQuery("");
      setActiveIndex(0);
    },
  }));

  const filteredItems = useMemo(() => {
    if (!query) return safeItems;

    const searchTerms = query.toLowerCase().split(" ");
    return safeFilter<CommandPaletteItem>(safeItems, (item) => {
      const searchableText = [
        item.label,
        item.description,
        ...(item.keywords || []),
      ].join(" ").toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });
  }, [safeItems, query]);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, CommandPaletteItem[]>();
    
    for (const item of filteredItems) {
      const group = groups.get(item.group) || [];
      group.push(item);
      groups.set(item.group, group);
    }

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredItems]);

  const flattenedItems = useMemo(() => {
    return groupedItems.flatMap(([groupLabel, items]) =>
      items.map((item) => ({ ...item, groupLabel }))
    );
  }, [groupedItems]);

  const handleSelect = useCallback(
    (item: CommandPaletteItem) => {
      if (item.onSelect) {
        item.onSelect();
      } else if (item.to) {
        onNavigate(item.to);
      }
      setIsOpen(false);
      setQuery("");
      setActiveIndex(0);
    },
    [onNavigate]
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) =>
          index < flattenedItems.length - 1 ? index + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) =>
          index > 0 ? index - 1 : flattenedItems.length - 1
        );
      } else if (event.key === "Enter" && flattenedItems[activeIndex]) {
        event.preventDefault();
        handleSelect(flattenedItems[activeIndex]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        setQuery("");
        setActiveIndex(0);
      }
    },
    [activeIndex, flattenedItems, handleSelect]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;

    const activeElement = listRef.current.querySelector(
      '[data-active="true"]'
    ) as HTMLElement;

    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative mx-auto max-w-2xl rounded-2xl border border-border bg-surface shadow-elevated">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando ou pesquise..."
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder-muted outline-none"
        />

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {groupedItems.map(([group, items]) => (
            <div key={group}>
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                {group}
              </div>
              <div className="mb-2">
                {items.map((item) => {
                  const isActive =
                    flattenedItems[activeIndex]?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      data-active={isActive}
                      className={cn(
                        "flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left text-sm transition",
                        isActive
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-primary/10"
                      )}
                    >
                      <span className="font-medium">{item.label}</span>
                      {item.description && (
                        <span
                          className={cn(
                            "text-xs",
                            isActive ? "text-white/80" : "text-muted"
                          )}
                        >
                          {item.description}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
