import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Phone } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { FormCrianca } from '../components/FormCrianca';
import { useCriancasStore } from '../store';
import type { Crianca, CriancaCreateInput } from '../types';
import { formatarIdade } from '../utils/idade';

export function NovaCriancaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmado, setConfirmado] = useState(false);
  const [recemCriada, setRecemCriada] = useState<Crianca | undefined>(undefined);

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
        throw new Error('Não foi possível salvar os dados da criança.');
      }
      return criada;
    },
    onSuccess: (criada) => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] }).catch(() => undefined);
      setRecemCriada(criada);
      setConfirmado(true); // Mostra confirmação
    },
  });

  useEffect(() => {
    return () => setRecemCriada(undefined);
  }, []);

  const status = useMemo<'idle' | 'success' | 'error'>(() => {
    if (salvarCrianca.isError) return 'error';
    if (salvarCrianca.isSuccess) return 'success';
    return 'idle';
  }, [salvarCrianca.isError, salvarCrianca.isSuccess]);

  const statusMessage = useMemo(() => {
    if (status === 'success') return 'Criança salva com sucesso!';
    if (status === 'error') {
      const message =
        erro ||
        (salvarCrianca.error instanceof Error
          ? salvarCrianca.error.message
          : 'Não foi possível salvar os dados.');
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
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">Adicionar criança</h1>
        <p className="text-sm text-[rgba(var(--color-text),0.7)]">
          Preencha os campos essenciais para registrar a criança e facilitar o acompanhamento.
        </p>
      </div>

      <Card className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-elevated">
        {confirmado ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 text-4xl text-green-600">✅</div>
              <p className="text-lg font-semibold text-green-700">Criança cadastrada com sucesso!</p>
              <p className="text-sm text-gray-500 mt-1">
                Revise os dados abaixo ou avance para a ficha completa.
              </p>
            </div>

            {recemCriada ? (
              <div className="space-y-4 rounded-3xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.85)] p-5 shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)] text-lg font-semibold text-[rgb(var(--color-primary))]">
                    {recemCriada.nome
                      ?.split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((parte) => parte[0]?.toUpperCase())
                      .join('') || '?'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                      {recemCriada.nome || 'Nome não informado'}
                    </h3>
                    <p className="flex items-center gap-2 text-sm text-[rgba(var(--color-text),0.7)]">
                      <Calendar className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                      <span>{formatarIdade(recemCriada.nascimentoISO)}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm text-[rgba(var(--color-text),0.75)]">
                  <p className="font-semibold text-[rgb(var(--color-primary))]">Responsável</p>
                  <p>{recemCriada.responsavel?.nome ?? 'Não informado'}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                    <span>{recemCriada.responsavel?.telefone ?? 'Sem telefone'}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => navigate(`/criancas/${recemCriada.id}`)}
                    className="flex-1 justify-center"
                  >
                    Ver ficha completa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/criancas')}
                    className="flex-1 justify-center"
                  >
                    Voltar para lista
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <FormCrianca
            onSubmit={handleSubmit}
            onCancel={() => navigate('/criancas')}
            isSubmitting={salvarCrianca.isPending || carregando}
            status={status}
            statusMessage={statusMessage}
          />
        )}
      </Card>
    </div>
  );
}
