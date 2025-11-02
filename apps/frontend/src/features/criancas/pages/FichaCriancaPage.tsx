import {
  Baby,
  CalendarDays,
  ClipboardList,
  Droplet,
  FileText,
  FlaskConical,
  Heart,
  IdCard,
  Milk,
  Phone,
  Syringe,
  Trash2,
  UserCircle,
  UserPlus,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useCriancasStore } from '../store';
import type { AcompanhamentoRegistro, Crianca } from '../types';
import { formatarIdade } from '../utils/idade';

type SectionProps = {
  title: string;
  icon: ReactNode;
  description?: string;
  children: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
};

function Section({ title, icon, description, children, empty, emptyMessage }: SectionProps) {
  return (
    <Card className="rounded-3xl bg-[rgb(var(--color-surface))] shadow-soft">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
            {icon}
          </span>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? (
              <p className="text-sm text-[rgba(var(--color-text),0.6)]">{description}</p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.6)] px-4 py-6 text-center text-sm text-[rgba(var(--color-text),0.6)]">
            {emptyMessage ?? 'Nao ha dados cadastrados nesta secao.'}
          </p>
        ) : (
          children
        )}
      </CardContent>
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

function humanize(value?: string | null) {
  if (!value) return 'Nao informado';
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatDate(value?: string | null) {
  if (!value) return 'Nao informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('pt-BR');
}

function formatSimNao(value?: string | null) {
  if (!value) return 'Nao informado';
  return value === 'sim' ? 'Sim' : value === 'nao' ? 'Nao' : humanize(value);
}

function InfoList({
  items,
}: {
  items: Array<{ label: string; value?: ReactNode; icon?: ReactNode; hide?: boolean }>;
}) {
  return (
    <ul className="space-y-2 text-sm">
      {items
        .filter((item) => !item.hide)
        .map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            {item.icon ? <span className="mt-0.5 text-[rgb(var(--color-primary))]">{item.icon}</span> : null}
            <span className="font-semibold text-[rgb(var(--color-text))]">{item.label}</span>
            <span className="text-[rgba(var(--color-text),0.75)]">{item.value ?? 'Nao informado'}</span>
          </li>
        ))}
    </ul>
  );
}

function formatAcompanhamento(registro: AcompanhamentoRegistro) {
  const campos: Array<{ label: string; value?: string }> = [
    { label: 'Data da consulta', value: formatDate(registro.dataConsulta) },
    {
      label: 'Idade corrigida (meses)',
      value: registro.idadeCorrigidaMeses !== undefined ? String(registro.idadeCorrigidaMeses) : undefined,
    },
    { label: 'Peso (kg)', value: registro.pesoKg !== undefined ? String(registro.pesoKg) : undefined },
    {
      label: 'Comprimento (cm)',
      value: registro.comprimentoCm !== undefined ? String(registro.comprimentoCm) : undefined,
    },
    {
      label: 'Perimetro cefalico (cm)',
      value: registro.perimetroCefalicoCm !== undefined ? String(registro.perimetroCefalicoCm) : undefined,
    },
    { label: 'IMC', value: registro.imc !== undefined ? String(registro.imc) : undefined },
    { label: 'z peso/idade', value: registro.zPesoIdade !== undefined ? String(registro.zPesoIdade) : undefined },
    {
      label: 'z altura/idade',
      value: registro.zAlturaIdade !== undefined ? String(registro.zAlturaIdade) : undefined,
    },
    {
      label: 'z IMC/idade',
      value: registro.zIMCIdade !== undefined ? String(registro.zIMCIdade) : undefined,
    },
    { label: 'Pressao arterial', value: registro.pressaoArterial },
    { label: 'Alimentacao atual', value: humanize(registro.alimentacaoAtual) },
    { label: 'Suplementos', value: registro.suplementos },
    { label: 'Intercorrencias', value: registro.intercorrenciasDesdeUltimaConsulta },
    { label: 'Medicacoes', value: registro.medicacoesUsoContinuo },
    { label: 'Avaliacao do desenvolvimento', value: registro.avaliacaoDesenvolvimento },
    { label: 'Encaminhamentos', value: registro.encaminhamentos },
    { label: 'Observacoes', value: registro.observacoesProfissional },
    { label: 'Profissional responsavel', value: registro.profissionalResponsavel },
  ];

  return campos.filter((item) => item.value && String(item.value).trim().length);
}

