import { useMemo, useState } from 'react';
import { cn } from '../../../../core/utils/cn';
import type { MedidaCrescimentoAnalise } from '../../utils/crescimento';

type CrescimentoChartProps = {
  analises: MedidaCrescimentoAnalise[];
};

type Point = { x: number; y: number };

type MetricId = 'peso' | 'estatura' | 'perimetro' | 'imc';

type MetricConfig = {
  id: MetricId;
  label: string;
  unidade: string;
  eixoY: string;
  child: (item: MedidaCrescimentoAnalise) => number | undefined;
  reference: (item: MedidaCrescimentoAnalise) => number | undefined;
  difference?: (item: MedidaCrescimentoAnalise) => number | undefined;
};

const metricOptions: MetricConfig[] = [
  {
    id: 'peso',
    label: 'Peso',
    unidade: 'kg',
    eixoY: 'Peso (kg)',
    child: (item) => item.registro.pesoKg ?? undefined,
    reference: (item) => item.referencia.pesoMedioKg,
    difference: (item) => item.peso?.diferenca,
  },
  {
    id: 'estatura',
    label: 'Estatura',
    unidade: 'cm',
    eixoY: 'Estatura (cm)',
    child: (item) => item.registro.estaturaCm ?? undefined,
    reference: (item) => item.referencia.estaturaMediaCm,
    difference: (item) => item.estatura?.diferenca,
  },
  {
    id: 'perimetro',
    label: 'Perimetro cefalico',
    unidade: 'cm',
    eixoY: 'Perimetro cefalico (cm)',
    child: (item) => item.registro.perimetroCefalicoCm ?? undefined,
    reference: (item) => item.referencia.perimetroCefalicoCm,
    difference: (item) => item.perimetro?.diferenca,
  },
  {
    id: 'imc',
    label: 'IMC',
    unidade: 'kg/m2',
    eixoY: 'IMC (kg/m2)',
    child: (item) => item.imc,
    reference: (item) => {
      const alturaCm = item.referencia.estaturaMediaCm;
      if (!alturaCm) return undefined;
      const alturaM = alturaCm / 100;
      if (!alturaM) return undefined;
      return item.referencia.pesoMedioKg / (alturaM * alturaM);
    },
    difference: (item) => {
      const alturaCm = item.referencia.estaturaMediaCm;
      const childImc = item.imc;
      if (!childImc || !alturaCm) return undefined;
      const alturaM = alturaCm / 100;
      if (!alturaM) return undefined;
      const refImc = item.referencia.pesoMedioKg / (alturaM * alturaM);
      return childImc - refImc;
    },
  },
];

const viewModes = [
  { id: 'valor', label: 'Valores absolutos' },
  { id: 'diferenca', label: 'Diferenca vs media' },
] as const;

type ViewMode = (typeof viewModes)[number]['id'];

