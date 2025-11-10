import axios from 'axios';
import { create } from 'zustand';
import {
  atualizarCrianca,
  buscarCriancaPorId,
  listarCriancas,
  removerCrianca,
  criarCrianca as criarCriancaApi,
} from './api';
import type {
  Caderneta,
  Crianca,
  CriancaCreateInput,
  CrescimentoRegistro,
  VacinaCatalogoItem,
  VacinaDose,
  VacinaRegistro,
} from './types';
import { asArray } from '../../core/utils/arrays';

const CADERNETA_STORAGE_KEY_BASE = 'agenda-amiga:cadernetas';
const SELECIONADA_STORAGE_KEY_BASE = 'agenda-amiga:crianca-selecionada';
const STORAGE_ANON_SUFFIX = 'anon';

function resolveStorageSuffix(tutorId?: string) {
  return tutorId && tutorId.trim().length ? tutorId : STORAGE_ANON_SUFFIX;
}

function cadernetasStorageKey(tutorId?: string) {
  return `${CADERNETA_STORAGE_KEY_BASE}:${resolveStorageSuffix(tutorId)}`;
}

function selecionadaStorageKey(tutorId?: string) {
  return `${SELECIONADA_STORAGE_KEY_BASE}:${resolveStorageSuffix(tutorId)}`;
}

function migrateLegacyCadernetas(tutorId?: string) {
  if (typeof window === 'undefined') return undefined;
  if (!tutorId) return undefined;
  try {
    const legacy = window.localStorage.getItem(CADERNETA_STORAGE_KEY_BASE);
    if (!legacy) return undefined;
    window.localStorage.setItem(cadernetasStorageKey(tutorId), legacy);
    window.localStorage.removeItem(CADERNETA_STORAGE_KEY_BASE);
    return legacy;
  } catch {
    return undefined;
  }
}

function migrateLegacySelecionada(tutorId?: string) {
  if (typeof window === 'undefined') return undefined;
  if (!tutorId) return undefined;
  try {
    const legacy = window.localStorage.getItem(SELECIONADA_STORAGE_KEY_BASE);
    if (!legacy) return undefined;
    window.localStorage.setItem(selecionadaStorageKey(tutorId), legacy);
    window.localStorage.removeItem(SELECIONADA_STORAGE_KEY_BASE);
    return legacy;
  } catch {
    return undefined;
  }
}

function hidratarCadernetas(tutorId?: string): Record<string, Caderneta> {
  if (typeof window === 'undefined') {
    return {};
  }
  const key = cadernetasStorageKey(tutorId);
  try {
    let raw = window.localStorage.getItem(key);
    if (!raw) {
      raw = migrateLegacyCadernetas(tutorId);
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Caderneta>;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([valueKey, value]) => [
        valueKey,
        {
          criancaId: value?.criancaId ?? valueKey,
          vacinacao: {
            historico: asArray(value?.vacinacao?.historico),
          },
          crescimento: {
            registros: asArray(value?.crescimento?.registros),
          },
        },
      ]),
    );
  } catch {
    return {};
  }
}

function persistirCadernetas(tutorId: string | undefined, data: Record<string, Caderneta>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(cadernetasStorageKey(tutorId), JSON.stringify(data));
    if (tutorId) {
      window.localStorage.removeItem(CADERNETA_STORAGE_KEY_BASE);
    }
  } catch {
    // ignore
  }
}

function lerSelecionada(tutorId?: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const key = selecionadaStorageKey(tutorId);
  try {
    let value = window.localStorage.getItem(key) ?? undefined;
    if (!value) {
      value = migrateLegacySelecionada(tutorId) ?? undefined;
    }
    return value ?? undefined;
  } catch {
    return undefined;
  }
}

function persistirSelecionada(tutorId: string | undefined, id?: string) {
  if (typeof window === 'undefined') return;
  const key = selecionadaStorageKey(tutorId);
  try {
    if (!id) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, id);
    }
    if (tutorId) {
      window.localStorage.removeItem(SELECIONADA_STORAGE_KEY_BASE);
    }
  } catch {
    // ignore
  }
}

