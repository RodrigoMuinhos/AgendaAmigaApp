import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export function SignupScreen() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/onboarding");
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Passo 1</span>
        <h2 className="text-2xl font-semibold text-foreground">Vamos personalizar sua conta</h2>
        <p className="text-sm text-muted">
          Com poucos dados definimos o tom da experiencia. Depois do cadastro voce segue para o fluxo guiado com cartas interativas.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-foreground">
          Nome completo
          <input
            type="text"
            required
            className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm focus:border-primary"
            placeholder="Nome e sobrenome"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-foreground">
          Email
          <input
            type="email"
            required
            className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm focus:border-primary"
            placeholder="seu@email.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-foreground">
          Telefone
          <input
            type="tel"
            className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm focus:border-primary"
            placeholder="(00) 00000-0000"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-foreground">
          Senha
          <input
            type="password"
            required
            className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm focus:border-primary"
            placeholder="******"
          />
        </label>
      </div>
      <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover">
        Criar conta e iniciar onboarding
      </button>
    </form>
  );
}