export function FichaCriancaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [notFound, setNotFound] = useState(false);
  const sucessoInicial =
    (location.state as { sucesso?: string } | undefined)?.sucesso || undefined;
  const [mensagemSucesso, setMensagemSucesso] = useState<string | undefined>(sucessoInicial);

  const { crianca, buscarPorId, carregando, setSelecionada, remover } = useCriancasStore((state) => ({
    crianca: id ? state.criancas.find((item) => item.id === id) : undefined,
    buscarPorId: state.buscarPorId,
    carregando: state.carregando,
    setSelecionada: state.setSelecionada,
    remover: state.remover,
  }));

  useEffect(() => {
    if (!id) return;
    setSelecionada(id);
  }, [id, setSelecionada]);

  useEffect(() => {
    if (sucessoInicial) {
      setMensagemSucesso(sucessoInicial);
      navigate(location.pathname, { replace: true });
    }
  }, [sucessoInicial, navigate, location.pathname]);

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
          Voltar para lista
        </button>
        <Card className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 text-center shadow-elevated">
          <CardTitle className="text-2xl">Crianca nao encontrada</CardTitle>
          <p className="mt-2 text-sm text-[rgba(var(--color-text),0.7)]">
            Talvez o registro tenha sido removido. Retorne a lista e tente novamente.
          </p>
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

  const nascimento = crianca.nascimento ?? {};
  const triagens = crianca.triagensNeonatais ?? {};
  const vacinasNascimento = crianca.vacinasNascimento ?? {};
  const altaAleitamento = crianca.altaAleitamento ?? {};
  const acompanhamentos = crianca.acompanhamentosPeriodicos ?? [];

  const temNascimento =
    nascimento.pesoAoNascerGramas !== undefined ||
    nascimento.comprimentoAoNascerCm !== undefined ||
    nascimento.perimetroCefalicoAoNascerCm !== undefined ||
    nascimento.tipoParto ||
    nascimento.idadeGestacionalSemanas !== undefined ||
    nascimento.apgar1min !== undefined ||
    nascimento.apgar5min !== undefined ||
    nascimento.intercorrenciasParto ||
    nascimento.necessitouUtiNeonatal ||
    nascimento.ictericiaNeonatal ||
    nascimento.grupoSanguineoCrianca ||
    nascimento.grupoSanguineoMae;

  const temTriagens =
    Boolean(triagens.testePezinho) ||
    Boolean(triagens.testeOrelhinha) ||
    Boolean(triagens.testeOlhinho) ||
    Boolean(triagens.testeCoracaozinho) ||
    Boolean(triagens.testeLinguinha);

  const temVacinas =
    Boolean(vacinasNascimento.vitaminaKAplicada) ||
    Boolean(vacinasNascimento.profilaxiaOftalmia) ||
    Boolean(vacinasNascimento.bcgDoseUnica) ||
    Boolean(vacinasNascimento.hepatiteBDose0);

  const temAlta =
    Boolean(altaAleitamento.aleitamentoNaAlta) ||
    Boolean(altaAleitamento.orientacoesNaAlta) ||
    Boolean(altaAleitamento.servicoReferencia) ||
    Boolean(altaAleitamento.profissionalReferencia) ||
    Boolean(altaAleitamento.profissionalReferenciaCRM);

  const profissionalReferenciaDescricao = (() => {
    const nome = altaAleitamento.profissionalReferencia?.trim();
    const crm = altaAleitamento.profissionalReferenciaCRM?.trim();
    if (nome && crm) {
      return `${nome} (CRM ${crm})`;
    }
    if (nome) {
      return nome;
    }
    if (crm) {
      return `CRM ${crm}`;
    }
    return undefined;
  })();

  const temAcompanhamentos = acompanhamentos.length > 0;

  const handleDelete = async () => {
    const confirmar = window.confirm('Deseja excluir esta crianca? Esta acao nao pode ser desfeita.');
    if (!confirmar) return;
    const removida = await remover(crianca.id);
    if (removida) {
      navigate('/criancas', { state: { aviso: 'Crianca removida com sucesso.' } });
    }
  };

  return (
    <div className="space-y-8">
      {mensagemSucesso ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-[rgba(var(--color-primary),0.3)] bg-[rgba(var(--color-primary),0.08)] px-4 py-3 text-sm text-[rgb(var(--color-primary))]">
          <span>{mensagemSucesso}</span>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide"
            onClick={() => setMensagemSucesso(undefined)}
          >
            Fechar
          </button>
        </div>
      ) : null}

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
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/criancas')}>
            Voltar
          </Button>
          <Button type="button" variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
            Excluir
          </Button>
          <Button type="button" onClick={() => navigate(`/criancas/${crianca.id}/editar`)}>
            Editar
          </Button>
        </div>
      </div>

      <Section
        title="Responsavel"
        icon={<UserCircle className="h-5 w-5" aria-hidden />}
        description="Informacoes de contato do cuidador principal."
      >
        <InfoList
          items={[
            { label: 'Nome:', value: crianca.responsavel?.nome ?? 'Nao informado' },
            { label: 'Parentesco:', value: humanize(crianca.responsavel?.parentesco) },
            {
              label: 'Telefone:',
              value: crianca.responsavel?.telefone ?? 'Nao informado',
              icon: <Phone className="h-4 w-4" aria-hidden />,
            },
          ]}
        />
      </Section>

      <Section
        title="Nascimento"
        icon={<Baby className="h-5 w-5" aria-hidden />}
        description="Dados coletados na maternidade."
        empty={!temNascimento}
        emptyMessage="Sem informacoes cadastradas sobre o nascimento."
      >
        <InfoList
          items={[
            {
              label: 'Peso ao nascer:',
              value:
                nascimento.pesoAoNascerGramas !== undefined
                  ? `${nascimento.pesoAoNascerGramas} g`
                  : 'Nao informado',
            },
            {
              label: 'Comprimento:',
              value:
                nascimento.comprimentoAoNascerCm !== undefined
                  ? `${nascimento.comprimentoAoNascerCm} cm`
                  : 'Nao informado',
            },
            {
              label: 'Perimetro cefalico:',
              value:
                nascimento.perimetroCefalicoAoNascerCm !== undefined
                  ? `${nascimento.perimetroCefalicoAoNascerCm} cm`
                  : 'Nao informado',
            },
            { label: 'Tipo de parto:', value: humanize(nascimento.tipoParto) },
            {
              label: 'Idade gestacional:',
              value:
                nascimento.idadeGestacionalSemanas !== undefined
                  ? `${nascimento.idadeGestacionalSemanas} semanas`
                  : 'Nao informado',
            },
            {
              label: 'Apgar 1 min:',
              value: nascimento.apgar1min !== undefined ? String(nascimento.apgar1min) : 'Nao informado',
            },
            {
              label: 'Apgar 5 min:',
              value: nascimento.apgar5min !== undefined ? String(nascimento.apgar5min) : 'Nao informado',
            },
            { label: 'Intercorrencias:', value: nascimento.intercorrenciasParto },
            {
              label: 'Necessitou UTI neonatal:',
              value: formatSimNao(nascimento.necessitouUtiNeonatal),
            },
            {
              label: 'Dias em UTI:',
              value:
                nascimento.diasUtiNeonatal !== undefined ? String(nascimento.diasUtiNeonatal) : undefined,
              hide: nascimento.necessitouUtiNeonatal !== 'sim',
            },
            {
              label: 'Ictericia neonatal:',
              value: formatSimNao(nascimento.ictericiaNeonatal),
            },
            { label: 'Grupo sanguineo da crianca:', value: nascimento.grupoSanguineoCrianca },
            { label: 'Grupo sanguineo da mae:', value: nascimento.grupoSanguineoMae },
          ]}
        />
      </Section>

      <Section
        title="Triagens neonatais"
        icon={<FlaskConical className="h-5 w-5" aria-hidden />}
        description="Resultados dos testes obrigatorios realizados nas primeiras horas."
        empty={!temTriagens}
        emptyMessage="Sem registros de triagens neonatais."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              titulo: 'Teste do pezinho',
              dados: triagens.testePezinho,
              dataLabel: 'Data da coleta',
            },
            {
              titulo: 'Teste da orelhinha',
              dados: triagens.testeOrelhinha,
              dataLabel: 'Data',
            },
            { titulo: 'Teste do olhinho', dados: triagens.testeOlhinho, dataLabel: 'Data' },
            { titulo: 'Teste do coracaozinho', dados: triagens.testeCoracaozinho, dataLabel: 'Data' },
            { titulo: 'Teste da linguinha', dados: triagens.testeLinguinha, dataLabel: 'Data' },
          ]
            .filter((item) => item.dados && Object.keys(item.dados).length)
            .map((item) => (
              <div key={item.titulo} className="rounded-2xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.7)] px-4 py-3">
                <p className="text-sm font-semibold text-[rgb(var(--color-text))]">{item.titulo}</p>
                <InfoList
                  items={[
                    { label: `${item.dataLabel}:`, value: formatDate(item.dados?.data ?? item.dados?.dataColeta) },
                    { label: 'Resultado:', value: humanize(item.dados?.resultado) },
                    { label: 'Observacao:', value: item.dados?.observacao },
                  ]}
                />
              </div>
            ))}
        </div>
      </Section>

      <Section
        title="Vacinas de nascimento"
        icon={<Syringe className="h-5 w-5" aria-hidden />}
        description="Profilaxias e doses aplicadas logo apos o parto."
        empty={!temVacinas}
      >
        <InfoList
          items={[
            {
              label: 'Vitamina K aplicada:',
              value: formatSimNao(vacinasNascimento.vitaminaKAplicada),
            },
            {
              label: 'Profilaxia oftalmia:',
              value: formatSimNao(vacinasNascimento.profilaxiaOftalmia),
            },
            {
              label: 'BCG (dose unica):',
              value: vacinasNascimento.bcgDoseUnica?.dataAplicacao
                ? `${formatDate(vacinasNascimento.bcgDoseUnica.dataAplicacao)}${
                    vacinasNascimento.bcgDoseUnica.lote
                      ? ` • Lote ${vacinasNascimento.bcgDoseUnica.lote}`
                      : ''
                  }`
                : undefined,
            },
            {
              label: 'Hepatite B (dose 0):',
              value: vacinasNascimento.hepatiteBDose0?.dataAplicacao
                ? `${formatDate(vacinasNascimento.hepatiteBDose0.dataAplicacao)}${
                    vacinasNascimento.hepatiteBDose0.lote
                      ? ` • Lote ${vacinasNascimento.hepatiteBDose0.lote}`
                      : ''
                  }`
                : undefined,
            },
          ]}
        />
      </Section>

      <Section
        title="Alta e aleitamento"
        icon={<Milk className="h-5 w-5" aria-hidden />}
        description="Orientacoes fornecidas a familia no momento da alta."
        empty={!temAlta}
      >
        <InfoList
          items={[
            { label: 'Aleitamento na alta:', value: humanize(altaAleitamento.aleitamentoNaAlta) },
            { label: 'Servico de referencia:', value: altaAleitamento.servicoReferencia },
            { label: 'Profissional referencia:', value: profissionalReferenciaDescricao },
            { label: 'Orientacoes na alta:', value: altaAleitamento.orientacoesNaAlta },
          ]}
        />
      </Section>

      <Section
        title="Acompanhamentos periodicos"
        icon={<ClipboardList className="h-5 w-5" aria-hidden />}
        description="Consultas registradas para monitorar o desenvolvimento."
        empty={!temAcompanhamentos}
        emptyMessage="Nenhum acompanhamento registrado ate o momento."
      >
        <div className="grid gap-4">
          {acompanhamentos.map((registro, index) => (
            <div
              key={`${registro.dataConsulta ?? index}-${index}`}
              className="rounded-2xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.7)] px-4 py-4 shadow-inner"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[rgb(var(--color-text))]">
                  Consulta {index + 1}
                </p>
                <span className="text-xs uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">
                  {formatDate(registro.dataConsulta)}
                </span>
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                {formatAcompanhamento(registro).map((item, itemIndex) => (
                  <div key={itemIndex} className="rounded-xl bg-[rgba(var(--color-primary),0.07)] px-3 py-2">
                    <span className="block text-[rgba(var(--color-text),0.55)]">{item.label}</span>
                    <span className="font-medium text-[rgb(var(--color-text))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Identificacao oficial"
        icon={<IdCard className="h-5 w-5" aria-hidden />}
        description="Documentos e informacoes essenciais para atendimento."
      >
        <InfoList
          items={[
            { label: 'CPF:', value: crianca.cpf ?? 'Nao informado' },
            { label: 'Cartao SUS:', value: crianca.cartaoSUS ?? 'Nao informado' },
            {
              label: 'Sexo:',
              value: crianca.sexo === 'F' ? 'Feminino' : crianca.sexo === 'M' ? 'Masculino' : 'Outro',
            },
          ]}
        />
      </Section>

      {dadosSaudeDisponiveis ? (
        <Section
          title="Dados de saude"
          icon={<Heart className="h-5 w-5" aria-hidden />}
          description="Informacoes adicionais relevantes ao acompanhamento."
        >
          <InfoList
            items={[
              { label: 'Tipo sanguineo:', value: crianca.tipoSanguineo },
              { label: 'Pediatra:', value: crianca.pediatra },
              { label: 'Alergias:', value: crianca.alergias?.join(', ') },
              { label: 'Doencas cronicas:', value: crianca.doencasCronicas?.join(', ') },
              { label: 'Medicacoes em uso:', value: crianca.medicacoes?.join(', ') },
            ]}
          />
        </Section>
      ) : null}

      {(crianca.neurodivergencias?.length ?? 0) > 0 ? (
        <Section
          title="Neurodivergencias"
          icon={<FileText className="h-5 w-5" aria-hidden />}
          description="Registros informados pela familia ou pelos profissionais."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {crianca.neurodivergencias?.map((item, index) => (
              <div
                key={`${item.tipo}-${index}`}
                className="rounded-2xl border border-[rgba(var(--color-border),0.3)] bg-[rgba(var(--color-surface),0.7)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[rgb(var(--color-text))]">{humanize(item.tipo)}</p>
                <p className="text-sm text-[rgba(var(--color-text),0.7)]">
                  Grau: {item.grau ? humanize(item.grau) : 'Nao informado'}
                </p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
