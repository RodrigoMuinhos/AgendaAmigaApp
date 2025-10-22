import { EmptyState } from '../../../../components/ui/EmptyState';
import { useOutletContext } from 'react-router-dom';

type TabContext = {
  criancaId: string;
};

export function TabConsultas() {
  useOutletContext<TabContext>();
  return (
    <EmptyState
      title="Consultas em breve"
      description="Registre consultas e acompanhamentos para manter o historico atualizado."
    />
  );
}
