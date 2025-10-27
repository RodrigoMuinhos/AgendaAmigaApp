import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { FormCrianca } from '../components/FormCrianca';
import { useCriancasStore } from '../store';
import type { CriancaCreateInput } from '../types';

export function NovaCriancaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const navigateTimeout = useRef<number | undefined>(undefined);

  const { criar, carregando, erro, limparErro } = useCriancasStore((state) => ({
    criar: state.criar,
    carregando: state.carregando,
    erro: state.erro,
    limparErro: state.limparErro,
  }));

  const salvarCrianca = useMutation({
    mutationFn: async (dados: CriancaCreateInput) => {
      limparErro();
      const criada = await criar(dados);
      if (!criada) {
        throw new Error('Nao foi possivel salvar os dados da crianca.');
      }
      return criada;
    },
    onSuccess: (criada) => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] }).catch(() => undefined);
      navigateTimeout.current = window.setTimeout(() => {
        navigate(`/criancas/${criada.id}`, {
          state: { sucesso: 'Crianca cadastrada com sucesso!' },
        });
      }, 400);
    },
  });

  useEffect(
    () => () => {
      if (navigateTimeout.current) {
        window.clearTimeout(navigateTimeout.current);
      }
    },
    [],
  );

  const status = useMemo<'idle' | 'success' | 'error'>(() => {
    if (salvarCrianca.isError) return 'error';
    if (salvarCrianca.isSuccess) return 'success';
    return 'idle';
  }, [salvarCrianca.isError, salvarCrianca.isSuccess]);

  const statusMessage = useMemo(() => {
    if (status === 'success') {
      return 'Crianca salva com sucesso';
    }
    if (status === 'error') {
      const message =
        erro ||
        (salvarCrianca.error instanceof Error
          ? salvarCrianca.error.message
          : 'Nao foi possivel salvar os dados.');
      return message;
    }
    return undefined;
  }, [erro, salvarCrianca.error, status]);

  const handleSubmit = async (dados: CriancaCreateInput) => {
    await salvarCrianca.mutateAsync(dados);
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
        <FormCrianca
          onSubmit={handleSubmit}
          onCancel={() => navigate('/criancas')}
          isSubmitting={salvarCrianca.isPending || carregando}
          status={status}
          statusMessage={statusMessage}
        />
      </Card>
    </div>
  );
}
