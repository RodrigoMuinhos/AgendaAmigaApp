import { Link } from "react-router-dom";

export default function NotFoundScreen() {
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-muted">
      <h1 className="text-2xl font-semibold text-foreground">Página não encontrada</h1>
      <p>A página que você tentou acessar não existe ou foi movida.</p>
      <Link
        to="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover"
      >
        Voltar para o início
      </Link>
    </div>
  );
}

