import { ResumoVacinacao } from '../../selectors';

type ResumoCoberturaProps = {
  dados: ResumoVacinacao;
};

const cores = {
  aplicadas: 'bg-emerald-500',
  proximas: 'bg-amber-400',
  pendentes: 'bg-rose-500',
} as const;

export function ResumoCobertura({ dados }: ResumoCoberturaProps) {
  const total = Math.max(dados.totalDoses, 1);

  const itens = [
    { chave: 'aplicadas', rotulo: 'Aplicadas', valor: dados.aplicadas, classe: cores.aplicadas },
    { chave: 'proximas', rotulo: 'Proximas', valor: dados.proximas, classe: cores.proximas },
    { chave: 'pendentes', rotulo: 'Pendentes', valor: dados.pendentes, classe: cores.pendentes },
  ];

  return (
    <section className="rounded-3xl border border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Resumo de cobertura</h3>
        <p className="text-xs text-[rgba(var(--color-text),0.65)]">
          Total previsto no calendario nacional: {dados.totalDoses} doses
        </p>
      </header>
      <div className="space-y-3">
        {itens.map((item) => {
          const percentual = Math.min(100, Math.round((item.valor / total) * 100));
          return (
            <div key={item.chave} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[rgba(var(--color-text),0.7)]">{item.rotulo}</span>
                <span className="text-[rgb(var(--color-text))]">
                  {item.valor} ({percentual}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(var(--color-border),0.2)]">
                <div
                  className={`${item.classe} h-full transition-all`}
                  style={{ width: `${percentual}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
