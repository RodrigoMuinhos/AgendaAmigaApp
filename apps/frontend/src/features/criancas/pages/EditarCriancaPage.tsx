import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FormCrianca, FORM_CRIANCA_SECTIONS, getFormCriancaSection, type StepKey } from '../components/FormCrianca';
import { useCriancasStore } from '../store';
import type { CriancaCreateInput } from '../types';

export function EditarCriancaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigateTimeout = useRef<number | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  const sectionParam = (searchParams.get('section') ?? 'dadosBasicos') as string;
  const section: StepKey = FORM_CRIANCA_SECTIONS.includes(sectionParam as StepKey)
    ? (sectionParam as StepKey)
    : 'dadosBasicos';
  const sectionMeta = getFormCriancaSection(section);
  const isBasicSection = section === 'dadosBasicos';
  const pageHeading = isBasicSection ? 'Editar crianca' : `Atualizar ${sectionMeta.title.toLowerCase()}`;
  const pageDescription = isBasicSection
    ? 'Atualize os dados quando houver mudancas importantes.'
    : sectionMeta.description;

  const { crianca, atualizar, buscarPorId, remover, carregando, erro, limparErro } = useCriancasStore((state) => ({
    crianca: id ? state.criancas.find((item) => item.id === id) : undefined,
    atualizar: state.atualizar,
    buscarPorId: state.buscarPorId,
    remover: state.remover,
    carregando: state.carregando,
    erro: state.erro,
    limparErro: state.limparErro,
  }));

  useEffect(() => {
    let ativa = true;
    if (id && !crianca) {
      buscarPorId(id).then((result) => {
        if (!ativa) return;
        if (!result) {
          setNotFound(true);
        } else {
          setNotFound(false);
        }
      });
    }
    return () => {
      ativa = false;
    };
  }, [id, crianca, buscarPorId]);

  if (!id) {
    return (
      <EmptyState
        title="Selecione uma crianca"
        description="Escolha um cadastro para editar os dados."
        action={
          <Button onClick={() => navigate('/criancas')}>
            Ir para lista de criancas
          </Button>
        }
      />
    );
  }

  if (carregando && !crianca && !notFound) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-[rgba(var(--color-text),0.7)]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--color-primary))] border-b-transparent" />
        <p>Carregando dados da crianca...</p>
      </div>
    );
  }

  if (notFound || !crianca) {
    return (
      <EmptyState
        title="Crianca nao encontrada"
        description="Nao foi possivel localizar o cadastro solicitado."
        action={
          <Button onClick={() => navigate('/criancas')}>
            Voltar para lista
          </Button>
        }
      />
    );
  }

  const atualizarCrianca = useMutation({
    mutationFn: async (dados: CriancaCreateInput) => {
      if (!id) throw new Error('Identificador da crianca nao encontrado.');
      limparErro();
      const atualizada = await atualizar(id, dados);
      if (!atualizada) {
        throw new Error('Nao foi possivel salvar as alteracoes.');
      }
      return atualizada;
    },
    onSuccess: (atualizada) => {
      if (!id) return;
      queryClient.invalidateQueries({ queryKey: ['criancas'] }).catch(() => undefined);
      navigateTimeout.current = window.setTimeout(() => {
        navigate(`/criancas/${atualizada.id}`);
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
    if (atualizarCrianca.isError) return 'error';
    if (atualizarCrianca.isSuccess) return 'success';
    return 'idle';
  }, [atualizarCrianca.isError, atualizarCrianca.isSuccess]);

  const statusMessage = useMemo(() => {
    if (status === 'success') {
      return 'Alteracoes salvas com sucesso';
    }
    if (status === 'error') {
      const message =
        erro ||
        (atualizarCrianca.error instanceof Error
          ? atualizarCrianca.error.message
          : 'Nao foi possivel salvar as alteracoes.');
      return message;
    }
    return undefined;
  }, [atualizarCrianca.error, erro, status]);

  const handleSubmit = async (dados: CriancaCreateInput) => {
    await atualizarCrianca.mutateAsync(dados);
  };

  const handleDelete = async () => {
    const confirmado = window.confirm('Deseja excluir este cadastro? Esta acao nao pode ser desfeita.');
    if (!confirmado) {
      return;
    }
    const removida = await remover(id);
    if (removida) {
      navigate('/criancas');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">{pageHeading}</h1>
        <p className="text-sm text-[rgba(var(--color-text),0.7)]">{pageDescription}</p>
      </div>

      <Card className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-elevated">
        <FormCrianca
          key={crianca.id}
          defaultValues={crianca}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/criancas/${id}`)}
          isSubmitting={atualizarCrianca.isPending || carregando}
          submitLabel={section === 'dadosBasicos' ? 'Salvar alteracoes' : 'Salvar'}
          onDelete={handleDelete}
          deleteLabel="Excluir dados"
          status={status}
          statusMessage={statusMessage}
          section={section}
        />
      </Card>
    </div>
  );
}
