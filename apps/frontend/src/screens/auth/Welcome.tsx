import { Link } from "react-router-dom";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Bem-vindo</span>
        <h2 className="text-2xl font-semibold text-foreground">Comece criando seu fluxo personalizado</h2>
        <p className="text-sm text-muted">
          Em poucos passos voce descreve quem cuida, quem recebe os cuidados e quais rotinas precisam de atencao. Depois disso a Agenda Amiga gera cards dinamicos e lembretes inteligentes.
        </p>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Fluxo guiado</span>
          <p className="text-xs text-muted">Cadastro da familia, tratamentos, agenda diaria e compartilhamento.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Passo 1: Tutor</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Passo 2: Familia</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Passo 3: Tratamentos</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Passo 4: Agenda</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          to="/login"
          className="flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Ja tenho conta
        </Link>
        <Link
          to="/cadastro"
          className="flex items-center justify-center rounded-2xl border border-primary/60 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          Criar nova conta
        </Link>
      </div>
      <p className="text-center text-xs text-muted">
        Continue para explorar a experiencia completa com cards destacaveis e interacoes pensadas para mobile.
      </p>
    </div>
  );
}
