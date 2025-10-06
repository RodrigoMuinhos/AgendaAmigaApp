import { useEffect, useMemo, useState } from "react";
import { Panel } from "../components/DashboardCards";
import { useLinksCompartilhamento } from "../hooks/useDashboard";
import { useToast } from "../components/Toast";
import { getStoredTheme, getSystemTheme, persistTheme, type ThemeMode } from "../theme/tokens";

const LANGUAGE_STORAGE_KEY = "agenda-amiga:language";
const WHATSAPP_STORAGE_KEY = "agenda-amiga:whatsapp";

const languages = [
  { id: "pt-BR", label: "Português" },
  { id: "en-US", label: "Inglês" },
];

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export default function ConfigScreen() {
  const initialTheme: ThemeMode = useMemo(() => {
    if (typeof document !== "undefined") {
      return (getStoredTheme() ?? (document.documentElement.getAttribute("data-theme") as ThemeMode) ?? getSystemTheme());
    }
    return "light";
  }, []);

  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "pt-BR";
    }
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "pt-BR";
  });
  const [whatsappEnabled, setWhatsappEnabled] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(WHATSAPP_STORAGE_KEY) === "true";
  });

  const { data: links = [] } = useLinksCompartilhamento();
  const { pushToast } = useToast();

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WHATSAPP_STORAGE_KEY, String(whatsappEnabled));
    }
  }, [whatsappEnabled]);

  const shareBaseUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share`;
    }
    return "https://agendaamiga.app/share";
  }, []);

  const handleCopyLink = async (token: string) => {
    const url = `${shareBaseUrl}/${token}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      pushToast({ title: "Link copiado", description: "Cole para compartilhar", variant: "success" });
    } catch (error) {
      pushToast({
        title: "Não foi possível copiar",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "warning",
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted">Personalize a experiência, idioma e integrações</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Tema" description="Escolha entre claro e escuro">
          <div className="flex items-center gap-3">
            <label className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition ${
              theme === "light" ? "border-primary text-primary" : "border-border text-muted"
            }`}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === "light"}
                onChange={() => setTheme("light")}
              />
              Claro
            </label>
            <label className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition ${
              theme === "dark" ? "border-primary text-primary" : "border-border text-muted"
            }`}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === "dark"}
                onChange={() => setTheme("dark")}
              />
              Escuro
            </label>
          </div>
        </Panel>

        <Panel title="Idioma" description="Define o idioma preferido da interface">
          <div className="flex items-center gap-3">
            {languages.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition ${
                  language === option.id ? "border-primary text-primary" : "border-border text-muted"
                }`}
              >
                <input
                  type="radio"
                  name="language"
                  value={option.id}
                  checked={language === option.id}
                  onChange={() => setLanguage(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Integrações" description="Conecte-se com canais externos">
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm">
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp</h3>
              <p className="text-xs text-muted">Enviar alertas automáticos pelo WhatsApp Business</p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={whatsappEnabled}
                onChange={(event) => setWhatsappEnabled(event.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-xs text-muted">Ativar</span>
            </label>
          </div>
        </Panel>

        <Panel title="Links seguros" description="Gerencie os links já gerados">
          {links.length === 0 ? (
            <p className="text-sm text-muted">Nenhum link ativo no momento.</p>
          ) : (
            <ul className="flex flex-col gap-3 text-sm">
              {links.map((link) => (
                <li key={link.id} className="rounded-lg border border-border px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{link.id}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      expira {shortDateFormatter.format(new Date(link.expiraEm))}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">Escopo: {link.escopo}</p>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(link.token)}
                    className="mt-2 rounded-md border border-border px-3 py-1 text-xs text-muted transition hover:border-primary hover:text-primary"
                  >
                    Copiar link
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

