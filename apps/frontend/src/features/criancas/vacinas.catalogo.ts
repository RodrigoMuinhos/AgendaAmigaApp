import type { VacinaCatalogoItem } from './types';

export const vacinasCatalogo: VacinaCatalogoItem[] = [
  {
    id: 'BCG',
    nome: 'BCG',
    doses: [{ codigo: 'U', rotulo: 'Dose unica', idadeAlvoMeses: 0 }],
  },
  {
    id: 'HEPB',
    nome: 'Hepatite B',
    doses: [{ codigo: 'D0', rotulo: 'Dose ao nascer', idadeAlvoMeses: 0 }],
  },
  {
    id: 'PENTA',
    nome: 'Pentavalente (DTP/Hib/HepB)',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 2 },
      { codigo: 'D2', rotulo: '2a dose', idadeAlvoMeses: 4 },
      { codigo: 'D3', rotulo: '3a dose', idadeAlvoMeses: 6 },
      { codigo: 'R1', rotulo: 'Reforco', idadeAlvoMeses: 15 },
    ],
  },
  {
    id: 'POLIO',
    nome: 'Poliomielite',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 2 },
      { codigo: 'D2', rotulo: '2a dose', idadeAlvoMeses: 4 },
      { codigo: 'D3', rotulo: '3a dose', idadeAlvoMeses: 6 },
      { codigo: 'R1', rotulo: 'Reforco', idadeAlvoMeses: 15 },
    ],
  },
  {
    id: 'PNEUMO',
    nome: 'Pneumococica 10v',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 2 },
      { codigo: 'D2', rotulo: '2a dose', idadeAlvoMeses: 4 },
      { codigo: 'R1', rotulo: 'Reforco', idadeAlvoMeses: 12 },
    ],
  },
  {
    id: 'MENINGO',
    nome: 'Meningococica C/ACWY',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 3 },
      { codigo: 'R1', rotulo: 'Reforco', idadeAlvoMeses: 12 },
    ],
  },
  {
    id: 'ROTA',
    nome: 'Rotavirus',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 2 },
      { codigo: 'D2', rotulo: '2a dose', idadeAlvoMeses: 4 },
    ],
  },
  {
    id: 'SCR',
    nome: 'Triplice Viral (SCR)',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 12 },
      { codigo: 'D2', rotulo: '2a dose', idadeAlvoMeses: 15 },
    ],
  },
  {
    id: 'DTP',
    nome: 'DTP',
    doses: [
      { codigo: 'R1', rotulo: 'Reforco 1', idadeAlvoMeses: 48 },
      { codigo: 'R2', rotulo: 'Reforco 2', idadeAlvoMeses: 72 },
    ],
  },
  {
    id: 'VARICELA',
    nome: 'Varicela',
    doses: [
      { codigo: 'D1', rotulo: '1a dose', idadeAlvoMeses: 15 },
      { codigo: 'D2', rotulo: '2a dose', idadeAlvoMeses: 48 },
    ],
  },
];

export const vacinasCatalogoPorId = new Map(vacinasCatalogo.map((item) => [item.id, item]));
