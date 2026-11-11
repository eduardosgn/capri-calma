// Regras de progressão do Capi Calma.
// Tudo aqui é função pura: recebe o estado e devolve um estado novo.
// Isso deixa a lógica fácil de testar e independente da interface.

export type Dia = string; // 'AAAA-MM-DD' no fuso do aparelho
export type ResultadoDia = 'limpo' | 'recaida';

export type Estado = {
  onboardingFeito: boolean;
  gastoSemanal: number; // em reais, informado no onboarding
  inicio: Dia | null;
  diasTotais: number; // dias fechados sem apostar (nunca diminui)
  sequencia: number; // dias seguidos sem apostar (zera na recaída)
  melhorSequencia: number;
  historico: Record<Dia, ResultadoDia>;
  sementes: number;
  madeira: number;
  xp: number;
  fissurasVencidas: number;
  mare: { dia: Dia | null; partidasPagas: number; madeiraHoje: number; recordeCombo: number };
  itens: string[];
};

export const REGRAS = {
  // Recompensa da Maré pelo tempo jogado: cada degrau vale a partir desse segundo.
  // Abaixo do primeiro degrau a partida não rende nada nem gasta partida paga.
  degrausMare: [
    { segundos: 60, sementes: 7 },
    { segundos: 120, sementes: 14 },
    { segundos: 180, sementes: 20 },
  ],
  sementesPorPartida: 20, // partida completa (3 min); teto do dia = 3 × 20 = 60
  partidasPagasPorDia: 3,
  sementesCheckinLimpo: 30,
  perfeitosParaMadeira: 5,
  madeiraMaxPorDia: 2,
  xpPorPartida: 15,
  xpPorCheckin: 25,
  xpPorFissura: 20,
  xpPorNivel: 300,
} as const;

export const estadoInicial: Estado = {
  onboardingFeito: false,
  gastoSemanal: 0,
  inicio: null,
  diasTotais: 0,
  sequencia: 0,
  melhorSequencia: 0,
  historico: {},
  sementes: 0,
  madeira: 0,
  xp: 0,
  fissurasVencidas: 0,
  mare: { dia: null, partidasPagas: 0, madeiraHoje: 0, recordeCombo: 0 },
  itens: [],
};

const pad = (n: number) => String(n).padStart(2, '0');

export function hoje(agora: Date = new Date()): Dia {
  return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;
}

export function diaAnterior(dia: Dia): Dia {
  const [a, m, d] = dia.split('-').map(Number);
  return hoje(new Date(a, m - 1, d - 1));
}

export function concluirOnboarding(e: Estado, gastoSemanal: number, dia: Dia): Estado {
  return { ...e, onboardingFeito: true, gastoSemanal, inicio: dia };
}

/** Fecha o dia (check-in da noite). Cada dia só pode ser fechado uma vez. */
export function fecharDia(e: Estado, dia: Dia, resultado: ResultadoDia): Estado {
  if (e.historico[dia]) return e;
  const historico = { ...e.historico, [dia]: resultado };

  if (resultado === 'recaida') {
    // A sequência zera, mas nada do que foi construído some.
    return { ...e, historico, sequencia: 0 };
  }

  const ontemLimpo = e.historico[diaAnterior(dia)] === 'limpo';
  const sequencia = ontemLimpo ? e.sequencia + 1 : 1;
  return {
    ...e,
    historico,
    diasTotais: e.diasTotais + 1,
    sequencia,
    melhorSequencia: Math.max(e.melhorSequencia, sequencia),
    sementes: e.sementes + REGRAS.sementesCheckinLimpo,
    xp: e.xp + REGRAS.xpPorCheckin,
  };
}

export type GanhoPartida = { sementes: number; madeira: number; paga: boolean };

/** Sementes que uma partida da Maré rende pelo tempo jogado (0 abaixo de 1 minuto). */
export function sementesPorTempo(segundos: number): number {
  let sementes = 0;
  for (const degrau of REGRAS.degrausMare) if (segundos >= degrau.segundos) sementes = degrau.sementes;
  return sementes;
}

const SEM_GANHO: GanhoPartida = { sementes: 0, madeira: 0, paga: false };

/**
 * Registra uma partida da Maré, completa ou encerrada antes.
 * Abaixo de 1 minuto nada muda. Fora isso, só as 3 primeiras do dia dão recompensa,
 * proporcional ao tempo (sementesPorTempo), e cada uma gasta 1 partida paga.
 */
