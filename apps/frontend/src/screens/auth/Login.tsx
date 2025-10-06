import { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LoginScreen() {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/app");
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Passo 0</span>
        <h2 className="text-2xl font-semibold text-foreground">Acesse sua conta</h2>
        <p className="text-sm text-muted">Sincronize preferencias, cards configurados e acompanhe tudo em qualquer dispositivo.</p>
      </div>
      <div className="flex flex-col gap-4">
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
        Entrar e abrir cards
      </button>
      <div className="text-sm text-muted">
        Ainda nao possui conta?{' '}
        <Link to="/cadastro" className="font-semibold text-primary hover:text-primary-hover">
          Crie agora
        </Link>
      </div>
    </form>
  );
}
