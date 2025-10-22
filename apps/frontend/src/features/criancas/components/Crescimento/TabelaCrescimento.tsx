import dayjs from 'dayjs';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../../components/ui/Table';
import type { MedidaCrescimentoAnalise } from '../../utils/crescimento';

type TabelaCrescimentoProps = {
  analises: MedidaCrescimentoAnalise[];
};

function formatarData(iso: string) {
  const data = dayjs(iso);
  if (!data.isValid()) return iso;
  return data.format('DD/MM/YYYY');
}

function formatarNumero(valor?: number, sufixo?: string) {
  if (valor === undefined || Number.isNaN(valor)) {
    return 'Nao informado';
  }
  const formatado = Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return sufixo ? `${formatado} ${sufixo}` : formatado;
}

export function TabelaCrescimento({ analises }: TabelaCrescimentoProps) {
  if (!analises.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.6)] px-4 py-4 text-sm text-[rgba(var(--color-text),0.7)]">
        Nenhuma medida registrada ate o momento.
      </p>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow className="bg-transparent shadow-none">
          <TableHeaderCell>Data</TableHeaderCell>
          <TableHeaderCell>Peso</TableHeaderCell>
          <TableHeaderCell>Estatura</TableHeaderCell>
          <TableHeaderCell>Perimetro cefalico</TableHeaderCell>
          <TableHeaderCell>IMC</TableHeaderCell>
          <TableHeaderCell>Avaliacao</TableHeaderCell>
          <TableHeaderCell>Score MP</TableHeaderCell>
          <TableHeaderCell>Observacoes</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {analises.map((analise) => (
          <TableRow
            key={`${analise.registro.criancaId}-${analise.registro.dataISO}-${analise.registro.pesoKg ?? ''}-${analise.registro.estaturaCm ?? ''}`}
          >
            <TableCell className="font-semibold">{formatarData(analise.registro.dataISO)}</TableCell>
            <TableCell>
              {formatarNumero(analise.registro.pesoKg, 'kg')}
              <InfoStatus info={analise.peso} />
            </TableCell>
            <TableCell>
              {formatarNumero(analise.registro.estaturaCm, 'cm')}
              <InfoStatus info={analise.estatura} />
            </TableCell>
            <TableCell>
              {formatarNumero(analise.registro.perimetroCefalicoCm, 'cm')}
              <InfoStatus info={analise.perimetro} />
            </TableCell>
            <TableCell>
              {formatarNumero(analise.imc)}
              <span className="block text-[0.65rem] text-[rgba(var(--color-text),0.6)]">
                {traduzirStatus(analise.statusImc)}
              </span>
            </TableCell>
            <TableCell>
              <ul className="space-y-1 text-[0.65rem] text-[rgba(var(--color-text),0.65)]">
                <li>Peso: {descritor(analise.peso)}</li>
                <li>Estatura: {descritor(analise.estatura)}</li>
                <li>Perimetro: {descritor(analise.perimetro)}</li>
              </ul>
            </TableCell>
            <TableCell>
              <span className="block text-sm font-semibold text-[rgb(var(--color-text))]">
                {analise.score}/100
              </span>
              <span className="text-[0.65rem] text-[rgba(var(--color-text),0.6)]">
                {avaliacaoScore(analise.score)}
              </span>
            </TableCell>
            <TableCell>{analise.registro.observacoes ?? 'Nao informado'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function InfoStatus({ info }: { info: { diferenca?: number; status: string; referencia: number } }) {
  if (info.status === 'indefinido') {
    return null;
  }
  const sinal = info.diferenca && info.diferenca > 0 ? '+' : '';
  return (
    <span className="block text-[0.65rem] text-[rgba(var(--color-text),0.6)]">
      {traduzirStatus(info.status)} ({sinal}{info.diferenca?.toFixed(1)})
    </span>
  );
}

function descritor(info: { status: string }) {
  return traduzirStatus(info.status);
}

function traduzirStatus(status: string) {
  switch (status) {
    case 'acima':
      return 'Acima da media';
    case 'abaixo':
      return 'Abaixo da media';
    case 'dentro':
      return 'Dentro da faixa esperada';
    default:
      return 'Sem avaliacao';
  }
}

function avaliacaoScore(score: number) {
  if (score >= 90) return 'Dentro do esperado';
  if (score >= 70) return 'Atencao: monitorar';
  if (score > 0) return 'Acao recomendada';
  return 'Sem avaliacao';
}