const mensagemErroPadrao =
  'Nao foi possivel atualizar as informacoes agora. Tente novamente em instantes.';

function ordenarPorDataDesc(registros: VacinaRegistro[]) {
  return [...registros].sort((a, b) => b.dataISO.localeCompare(a.dataISO));
}

function ordenarCrescimento(registros: CrescimentoRegistro[]) {
  return [...registros].sort((a, b) => b.dataISO.localeCompare(a.dataISO));
}

function registrosCrescimentoIguais(a: CrescimentoRegistro, b: CrescimentoRegistro) {
  return (
    a.criancaId === b.criancaId &&
    a.dataISO === b.dataISO &&
    (a.pesoKg ?? null) === (b.pesoKg ?? null) &&
    (a.estaturaCm ?? null) === (b.estaturaCm ?? null) &&
    (a.perimetroCefalicoCm ?? null) === (b.perimetroCefalicoCm ?? null) &&
    (a.observacoes ?? '') === (b.observacoes ?? '')
  );
}

function agruparPorVacina(
  doses: VacinaDose[],
  indicador: (dose: VacinaDose) => boolean,
): VacinaDose[] {
  return doses.filter(indicador);
}

function calcularIdadeMeses(nascimentoISO: string, hoje = new Date()): number {
  const nascimento = new Date(nascimentoISO);
  if (Number.isNaN(nascimento.getTime())) {
    return 0;
  }
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
    anos -= 1;
    meses += 12;
  }
  if (hoje.getDate() < nascimento.getDate()) {
    meses = (meses + 11) % 12;
  }
  return anos * 12 + meses;
}

function removerDuplicatasPorId<T extends { id: string }>(lista: T[]): T[] {
  const mapa = new Map<string, T>();
  for (const item of lista) {
    if (!mapa.has(item.id)) {
      mapa.set(item.id, item);
    }
  }
  return Array.from(mapa.values());
}

