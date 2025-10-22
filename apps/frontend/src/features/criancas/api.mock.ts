import type { Crianca } from './types';

const STORAGE_KEY = 'agenda-amiga:criancas';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let cache: Crianca[] | null = null;

function readFromStorage(): Crianca[] {
  if (cache) {
    return cache;
  }

  if (typeof window === 'undefined') {
    cache = [];
    return cache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(raw) as Crianca[];
    cache = Array.isArray(parsed) ? parsed : [];
    return cache;
  } catch {
    cache = [];
    return cache;
  }
}

function writeToStorage(data: Crianca[]) {
  cache = data;
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Intentionally swallow errors for unavailable storage (e.g., private mode).
  }
}

export async function listarCriancasMock(): Promise<Crianca[]> {
  await delay();
  return [...readFromStorage()].sort((a, b) => b.criadoEmISO.localeCompare(a.criadoEmISO));
}

export async function criarCriancaMock(crianca: Crianca): Promise<Crianca> {
  await delay();
  const data = readFromStorage();
  data.push(crianca);
  writeToStorage(data);
  return crianca;
}

export async function atualizarCriancaMock(crianca: Crianca): Promise<Crianca> {
  await delay();
  const data = readFromStorage();
  const index = data.findIndex((item) => item.id === crianca.id);
  if (index === -1) {
    throw new Error('Crianca nao encontrada');
  }
  data[index] = crianca;
  writeToStorage(data);
  return crianca;
}

export async function buscarCriancaPorIdMock(id: string): Promise<Crianca | undefined> {
  await delay();
  const data = readFromStorage();
  return data.find((item) => item.id === id);
}

export function hidratarCriancas(): Crianca[] {
  return [...readFromStorage()];
}

export async function removerCriancaMock(id: string): Promise<boolean> {
  await delay();
  const data = readFromStorage();
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }
  data.splice(index, 1);
  writeToStorage(data);
  return true;
}
