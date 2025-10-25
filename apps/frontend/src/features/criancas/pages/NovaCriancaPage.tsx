import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { FormCrianca } from '../components/FormCrianca';
import { useCriancasStore } from '../store';
import type { CriancaCreateInput } from '../types';

export function NovaCriancaPage() {
  const navigate = useNavigate();
  const { criar, carregando } = useCriancasStore((state) => ({
    criar: state.criar,
    carregando: state.carregando,
  }));

  const handleSubmit = async (dados: CriancaCreateInput) => {
    const criada = await criar(dados);
    if (criada) {
      navigate(`/criancas/${criada.id}`, {
        state: { sucesso: 'Crianca cadastrada com sucesso!' },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-[rgb(var(--color-primary))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.25)]"
        >
          Voltar
        </button>
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">Adicionar crianca</h1>
        <p className="text-sm text-[rgba(var(--color-text),0.7)]">
          Preencha os campos essenciais para registrar a crianca e facilitar o acompanhamento.
        </p>
      </div>
      <Card className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-elevated">
        <FormCrianca onSubmit={handleSubmit} onCancel={() => navigate('/criancas')} isSubmitting={carregando} />
      </Card>
    </div>
  );
}
