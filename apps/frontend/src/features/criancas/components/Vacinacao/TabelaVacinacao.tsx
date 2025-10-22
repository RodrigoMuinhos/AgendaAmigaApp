import dayjs from 'dayjs';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../../../components/ui/Table';
import type { VacinaCatalogoItem, VacinaRegistro } from '../../types';

type TabelaVacinacaoProps = {
  registros: VacinaRegistro[];
  catalogo: VacinaCatalogoItem[];
};

function formatarData(iso: string) {
  const data = dayjs(iso);
  if (!data.isValid()) return iso;
  return data.format('DD/MM/YYYY');
}

export function TabelaVacinacao({ registros, catalogo }: TabelaVacinacaoProps) {
  const mapaCatalogo = new Map(catalogo.map((vacina) => [vacina.id, vacina]));

  if (!registros.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.6)] px-4 py-6 text-sm text-[rgba(var(--color-text),0.7)]">
        Nenhuma vacina registrada ate o momento.
      </p>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow className="bg-transparent shadow-none">
          <TableHeaderCell>Data</TableHeaderCell>
          <TableHeaderCell>Vacina</TableHeaderCell>
          <TableHeaderCell>Dose</TableHeaderCell>
          <TableHeaderCell>Lote</TableHeaderCell>
          <TableHeaderCell>Local</TableHeaderCell>
          <TableHeaderCell>Profissional</TableHeaderCell>
          <TableHeaderCell>Observacoes</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {registros.map((registro) => {
          const vacina = mapaCatalogo.get(registro.vacinaId);
          const dose = vacina?.doses.find((item) => item.codigo === registro.doseCodigo);
          return (
            <TableRow key={`${registro.vacinaId}-${registro.doseCodigo}-${registro.dataISO}`}>
              <TableCell className="font-semibold">{formatarData(registro.dataISO)}</TableCell>
              <TableCell>{vacina?.nome ?? registro.vacinaId}</TableCell>
              <TableCell>{dose?.rotulo ?? registro.doseCodigo}</TableCell>
              <TableCell>{registro.lote ?? 'Nao informado'}</TableCell>
              <TableCell>{registro.local ?? 'Nao informado'}</TableCell>
              <TableCell>{registro.profissional ?? 'Nao informado'}</TableCell>
              <TableCell>{registro.observacoes ?? 'Nao informado'}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
