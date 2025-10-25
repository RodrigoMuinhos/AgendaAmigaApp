import { create } from 'zustand';
import {
  atualizarCrianca,
  buscarCriancaPorId,
  criarCrianca,
  listarCriancas,
  removerCrianca,
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

const CADERNETA_STORAGE_KEY = 'agenda-amiga:cadernetas';
const SELECIONADA_STORAGE_KEY = 'agenda-amiga:crianca-selecionada';

const mensagemErroPadrao =
  'Nao foi possivel atualizar as informacoes agora. Tente novamente em instantes.';

function hidratarCadernetas(): Record<string, Caderneta> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(CADERNETA_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Caderneta>;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [
        key,
        {
          criancaId: value?.criancaId ?? key,
          vacinacao: {
            historico: value?.vacinacao?.historico ?? [],
          },
          crescimento: {
            registros: value?.crescimento?.registros ?? [],
          },
        },
      ]),
    );
  } catch {
    return {};
  }
}

function persistirCadernetas(data: Record<string, Caderneta>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CADERNETA_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function lerSelecionada(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage.getItem(SELECIONADA_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function persistirSelecionada(id?: string) {
  if (typeof window === 'undefined') return;
  try {
    if (!id) {
      window.localStorage.removeItem(SELECIONADA_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SELECIONADA_STORAGE_KEY, id);
    }
  } catch {
    // ignore
  }
}

function ordenarPorDataDesc(registros: VacinaRegistro[]) {
  return [...registros].sort((a, b) => b.dataISO.localeCompare(a.dataISO));
}

function ordenarCrescimento(registros: CrescimentoRegistro[]) {
  return [...registros].sort((a, b) => b.dataISO.localeCompare(a.dataISO));
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
  getCaderneta: (criancaId: string) => Caderneta;
  addVacina: (registro: VacinaRegistro) => void;
  addCrescimento: (registro: CrescimentoRegistro) => void;
  editarCrescimento: (criancaId: string, originalDataISO: string, registro: CrescimentoRegistro) => void;
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
  const selecionadaInicial = lerSelecionada();

  return {
    criancas: [],
    cadernetas: hidratarCadernetas(),
    selecionadaId: selecionadaInicial,
    carregando: false,
    erro: undefined,
    limparErro: () => set({ erro: undefined }),
    setSelecionada: (id) => {
      persistirSelecionada(id);
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
        set((estadoAtual) => {
          const selecionadaId = estadoAtual.selecionadaId;
          const selecionadaExisteApos = dados.some((item) => item.id === selecionadaId);
          if (!selecionadaExisteApos) {
            persistirSelecionada(undefined);
          }
          return {
            criancas: dados,
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
        const novo = await criarCrianca(dados);
        set((estadoAtual) => {
          const criancasAtualizadas = [...estadoAtual.criancas, novo];
          persistirSelecionada(novo.id);
          return {
            criancas: criancasAtualizadas,
            selecionadaId: novo.id,
            carregando: false,
          };
        });
        return novo;
      } catch (error) {
        console.error('Erro ao criar crianca', error);
        set({ carregando: false, erro: mensagemErroPadrao });
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
        const atualizado = await atualizarCrianca(id, dados);
        set((estadoAtual) => ({
          criancas: estadoAtual.criancas.map((item) => (item.id === id ? atualizado : item)),
          carregando: false,
        }));
        persistirSelecionada(id);
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
        persistirSelecionada(id);
        return existente;
      }
      set({ carregando: true, erro: undefined });
      try {
        const encontrado = await buscarCriancaPorId(id);
        if (encontrado) {
          set((estadoAtual) => ({
            criancas: [...estadoAtual.criancas, encontrado],
            carregando: false,
            selecionadaId: id,
          }));
          persistirSelecionada(id);
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
          persistirCadernetas(cadernetasRestantes);
          const selecionadaId =
            estadoAtual.selecionadaId === id ? undefined : estadoAtual.selecionadaId;
          if (!selecionadaId) {
            persistirSelecionada(undefined);
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
        persistirCadernetas(atualizadas);
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
        persistirCadernetas(atualizadas);
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
        persistirCadernetas(cadernetasAtualizadas);
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
        persistirCadernetas(cadernetasAtualizadas);
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
        persistirCadernetas(cadernetasAtualizadas);
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

      catalogo.forEach((vacina) => {
        const dosesPendentes = agruparPorVacina(vacina.doses, (dose) => {
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
      catalogo.forEach((vacina) => {
        vacina.doses.forEach((dose) => {
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
