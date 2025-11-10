import { Activity, CircleDot, Ruler, Scale, Trash2, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../../../components/ui/button';
import type { MedidaCrescimentoAnalise } from '../../utils/crescimento';

type ResumoCrescimentoProps = {
  analises: MedidaCrescimentoAnalise[];
  onEditar?: () => void;
  onRemover?: (registro: MedidaCrescimentoAnalise['registro']) => void;
  editarLabel?: string;
  novoRegistroLabel?: string;
  limite?: number;
};

export function ResumoCrescimento({
  analises,
  onEditar,
  onRemover,
  editarLabel,
  novoRegistroLabel,
  limite,
}: ResumoCrescimentoProps) {
  const baseLista = limite ? analises.slice(0, limite) : [...analises];
  const lista = [...baseLista].sort(
    (a, b) => new Date(b.registro.dataISO).getTime() - new Date(a.registro.dataISO).getTime(),
  );

  if (!lista.length) {
    return (
      <section className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Painel de crescimento</h3>
            <p className="text-xs text-[rgba(var(--color-text),0.7)]">Nenhuma medida registrada ate agora.</p>
          </div>
          {onEditar ? (
            <Button size="sm" variant="ghost" onClick={onEditar}>
              {novoRegistroLabel ?? 'Adicionar medidas'}
            </Button>
          ) : null}
        </header>
      </section>
    );
  }

  const ultimaData = lista[0]?.registro?.dataISO;
  const ultimaLabel = ultimaData ? new Date(ultimaData).toLocaleDateString('pt-BR') : undefined;

  return (
    <section className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Painel de crescimento</h3>
          {ultimaLabel ? (
            <p className="text-xs text-[rgba(var(--color-text),0.7)]">Ultima atualizacao em {ultimaLabel}</p>
          ) : null}
        </div>
        {onEditar ? (
          <Button size="sm" variant="secondary" onClick={onEditar}>
            {editarLabel ?? 'Editar ultima medida'}
          </Button>
        ) : null}
      </header>

      <div className="space-y-4">
        {lista.map((analise, index) => (
          <RegistroResumo key={`${analise.registro.dataISO}-${index}`} analise={analise} onRemover={onRemover} />
        ))}
      </div>
    </section>
  );
}

type RegistroResumoProps = {
  analise: MedidaCrescimentoAnalise;
  onRemover?: (registro: MedidaCrescimentoAnalise['registro']) => void;
};

function RegistroResumo({ analise, onRemover }: RegistroResumoProps) {
  const { registro, referencia, idadeMeses, peso, estatura, perimetro, imc, statusImc, score } = analise;
  const dataFormatada = new Date(registro.dataISO).toLocaleDateString('pt-BR');
  const idadeFormatada = formatarIdade(idadeMeses);

  return (
    <article className="rounded-2xl border border-[rgba(var(--color-border),0.25)] bg-[rgba(var(--color-surface),0.95)] p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--color-text))]">{dataFormatada}</p>
          <p className="text-xs text-[rgba(var(--color-text),0.65)]">Idade: {idadeFormatada}</p>
        </div>
        {onRemover ? (
          <Button
            type="button"
            variant="ghost"
            className="h-9 w-9 px-0 py-0"
            aria-label="Remover medida"
            title="Remover medida"
            onClick={() => onRemover(registro)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </div>
      <div className="grid gap-3 text-xs text-[rgba(var(--color-text),0.7)] sm:grid-cols-2 lg:grid-cols-3">
        <LinhaResumo
          titulo="Peso"
          icone={<Scale className="h-3.5 w-3.5" aria-hidden />}
          valor={formatar(registro.pesoKg, 'kg')}
          media={`Media esperada: ${formatar(referencia.pesoMedioKg, 'kg')}`}
          status={formatarStatus(peso)}
        />
        <LinhaResumo
          titulo="Estatura"
          icone={<Ruler className="h-3.5 w-3.5" aria-hidden />}
          valor={formatar(registro.estaturaCm, 'cm')}
          media={`Media esperada: ${formatar(referencia.estaturaMediaCm, 'cm')}`}
          status={formatarStatus(estatura)}
        />
        <LinhaResumo
          titulo="Perimetro cefalico"
          icone={<CircleDot className="h-3.5 w-3.5" aria-hidden />}
          valor={formatar(registro.perimetroCefalicoCm, 'cm')}
          media={`Media esperada: ${formatar(referencia.perimetroCefalicoCm, 'cm')}`}
          status={formatarStatus(perimetro)}
        />
        <LinhaResumo
          titulo="IMC"
          icone={<Activity className="h-3.5 w-3.5" aria-hidden />}
          valor={formatar(imc)}
          media="Classificacao"
          status={statusImc === 'indefinido' ? 'Nao calculado' : traduzirStatus(statusImc)}
        />
        <LinhaResumo
          titulo="Score MS"
          icone={<Trophy className="h-3.5 w-3.5" aria-hidden />}
          valor={`${score}/100`}
          media="Referencia Ministerio da Saude"
          status={avaliacaoScore(score)}
        />
      </div>
    </article>
  );
}

type LinhaResumoProps = {
  titulo: string;
  valor: string;
  media: string;
  status: string;
  icone: React.ReactNode;
};

function LinhaResumo({ titulo, valor, media, status, icone }: LinhaResumoProps) {
  return (
    <div className="rounded-xl bg-[rgba(var(--color-primary),0.06)] px-3 py-2">
      <p className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wide text-[rgba(var(--color-text),0.55)]">
        {icone}
        {titulo}
      </p>
      <p className="text-sm font-semibold text-[rgb(var(--color-text))]">{valor}</p>
      <p className="text-[0.7rem] text-[rgba(var(--color-text),0.6)]">{media}</p>
      <p className="text-[0.7rem] font-semibold text-[rgba(var(--color-text),0.75)]">{status}</p>
    </div>
  );
}

function formatarIdade(idadeMeses: number) {
  if (!Number.isFinite(idadeMeses)) return 'Idade nao informada';
  const mesesInteiros = Math.max(0, Math.round(idadeMeses));
  const anos = Math.floor(mesesInteiros / 12);
  const meses = mesesInteiros % 12;
  if (anos === 0) {
    return meses === 0 ? 'Recem-nascido' : `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
  if (meses === 0) {
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  }
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

function formatar(valor?: number, unidade?: string) {
  if (valor === undefined || Number.isNaN(valor)) return "Nao informado";
  const formatado = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return unidade ? `${formatado} ${unidade}` : formatado;
}

function formatarStatus(info: { status: string; diferenca?: number } | undefined) {
  if (!info || info.status === "indefinido") return "Sem avaliacao";
  const descricao = traduzirStatus(info.status);
  if (info.diferenca === undefined || Number.isNaN(info.diferenca)) {
    return descricao;
  }
  const sinal = info.diferenca > 0 ? "+" : "";
  return `${descricao} (${sinal}${info.diferenca.toFixed(1)})`;
}

function traduzirStatus(status: string) {
  switch (status) {
    case "acima":
      return "Acima da media";
    case "abaixo":
      return "Abaixo da media";
    case "dentro":
      return "Dentro da faixa esperada";
    default:
      return "Nao avaliado";
  }
}

function avaliacaoScore(score: number) {
  if (score >= 90) return "Dentro do esperado";
  if (score >= 70) return "Atencao: monitorar";
  if (score > 0) return "Acao recomendada";
  return "Sem avaliacao";
}
