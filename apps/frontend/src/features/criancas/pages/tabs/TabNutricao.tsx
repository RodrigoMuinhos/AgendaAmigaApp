import { EmptyState } from '../../../../components/ui/EmptyState';
import { useOutletContext } from 'react-router-dom';

type TabContext = {
  criancaId: string;
};

export function TabNutricao() {
  useOutletContext<TabContext>();
  return (
    <EmptyState
      title="Nutricao em breve"
      description="Planeje cardapios, registre intolerancias e acompanhe a ingestao diaria em uma proxima versao."
    />
  );
}
