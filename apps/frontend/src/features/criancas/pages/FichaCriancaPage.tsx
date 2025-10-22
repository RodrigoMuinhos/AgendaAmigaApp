import {
  CalendarDays,
  ChevronLeft,
  Droplet,
  Heart,
  IdCard,
  Phone,
  UserCircle,
  UserPlus,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useCriancasStore } from '../store';
import type { Crianca } from '../types';
import { formatarIdade } from '../utils/idade';

type SectionProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

function Section({ title, icon, children }: SectionProps) {
  return (
    <Card className="rounded-3xl bg-[rgb(var(--color-surface))] shadow-soft">
      <CardHeader className="flex flex-row items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
          {icon}
        </span>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function AvatarGrande({ crianca }: { crianca: Crianca }) {
  if (crianca.avatarUrl) {
    return (
      <img
        src={crianca.avatarUrl}
        alt=""
        className="h-32 w-32 rounded-full object-cover ring-4 ring-[rgba(var(--color-primary),0.2)]"
      />
    );
  }

  const iniciais =
    crianca.nome
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('') || '?';

  return (
    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-3xl font-semibold text-[rgb(var(--color-primary))]">
      {iniciais}
    </div>
  );
}

export function FichaCriancaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  const { crianca, buscarPorId, carregando, setSelecionada } = useCriancasStore((state) => ({
    crianca: id ? state.criancas.find((item) => item.id === id) : undefined,
    buscarPorId: state.buscarPorId,
    carregando: state.carregando,
    setSelecionada: state.setSelecionada,
  }));

  useEffect(() => {
    if (!id) return;
    setSelecionada(id);
  }, [id, setSelecionada]);

  useEffect(() => {
    let ativa = true;
    if (id && !crianca) {
      buscarPorId(id).then((encontrada) => {
        if (!ativa) return;
        if (!encontrada) {
          setNotFound(true);
        }
      });
    }
    return () => {
      ativa = false;
    };
  }, [id, crianca, buscarPorId]);

  useEffect(() => {
    if (crianca) {
      setNotFound(false);
    }
  }, [crianca]);

  const dadosSaudeDisponiveis = useMemo(() => {
    if (!crianca) return false;
    return Boolean(
      crianca.tipoSanguineo ||
        crianca.alergias?.length ||
        crianca.doencasCronicas?.length ||
        crianca.medicacoes?.length ||
        crianca.pediatra,
    );
  }, [crianca]);

  if (notFound && !carregando) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate('/criancas')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-primary))] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.25)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Voltar
        </button>
        <Card className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 text-center shadow-elevated">
          <CardTitle className="text-2xl">Crianca nao encontrada</CardTitle>
          <p className="mt-2 text-sm text-[rgba(var(--color-text),0.7)]">
            Talvez o registro tenha sido removido. Retorne a lista e tente novamente.
          </p>
          <div className="mt-6 flex justify-center">
            <Button type="button" onClick={() => navigate('/criancas')}>
              Ir para lista
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!crianca) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--color-primary))] border-b-transparent" />
        <p className="text-sm text-[rgba(var(--color-text),0.7)]">Carregando ficha...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <AvatarGrande crianca={crianca} />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">{crianca.nome}</h1>
            <p className="flex items-center gap-2 text-sm text-[rgba(var(--color-text),0.7)]">
              <CalendarDays className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
              <span>{formatarIdade(crianca.nascimentoISO)}</span>
            </p>
            <p className="text-sm text-[rgba(var(--color-text),0.6)]">Nascimento: {crianca.nascimentoISO}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button type="button" variant="primary" onClick={() => navigate(`/criancas/${crianca.id}/editar`)}>
            Editar
          </Button>
        </div>
      </div>

      <Section title="Responsavel" icon={<UserCircle className="h-5 w-5" aria-hidden />}>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-semibold text-[rgb(var(--color-text))]">Nome:</span>{' '}
            {crianca.responsavel?.nome ?? 'Nao informado'}
          </li>
          <li>
            <span className="font-semibold text-[rgb(var(--color-text))]">Parentesco:</span>{' '}
            {crianca.responsavel?.parentesco ?? 'Nao informado'}
          </li>
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
            <span className="font-semibold text-[rgb(var(--color-text))]">Telefone:</span>{' '}
            {crianca.responsavel?.telefone ?? 'Nao informado'}
          </li>
        </ul>
      </Section>

      {dadosSaudeDisponiveis ? (
        <Section title="Dados de saude" icon={<Heart className="h-5 w-5" aria-hidden />}>
          <ul className="space-y-2 text-sm">
            {crianca.tipoSanguineo ? (
              <li className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                <span className="font-semibold text-[rgb(var(--color-text))]">Tipo sanguineo:</span>{' '}
                {crianca.tipoSanguineo}
              </li>
            ) : null}
            {crianca.pediatra ? (
              <li className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[rgb(var(--color-primary))]" aria-hidden />
                <span className="font-semibold text-[rgb(var(--color-text))]">Pediatra:</span>{' '}
                {crianca.pediatra}
              </li>
            ) : null}
            {crianca.alergias?.length ? (
              <li>
                <span className="font-semibold text-[rgb(var(--color-text))]">Alergias:</span>{' '}
                {crianca.alergias.join(', ')}
              </li>
            ) : null}
            {crianca.doencasCronicas?.length ? (
              <li>
                <span className="font-semibold text-[rgb(var(--color-text))]">Doencas cronicas:</span>{' '}
                {crianca.doencasCronicas.join(', ')}
              </li>
            ) : null}
            {crianca.medicacoes?.length ? (
              <li>
                <span className="font-semibold text-[rgb(var(--color-text))]">Medicacoes em uso:</span>{' '}
                {crianca.medicacoes.join(', ')}
              </li>
            ) : null}
          </ul>
        </Section>
      ) : null}

      <Section title="Identificacao oficial" icon={<IdCard className="h-5 w-5" aria-hidden />}>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="font-semibold text-[rgb(var(--color-text))]">CPF:</span>{' '}
            {crianca.cpf ?? 'Nao informado'}
          </li>
          <li>
            <span className="font-semibold text-[rgb(var(--color-text))]">Cartao SUS:</span>{' '}
            {crianca.cartaoSUS ?? 'Nao informado'}
          </li>
          <li>
            <span className="font-semibold text-[rgb(var(--color-text))]">Sexo:</span> {crianca.sexo}
          </li>
        </ul>
      </Section>
    </div>
  );
}
