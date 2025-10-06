import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.2fr,1fr] lg:px-8">
        <section className="hidden flex-col gap-6 rounded-3xl border border-border/60 bg-surface p-10 shadow-elevated lg:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">AA</div>
          <h1 className="text-3xl font-semibold text-foreground lg:text-4xl">Agenda Amiga</h1>
          <p className="text-base text-muted lg:text-lg">
            Acompanhe rotinas de medicamento e bem-estar da sua familia em um fluxo feito para tutores, cuidadores e profissionais.
          </p>
          <ul className="space-y-3 text-sm text-foreground/80">
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /><span>Cadastro simples da familia e dos tratamentos.</span></li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /><span>Cards dinamicos para monitorar doses, agendas e alertas.</span></li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /><span>Compartilhamento inteligente com cuidadores externos.</span></li>
          </ul>
          <div className="mt-auto text-xs uppercase tracking-[0.3em] text-muted">Fluxo guiado passo a passo</div>
        </section>
        <div className="relative flex flex-col gap-6 rounded-[32px] border border-border/60 bg-surface/95 px-6 py-10 shadow-elevated backdrop-blur-sm sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