export function registrarPartida(
  e: Estado,
  dia: Dia,
  segundos: number,
  perfeitos: number,
  melhorCombo: number,
): { estado: Estado; ganho: GanhoPartida } {
  const sementes = sementesPorTempo(segundos);
  if (sementes === 0) return { estado: e, ganho: SEM_GANHO };

  const mare = e.mare.dia === dia ? e.mare : { ...e.mare, dia, partidasPagas: 0, madeiraHoje: 0 };
  const recordeCombo = Math.max(mare.recordeCombo, melhorCombo);

  if (mare.partidasPagas >= REGRAS.partidasPagasPorDia) {
    return { estado: { ...e, mare: { ...mare, recordeCombo } }, ganho: SEM_GANHO };
  }

  const madeira =
    perfeitos >= REGRAS.perfeitosParaMadeira && mare.madeiraHoje < REGRAS.madeiraMaxPorDia ? 1 : 0;

  return {
    estado: {
      ...e,
      sementes: e.sementes + sementes,
      madeira: e.madeira + madeira,
      xp: e.xp + REGRAS.xpPorPartida,
      mare: {
        dia,
        partidasPagas: mare.partidasPagas + 1,
        madeiraHoje: mare.madeiraHoje + madeira,
        recordeCombo,
      },
    },
    ganho: { sementes, madeira, paga: true },
  };
}

export function partidasPagasRestantes(e: Estado, dia: Dia): number {
  const usadas = e.mare.dia === dia ? e.mare.partidasPagas : 0;
  return Math.max(0, REGRAS.partidasPagasPorDia - usadas);
}

export function venceuFissura(e: Estado): Estado {
  return { ...e, fissurasVencidas: e.fissurasVencidas + 1, xp: e.xp + REGRAS.xpPorFissura };
}

export function comprar(e: Estado, id: string, preco: number): Estado {
  if (e.itens.includes(id) || e.sementes < preco) return e;
  return { ...e, sementes: e.sementes - preco, itens: [...e.itens, id] };
}

/** Quanto a pessoa deixou de gastar, pela média semanal que ela informou. */
export function dinheiroGuardado(e: Estado): number {
  return Math.round((e.gastoSemanal / 7) * e.diasTotais);
}

const NOMES_NIVEL = ['Começando', 'De pé', 'Caminhando', 'Firme', 'Inabalável', 'Farol'];

export function nivel(xp: number) {
  const n = Math.floor(xp / REGRAS.xpPorNivel);
  const numero = n + 1;
  return {
    numero,
    nome: NOMES_NIVEL[Math.min(n, NOMES_NIVEL.length - 1)],
    xpNoNivel: xp - n * REGRAS.xpPorNivel,
    xpParaProximo: REGRAS.xpPorNivel,
  };
}

export type Marco = { dias: number; nome: string; descricao: string };

// Marcos da Ilha 1 e as aberturas das próximas ilhas (doc de design de progressão).
export const MARCOS: Marco[] = [
  { dias: 1, nome: 'Primeiro dia', descricao: 'A Capi chega na ilha' },
  { dias: 7, nome: 'Cais', descricao: 'Libera o cais e o álbum de peixes' },
  { dias: 14, nome: 'Horta', descricao: 'Libera a horta e a respiração quadrada' },
  { dias: 30, nome: 'Farol', descricao: 'Libera o farol e a onda longa' },
  { dias: 45, nome: 'Rede', descricao: 'Libera a rede entre as árvores' },
  { dias: 60, nome: 'Mirante', descricao: 'Libera o mirante e o ritmo 4-7-8' },
  { dias: 90, nome: 'Ilha 2', descricao: 'A floresta aparece no mapa' },
  { dias: 180, nome: 'Ilha 3', descricao: 'A montanha aparece no mapa' },
  { dias: 270, nome: 'Ilha 4', descricao: 'A vila aparece no mapa' },
  { dias: 365, nome: 'Formatura', descricao: 'Farol gigante e modo mentor' },
];

export function proximoMarco(diasTotais: number): Marco | null {
  return MARCOS.find((m) => m.dias > diasTotais) ?? null;
}

export function marcosConquistados(diasTotais: number): Marco[] {
  return MARCOS.filter((m) => m.dias <= diasTotais);
}

/** Os 7 dias da semana atual (domingo a sábado) com o resultado de cada um. */
export function semanaAtual(e: Estado, dia: Dia) {
  const [a, m, d] = dia.split('-').map(Number);
  const base = new Date(a, m - 1, d);
  const domingo = new Date(a, m - 1, d - base.getDay());
  const letras = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  return letras.map((letra, i) => {
    const data = hoje(new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + i));
    return { letra, data, resultado: e.historico[data] ?? null, futuro: data > dia };
  });
}