function normalizarCriancaEntrada(rawInput: unknown): Crianca {
  const raw = (rawInput ?? {}) as Record<string, unknown>;
  const coerceString = (value: unknown) =>
    typeof value === 'string' && value.trim().length ? value : undefined;

  const sexo = raw.sexo === 'M' || raw.sexo === 'F' || raw.sexo === 'O' ? (raw.sexo as Crianca['sexo']) : 'O';

  const responsavelRaw =
    raw.responsavel && typeof raw.responsavel === 'object'
      ? (raw.responsavel as Record<string, unknown>)
      : undefined;
  const responsavel =
    responsavelRaw &&
    (coerceString(responsavelRaw.nome) ||
      coerceString(responsavelRaw.telefone) ||
      coerceString(responsavelRaw.parentesco))
      ? {
          nome: coerceString(responsavelRaw.nome),
          parentesco: coerceString(responsavelRaw.parentesco) as any,
          telefone: coerceString(responsavelRaw.telefone),
        }
      : undefined;

  const mapStringArray = (value: unknown) =>
    Array.isArray(value)
      ? (value.filter((item): item is string => typeof item === 'string' && item.trim().length) as string[])
      : undefined;

  const normalizeObject = (value: unknown) =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;

  return {
    id: String(raw.id ?? ''),
    nome: typeof raw.nome === 'string' ? raw.nome : '',
    nascimentoISO: typeof raw.nascimentoISO === 'string' ? raw.nascimentoISO : '',
    sexo,
    responsavel,
    tutorId: coerceString(raw.tutorId),
    cartaoSUS: coerceString(raw.cartaoSUS),
    cpf: coerceString(raw.cpf),
    convenioOperadora: coerceString(raw.convenioOperadora),
    convenioNumero: coerceString(raw.convenioNumero),
    tipoSanguineo: coerceString(raw.tipoSanguineo) as Crianca['tipoSanguineo'],
    alergias: mapStringArray(raw.alergias),
    doencasCronicas: mapStringArray(raw.doencasCronicas),
    medicacoes: mapStringArray(raw.medicacoes),
    neurodivergencias: Array.isArray(raw.neurodivergencias)
      ? (raw.neurodivergencias.filter(
          (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object',
        ) as Crianca['neurodivergencias'])
      : undefined,
    pediatra: coerceString(raw.pediatra),
    avatarUrl: coerceString(raw.avatarUrl),
    nascimento: normalizeObject(raw.nascimento) as Crianca['nascimento'],
    triagensNeonatais: normalizeObject(raw.triagensNeonatais) as Crianca['triagensNeonatais'],
    vacinasNascimento: normalizeObject(raw.vacinasNascimento) as Crianca['vacinasNascimento'],
    altaAleitamento: normalizeObject(raw.altaAleitamento) as Crianca['altaAleitamento'],
    acompanhamentosPeriodicos: Array.isArray(raw.acompanhamentosPeriodicos)
      ? (raw.acompanhamentosPeriodicos.filter(
          (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object',
        ) as Crianca['acompanhamentosPeriodicos'])
      : undefined,
    criadoEmISO: coerceString(raw.criadoEmISO),
    atualizadoEmISO: coerceString(raw.atualizadoEmISO),
  };
}

type Pendencia = {
  vacina: VacinaCatalogoItem;
  doses: VacinaDose[];
};

type ProximaDose = {
  vacina: VacinaCatalogoItem;
  dose: VacinaDose;
  atrasada: boolean;
};

type CriancasState = {
  tutorId?: string;
  criancas: Crianca[];
  cadernetas: Record<string, Caderneta>;
  selecionadaId?: string;
  carregando: boolean;
  erro?: string;
  limparErro: () => void;
  setSelecionada: (id: string | undefined) => void;
  getSelecionada: () => Crianca | undefined;
  listar: () => Promise<void>;
  criar: (dados: CriancaCreateInput) => Promise<Crianca | undefined>;
  atualizar: (id: string, dados: CriancaCreateInput) => Promise<Crianca | undefined>;
  buscarPorId: (id: string) => Promise<Crianca | undefined>;
  remover: (id: string) => Promise<boolean>;
  reset: () => void;
  setTutor: (tutorId: string | undefined) => void;
  getCaderneta: (criancaId: string) => Caderneta;
  addVacina: (registro: VacinaRegistro) => void;
  addCrescimento: (registro: CrescimentoRegistro) => void;
  editarCrescimento: (criancaId: string, originalDataISO: string, registro: CrescimentoRegistro) => void;
  removerCrescimento: (criancaId: string, registro: CrescimentoRegistro) => void;
  listarVacinasAplicadas: (criancaId: string) => VacinaRegistro[];
  listarMedidasCrescimento: (criancaId: string) => CrescimentoRegistro[];
  listarPendencias: (criancaId: string, catalogo: VacinaCatalogoItem[]) => Pendencia[];
  proximasDoses: (
    criancaId: string,
    catalogo: VacinaCatalogoItem[],
    hoje?: Date,
  ) => ProximaDose[];
};

export const useCriancasStore = create<CriancasState>((set, get) => {
  const tutorInicial: string | undefined = undefined;
  const selecionadaInicial = lerSelecionada(tutorInicial);

  return {
    tutorId: tutorInicial,
    criancas: [],
    cadernetas: hidratarCadernetas(tutorInicial),
    selecionadaId: selecionadaInicial,
    carregando: false,
    erro: undefined,
    limparErro: () => set({ erro: undefined }),
    reset: () => {
      const { tutorId } = get();
      persistirSelecionada(tutorId, undefined);
      persistirCadernetas(tutorId, {});
      set({
        criancas: [],
        cadernetas: {},
        selecionadaId: undefined,
        carregando: false,
        erro: undefined,
      });
    },
    setTutor: (tutorId) => {
      const cadernetas = hidratarCadernetas(tutorId);
      const selecionadaId = lerSelecionada(tutorId);
      set({
        tutorId,
        criancas: [],
        cadernetas,
        selecionadaId,
        carregando: false,
        erro: undefined,
      });
    },
    setSelecionada: (id) => {
      persistirSelecionada(get().tutorId, id);
      set({ selecionadaId: id });
    },
    getSelecionada: () => {
      const { selecionadaId, criancas } = get();
      if (!selecionadaId) return undefined;
      return criancas.find((item) => item.id === selecionadaId);
    },
    listar: async () => {
      set({ carregando: true, erro: undefined });
      try {
        const dados = await listarCriancas();
        const normalizados = removerDuplicatasPorId(
          dados.map((item) => normalizarCriancaEntrada(item)),
        );
        set((estadoAtual) => {
          const selecionadaId = estadoAtual.selecionadaId;
          const selecionadaExisteApos = normalizados.some((item) => item.id === selecionadaId);
          if (!selecionadaExisteApos) {
            persistirSelecionada(estadoAtual.tutorId, undefined);
          }
          return {
            criancas: normalizados,
            carregando: false,
            selecionadaId: selecionadaExisteApos ? selecionadaId : undefined,
          };
        });
      } catch (error) {
        console.error('Erro ao listar criancas', error);
        set({ carregando: false, erro: mensagemErroPadrao });
      }
    },
    criar: async (dados) => {
      set({ carregando: true, erro: undefined });
      try {
        const tutorId = get().tutorId;
        const rawCrianca = await criarCriancaApi({
          ...dados,
          tutorId: dados.tutorId ?? tutorId,
        });
        const novaCrianca = normalizarCriancaEntrada(rawCrianca);
        persistirSelecionada(tutorId, novaCrianca.id);
        set((estadoAtual) => ({
          criancas: [novaCrianca, ...estadoAtual.criancas.filter((item) => item.id !== novaCrianca.id)],
          selecionadaId: novaCrianca.id,
          carregando: false,
        }));
        return novaCrianca;
      } catch (error) {
        console.error('Erro ao criar crianca', error);
        const resposta =
          axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object'
            ? (error.response.data as Record<string, unknown>)
            : undefined;
        const mensagem =
          typeof resposta?.message === 'string'
            ? (resposta.message as string)
            : typeof resposta?.error === 'string'
            ? (resposta.error as string)
            : mensagemErroPadrao;
        set({ carregando: false, erro: mensagem });
        return undefined;
      }
    },
    atualizar: async (id, dados) => {
      set({ carregando: true, erro: undefined });
      try {
        const existente = get().criancas.find((item) => item.id === id);
        if (!existente) {
          throw new Error('Crianca nao encontrada');
        }
        const atualizadoRaw = await atualizarCrianca(id, dados);
        const atualizado = normalizarCriancaEntrada(atualizadoRaw);
        set((estadoAtual) => ({
          criancas: estadoAtual.criancas.map((item) => (item.id === id ? atualizado : item)),
          carregando: false,
        }));
        persistirSelecionada(get().tutorId, id);
        return atualizado;
      } catch (error) {
        console.error('Erro ao atualizar crianca', error);
        set({ carregando: false, erro: mensagemErroPadrao });
        return undefined;
      }
    },
    buscarPorId: async (id) => {
      const existente = get().criancas.find((item) => item.id === id);
      if (existente) {
        set({ selecionadaId: id });
        persistirSelecionada(get().tutorId, id);
        return existente;
      }
      set({ carregando: true, erro: undefined });
      try {
        const encontradoRaw = await buscarCriancaPorId(id);
        let encontrado: Crianca | undefined;
        if (encontradoRaw) {
          encontrado = normalizarCriancaEntrada(encontradoRaw);
          set((estadoAtual) => ({
            criancas: [...estadoAtual.criancas, encontrado!],
            carregando: false,
            selecionadaId: id,
          }));
          persistirSelecionada(get().tutorId, id);
        } else {
          set({ carregando: false });
        }
        return encontrado ?? undefined;
      } catch (error) {
        console.error('Erro ao buscar crianca', error);
        set({ carregando: false, erro: mensagemErroPadrao });
        return undefined;
      }
    },
    remover: async (id) => {
      set({ carregando: true, erro: undefined });
      try {
        await removerCrianca(id);
        set((estadoAtual) => {
          const criancasAtualizadas = estadoAtual.criancas.filter((item) => item.id !== id);
          const { [id]: _removida, ...cadernetasRestantes } = estadoAtual.cadernetas;
          persistirCadernetas(estadoAtual.tutorId, cadernetasRestantes);
          const selecionadaId =
            estadoAtual.selecionadaId === id ? undefined : estadoAtual.selecionadaId;
          if (!selecionadaId) {
            persistirSelecionada(estadoAtual.tutorId, undefined);
          }
          return {
            criancas: criancasAtualizadas,
            cadernetas: cadernetasRestantes,
            selecionadaId,
            carregando: false,
          };
        });
        return true;
      } catch (error) {
        console.error('Erro ao remover crianca', error);
        set({ carregando: false, erro: mensagemErroPadrao });
        return false;
      }
    },
    getCaderneta: (criancaId) => {
      const { cadernetas } = get();
      if (!cadernetas[criancaId]) {
        const nova: Caderneta = {
          criancaId,
          vacinacao: { historico: [] },
          crescimento: { registros: [] },
        };
        const atualizadas = { ...cadernetas, [criancaId]: nova };
        persistirCadernetas(get().tutorId, atualizadas);
        set({ cadernetas: atualizadas });
        return nova;
      }
      const existente = cadernetas[criancaId];
      if (!existente.crescimento) {
        const ajustada: Caderneta = {
          ...existente,
          crescimento: { registros: [] },
        };
        const atualizadas = { ...cadernetas, [criancaId]: ajustada };
        persistirCadernetas(get().tutorId, atualizadas);
        set({ cadernetas: atualizadas });
        return ajustada;
      }
      return existente;
    },
    addVacina: (registro) => {
      set((estadoAtual) => {
        const atual = estadoAtual.cadernetas[registro.criancaId] ?? {
          criancaId: registro.criancaId,
          vacinacao: { historico: [] },
          crescimento: { registros: [] },
        };
        const historicoAtualizado = ordenarPorDataDesc([...atual.vacinacao.historico, registro]);
        const cadernetasAtualizadas = {
          ...estadoAtual.cadernetas,
          [registro.criancaId]: {
            ...atual,
            vacinacao: { historico: historicoAtualizado },
            crescimento: atual.crescimento,
          },
        };
        persistirCadernetas(estadoAtual.tutorId, cadernetasAtualizadas);
        return { cadernetas: cadernetasAtualizadas };
      });
    },
    addCrescimento: (registro) => {
      set((estadoAtual) => {
        const atual = estadoAtual.cadernetas[registro.criancaId] ?? {
          criancaId: registro.criancaId,
          vacinacao: { historico: [] },
          crescimento: { registros: [] },
        };
        const registrosAtualizados = ordenarCrescimento([...atual.crescimento.registros, registro]);
        const cadernetasAtualizadas = {
          ...estadoAtual.cadernetas,
          [registro.criancaId]: {
            ...atual,
            crescimento: { registros: registrosAtualizados },
          },
        };
        persistirCadernetas(estadoAtual.tutorId, cadernetasAtualizadas);
        return { cadernetas: cadernetasAtualizadas };
      });
    },
    editarCrescimento: (criancaId, originalDataISO, registroAtualizado) => {
      set((estadoAtual) => {
        const atual = estadoAtual.cadernetas[criancaId];
        if (!atual) {
          return estadoAtual;
        }
        const registros = [...atual.crescimento.registros];
        const index = registros.findIndex((item) => item.dataISO === originalDataISO);
        if (index === -1) {
          return estadoAtual;
        }
        registros[index] = registroAtualizado;
        const registrosOrdenados = ordenarCrescimento(registros);
        const cadernetasAtualizadas = {
          ...estadoAtual.cadernetas,
          [criancaId]: {
            ...atual,
            crescimento: { registros: registrosOrdenados },
          },
        };
        persistirCadernetas(estadoAtual.tutorId, cadernetasAtualizadas);
        return { cadernetas: cadernetasAtualizadas };
      });
    },
    removerCrescimento: (criancaId, registroAlvo) => {
      set((estadoAtual) => {
        const atual = estadoAtual.cadernetas[criancaId];
        if (!atual) {
          return estadoAtual;
        }
        const registros = [...atual.crescimento.registros];
        const index = registros.findIndex((item) => registrosCrescimentoIguais(item, registroAlvo));
        if (index === -1) {
          return estadoAtual;
        }
        registros.splice(index, 1);
        const registrosOrdenados = ordenarCrescimento(registros);
        const cadernetasAtualizadas = {
          ...estadoAtual.cadernetas,
          [criancaId]: {
            ...atual,
            crescimento: { registros: registrosOrdenados },
          },
        };
        persistirCadernetas(estadoAtual.tutorId, cadernetasAtualizadas);
        return { cadernetas: cadernetasAtualizadas };
      });
    },
    listarVacinasAplicadas: (criancaId) => {
      const caderneta = get().getCaderneta(criancaId);
      return ordenarPorDataDesc(caderneta.vacinacao.historico);
    },
    listarMedidasCrescimento: (criancaId) => {
      const caderneta = get().getCaderneta(criancaId);
      return ordenarCrescimento(caderneta.crescimento.registros);
    },
    listarPendencias: (criancaId, catalogo) => {
      const caderneta = get().getCaderneta(criancaId);
      const crianca = get().criancas.find((item) => item.id === criancaId);
      const idadeMeses = crianca ? calcularIdadeMeses(crianca.nascimentoISO) : 0;
      const aplicadas = new Set(
        caderneta.vacinacao.historico.map((registro) => `${registro.vacinaId}:${registro.doseCodigo}`),
      );
      const pendencias: Pendencia[] = [];

      asArray(catalogo).forEach((vacina) => {
        const dosesPendentes = agruparPorVacina(asArray(vacina.doses), (dose) => {
          if (aplicadas.has(`${vacina.id}:${dose.codigo}`)) return false;
          if (dose.idadeAlvoMeses === undefined) {
            return false;
          }
          return dose.idadeAlvoMeses < idadeMeses;
        });
        if (dosesPendentes.length) {
          pendencias.push({
            vacina,
            doses: dosesPendentes,
          });
        }
      });

      return pendencias;
    },
    proximasDoses: (criancaId, catalogo, hoje = new Date()) => {
      const caderneta = get().getCaderneta(criancaId);
      const crianca = get().criancas.find((item) => item.id === criancaId);
      const idadeMeses = crianca ? calcularIdadeMeses(crianca.nascimentoISO, hoje) : 0;
      const aplicadas = new Set(
        caderneta.vacinacao.historico.map((registro) => `${registro.vacinaId}:${registro.doseCodigo}`),
      );

      const proximas: ProximaDose[] = [];
      asArray(catalogo).forEach((vacina) => {
        asArray(vacina.doses).forEach((dose) => {
          if (aplicadas.has(`${vacina.id}:${dose.codigo}`)) {
            return;
          }
          const alvo = dose.idadeAlvoMeses;
          if (alvo !== undefined && alvo < idadeMeses) {
            return;
          }
          const atrasada = alvo !== undefined && idadeMeses > alvo;
          proximas.push({
            vacina,
            dose,
            atrasada,
          });
        });
      });

      proximas.sort((a, b) => {
        const alvoA = a.dose.idadeAlvoMeses ?? Number.MAX_SAFE_INTEGER;
        const alvoB = b.dose.idadeAlvoMeses ?? Number.MAX_SAFE_INTEGER;
        if (alvoA === alvoB) {
          return a.vacina.nome.localeCompare(b.vacina.nome);
        }
        return alvoA - alvoB;
      });

      return proximas;
    },
  };
});
