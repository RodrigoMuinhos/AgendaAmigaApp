import type { MedidaCrescimentoAnalise } from '../../utils/crescimento';

type CrescimentoChartProps = {
  analises: MedidaCrescimentoAnalise[];
};

type Point = { x: number; y: number };

export function CrescimentoChart({ analises }: CrescimentoChartProps) {
  if (!analises.length) {
    return null;
  }

  const ordenadas = [...analises].sort((a, b) => a.idadeMeses - b.idadeMeses);

  const maxIdade = Math.max(ordenadas[ordenadas.length - 1].idadeMeses, 60);
  const maxPeso = Math.max(
    ...ordenadas.map((item) => item.registro.pesoKg ?? 0),
    ...ordenadas.map((item) => item.referencia.pesoMedioKg),
  );

  const pontosCrianca = ordenadas
    .filter((item) => item.registro.pesoKg !== undefined)
    .map((item) => normalizarPonto(item.idadeMeses, item.registro.pesoKg ?? 0, maxIdade, maxPeso));

  const pontosReferencia = ordenadas.map((item) =>
    normalizarPonto(item.idadeMeses, item.referencia.pesoMedioKg, maxIdade, maxPeso),
  );

  const eixoX = Array.from({ length: Math.floor(maxIdade / 6) + 1 }, (_, index) => index * 6);

  return (
    <div className="rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.9)] p-5 shadow-soft">
      <div className="mb-3 flex justify-between">
        <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Grafico de peso x idade</h3>
        <span className="text-xs text-[rgba(var(--color-text),0.6)]">Escala aproximada</span>
      </div>
      <svg viewBox="0 0 100 60" className="h-56 w-full">
        <defs>
          <linearGradient id="pesoArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(30,136,229,0.35)" />
            <stop offset="100%" stopColor="rgba(30,136,229,0.05)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="60" fill="rgba(30,136,229,0.02)" />

        {eixoX.map((mes) => {
          const { x } = normalizarPonto(mes, 0, maxIdade, maxPeso);
          return (
            <line
              key={`grid-${mes}`}
              x1={x}
              y1={5}
              x2={x}
              y2={55}
              stroke="rgba(30,136,229,0.12)"
              strokeDasharray="2 4"
            />
          );
        })}

        <polyline
          fill="none"
          stroke="rgba(144,202,249,0.6)"
          strokeWidth="1.5"
          points={pontosReferencia.map(({ x, y }) => `${x},${y}`).join(' ')}
        />

        <path
          d={gerarArea(pontosCrianca)}
          fill="url(#pesoArea)"
          stroke="rgba(30,136,229,0.4)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {pontosCrianca.map((ponto, index) => (
          <circle
            key={`ponto-${index}`}
            cx={ponto.x}
            cy={ponto.y}
            r="1.6"
            fill="rgb(var(--color-primary))"
            stroke="white"
            strokeWidth="0.4"
          />
        ))}

        <text x="2" y="8" className="fill-[rgba(var(--color-text),0.6)] text-[2.5px]">
          Peso (kg)
        </text>
        <text x="80" y="58" className="fill-[rgba(var(--color-text),0.6)] text-[2.5px]">
          Idade (meses)
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-[rgba(var(--color-text),0.6)]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-[rgba(30,136,229,0.4)]" />
          Medidas registradas
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-[rgba(144,202,249,0.6)]" />
          Media aproximada
        </span>
      </div>
    </div>
  );
}

function normalizarPonto(
  idadeMeses: number,
  peso: number,
  maxIdade: number,
  maxPeso: number,
): Point {
  const paddingX = 6;
  const paddingY = 5;
  const largura = 100 - paddingX * 2;
  const altura = 60 - paddingY * 2;

  const x = paddingX + (idadeMeses / maxIdade) * largura;
  const y = paddingY + altura - (peso / maxPeso) * altura;
  return { x, y };
}

function gerarArea(pontos: Point[]) {
  if (!pontos.length) return '';
  const inicio = pontos[0];
  const fim = pontos[pontos.length - 1];
  const linha = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(' ');
  return `M ${inicio.x} ${inicio.y} L ${linha} L ${fim.x} 55 L ${inicio.x} 55 Z`;
}