export function CrescimentoChart({ analises }: CrescimentoChartProps) {
  const [metricId, setMetricId] = useState<MetricId>('peso');
  const [viewMode, setViewMode] = useState<ViewMode>('valor');

  if (!analises.length) {
    return null;
  }

  const ordenadas = useMemo(
    () => [...analises].sort((a, b) => a.idadeMeses - b.idadeMeses),
    [analises],
  );

  const metric = metricOptions.find((option) => option.id === metricId) ?? metricOptions[0];

  const dataset = useMemo(
    () =>
      ordenadas.map((item) => {
        const childValue = metric.child(item);
        const referenceValue = metric.reference(item);
        const differenceValue =
          metric.difference?.(item) ??
          (childValue !== undefined && referenceValue !== undefined ? childValue - referenceValue : undefined);
        return {
          idade: item.idadeMeses,
          childValue,
          referenceValue,
          differenceValue,
        };
      }),
    [metric, ordenadas],
  );

  const comMedidas = dataset.filter((item) => item.childValue !== undefined);
  const filtered =
    viewMode === 'valor'
      ? comMedidas
      : comMedidas.filter((item) => item.differenceValue !== undefined);

  if (!filtered.length) {
    return (
      <div className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 text-sm text-[rgba(var(--color-text),0.65)] shadow-soft">
        Nenhuma medida registrada para este indicador.
      </div>
    );
  }

  const maxIdade = Math.max(filtered[filtered.length - 1].idade, 12);

  const childValues =
    viewMode === 'valor'
      ? filtered.map((item) => item.childValue ?? 0)
      : filtered.map((item) => item.differenceValue ?? 0);

  const referenceValues =
    viewMode === 'valor'
      ? filtered
          .map((item) => item.referenceValue)
          .filter((value): value is number => value !== undefined)
      : [0];

  const valoresParaEscala =
    viewMode === 'valor' ? [...childValues, ...referenceValues] : [...childValues, 0];

  let minValor = Math.min(...valoresParaEscala);
  let maxValor = Math.max(...valoresParaEscala);

  if (viewMode === 'diferenca') {
    minValor = Math.min(minValor, 0);
    maxValor = Math.max(maxValor, 0);
  }

  if (minValor === maxValor) {
    minValor -= 1;
    maxValor += 1;
  }

  const margem = (maxValor - minValor) * 0.1;
  minValor -= margem;
  maxValor += margem;

  const childPoints = filtered.map((item) =>
    normalizarPonto(item.idade, (viewMode === 'valor' ? item.childValue : item.differenceValue) ?? 0, {
      maxIdade,
      minValor,
      maxValor,
    }),
  );

  const referencePoints =
    viewMode === 'valor'
      ? filtered
          .map((item) => {
            if (item.referenceValue === undefined) return undefined;
            return normalizarPonto(item.idade, item.referenceValue, {
              maxIdade,
              minValor,
              maxValor,
            });
          })
          .filter((point): point is Point => Boolean(point))
      : [];

  const baselineValue = viewMode === 'diferenca' ? 0 : minValor;
  const baseline = normalizarPonto(0, baselineValue, { maxIdade, minValor, maxValor }).y;

  const eixoX = Array.from({ length: Math.floor(maxIdade / 6) + 1 }, (_, index) => index * 6);

  const childColor = 'rgba(37,99,235,1)';
  const childFill = 'rgba(59,130,246,0.25)';
  const referenceColor = 'rgba(16,185,129,0.8)';
  const differenceColor = 'rgba(249,115,22,0.85)';
  const gridColor = 'rgba(148,163,184,0.2)';

  const titulo = `Grafico de ${metric.label.toLowerCase()} x idade`;
  const legendaPrincipal =
    viewMode === 'valor'
      ? [
          { label: 'Medidas registradas', color: childColor },
          { label: 'Curva de referência', color: referenceColor },
        ]
      : [
          { label: 'Diferença em relaçÃ£o Ã  média', color: differenceColor },
          { label: 'Linha base (0)', color: 'rgba(15,118,110,0.6)' },
        ];

  return (
    <div className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">{titulo}</h3>
          <span className="text-xs text-[rgba(var(--color-text),0.6)]">Escala aproximada</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {metricOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMetricId(option.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition',
                option.id === metricId
                  ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white'
                  : 'border-[rgba(var(--color-border),0.5)] bg-transparent text-[rgba(var(--color-text),0.7)] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {viewModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setViewMode(mode.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              viewMode === mode.id
                ? 'border-[rgba(59,130,246,0.6)] bg-[rgba(59,130,246,0.15)] text-[rgb(var(--color-primary))]'
                : 'border-[rgba(var(--color-border),0.4)] bg-transparent text-[rgba(var(--color-text),0.6)] hover:border-[rgba(59,130,246,0.5)] hover:text-[rgb(var(--color-primary))]',
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 100 60" className="h-60 w-full">
        <defs>
          <linearGradient id="serie-crianca" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={viewMode === 'valor' ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.25)'} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="60" fill="rgba(15,23,42,0.02)" />

        {eixoX.map((mes) => {
          const { x } = normalizarPonto(mes, minValor, { maxIdade, minValor, maxValor });
          return (
            <line key={`grid-${mes}`} x1={x} y1={6} x2={x} y2={54} stroke={gridColor} strokeDasharray="1.5 3" />
          );
        })}

        {viewMode === 'diferenca' ? (
          <line x1={6} x2={94} y1={baseline} y2={baseline} stroke="rgba(15,118,110,0.6)" strokeDasharray="3 3" />
        ) : null}

        {viewMode === 'valor' && referencePoints.length ? (
          <polyline
            fill="none"
            stroke={referenceColor}
            strokeWidth="0.9"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={referencePoints.map(({ x, y }) => `${x},${y}`).join(' ')}
          />
        ) : null}

        <path
          d={gerarArea(childPoints, baseline)}
          fill="url(#serie-crianca)"
          stroke={viewMode === 'valor' ? childColor : differenceColor}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {childPoints.map((ponto, index) => (
          <circle
            key={`ponto-${index}`}
            cx={ponto.x}
            cy={ponto.y}
            r="1.6"
            fill={viewMode === 'valor' ? childColor : differenceColor}
            stroke="white"
            strokeWidth="0.4"
          />
        ))}

        <text x="6" y="10" className="fill-[rgba(var(--color-text),0.6)] text-[2.4px]">
          {metric.eixoY}
        </text>
        <text x="78" y="58" className="fill-[rgba(var(--color-text),0.6)] text-[2.4px]">
          Idade (meses)
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[rgba(var(--color-text),0.6)]">
        {legendaPrincipal.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span className="h-2 w-6 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

type NormalizarContexto = { maxIdade: number; minValor: number; maxValor: number };

function normalizarPonto(idadeMeses: number, valor: number, contexto: NormalizarContexto): Point {
  const { maxIdade, minValor, maxValor } = contexto;
  const paddingX = 6;
  const paddingY = 6;
  const largura = 100 - paddingX * 2;
  const altura = 60 - paddingY * 2;

  const idadeSafe = Math.max(0, Math.min(maxIdade, idadeMeses));
  const valorSafe = Math.max(minValor, Math.min(maxValor, valor));

  const x = paddingX + (idadeSafe / (maxIdade || 1)) * largura;
  const y = paddingY + altura - ((valorSafe - minValor) / (maxValor - minValor || 1)) * altura;
  return { x, y };
}

function gerarArea(pontos: Point[], baselineY: number) {
  if (!pontos.length) return '';
  const primeira = pontos[0];
  const ultima = pontos[pontos.length - 1];
  const linha = pontos.map((ponto) => `L ${ponto.x} ${ponto.y}`).join(' ');
  return `M ${primeira.x} ${baselineY} ${linha} L ${ultima.x} ${baselineY} Z`;
}






