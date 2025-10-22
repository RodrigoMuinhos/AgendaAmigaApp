import { HeartHandshake, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../../components/ui/button';

type HeaderCriancasProps = {
  onAdd: () => void;
  actions?: ReactNode;
};

export function HeaderCriancas({ onAdd, actions }: HeaderCriancasProps) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
            <UsersRound className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">Criancas cadastradas</h1>
            <p className="text-sm text-[rgba(var(--color-text),0.65)]">Menos campos, linguagem simples.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[rgba(var(--color-text),0.7)]">
          <HeartHandshake className="h-5 w-5 text-[rgb(var(--color-primary))]" aria-hidden />
          <span>Conecte familias ao cuidado integral com dados essenciais e faceis de atualizar.</span>
        </div>
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={onAdd}>
          Adicionar crianca
        </Button>
        {actions}
      </div>
    </header>
  );
}
