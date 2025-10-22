import { Activity, Ruler, Scale, CircleDot, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../../../components/ui/button';
import type { MedidaCrescimentoAnalise } from '../../utils/crescimento';

type ResumoCrescimentoProps = {
  destaque?: MedidaCrescimentoAnalise;
  onEditar?: () => void;
};

export function ResumoCrescimento({ destaque, onEditar }: ResumoCrescimentoProps) {
  if (!destaque) {
    return (
      <section className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Resumo de medidas</h3>
            <p className="text-xs text-[rgba(var(--color-text),0.7)]">Nenhuma medida registrada ate agora.</p>
          </div>
          {onEditar ? (
            <Button size="sm" variant="ghost" onClick={onEditar}>
              Adicionar medidas
            </Button>
          ) : null}
        </header>
      </section>
    );
  }

  const { registro, referencia, peso, estatura, perimetro, imc, statusImc, score } = destaque;
  const dataFormatada = new Date(registro.dataISO).toLocaleDateString("pt-BR");

  return (
    <section className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Resumo de medidas</h3>
          <p className="text-xs text-[rgba(var(--color-text),0.7)]">Ultima atualizacao em {dataFormatada}</p>
        </div>
        {onEditar ? (
          <Button size="sm" variant="secondary" onClick={onEditar}>
            Editar ultima medida
          </Button>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <BlocoResumo
          titulo="Peso"
          valor={formatar(registro.pesoKg, "kg")}
          media={`Media: ${formatar(referencia.pesoMedioKg, "kg")}`}
          status={formatarStatus(peso)}
          icone={<Scale className="h-5 w-5" aria-hidden />}
        />
        <BlocoResumo
          titulo="Estatura"
          valor={formatar(registro.estaturaCm, "cm")}
          media={`Media: ${formatar(referencia.estaturaMediaCm, "cm")}`}
          status={formatarStatus(estatura)}
          icone={<Ruler className="h-5 w-5" aria-hidden />}
        />
        <BlocoResumo
          titulo="Perimetro cefalico"
          valor={formatar(registro.perimetroCefalicoCm, "cm")}
          media={`Media: ${formatar(referencia.perimetroCefalicoCm, "cm")}`}
          status={formatarStatus(perimetro)}
          icone={<CircleDot className="h-5 w-5" aria-hidden />}
        />
        <BlocoResumo
          titulo="IMC"
          valor={formatar(imc)}
          media="Classificacao"
          status={statusImc === "indefinido" ? "Nao calculado" : traduzirStatus(statusImc)}
          icone={<Activity className="h-5 w-5" aria-hidden />}
        />
        <BlocoResumo
          titulo="Score MP"
          valor={`${score}/100`}
          media="Referencia Ministerio da Saude"
          status={avaliacaoScore(score)}
          icone={<Trophy className="h-5 w-5" aria-hidden />}
        />
      </div>
    </section>
  );
}

type BlocoResumoProps = {
  titulo: string;
  valor: string;
  media: string;
  status: string;
  icone: React.ReactNode;
};

function BlocoResumo({ titulo, valor, media, status, icone }: BlocoResumoProps) {
  return (
    <div className="rounded-2xl bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-xs uppercase text-[rgba(var(--color-text),0.65)]">
        {icone}
        {titulo}
      </span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text))]">{valor}</span>
      <span className="block text-xs text-[rgba(var(--color-text),0.6)]">{media}</span>
      <span className="mt-1 block text-xs font-semibold text-[rgba(var(--color-text),0.75)]">{status}</span>
    </div>
  );
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

