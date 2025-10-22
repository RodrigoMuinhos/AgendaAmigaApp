import { EmptyState } from '../../../../components/ui/EmptyState';
import { useOutletContext } from 'react-router-dom';

type TabContext = {
  criancaId: string;
};

export function TabRiscos() {
  useOutletContext<TabContext>();
  return (
    <EmptyState
      title="Riscos e observacoes"
      description="Em breve voce podera mapear fatores de risco, alergias e alertas personalizados."
    />
  );
}
