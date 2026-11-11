import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoInicial,
  fecharDia,
  registrarPartida,
  sementesPorTempo,
  partidasPagasRestantes,
  comprar,
  dinheiroGuardado,
  diaAnterior,
  nivel,
  proximoMarco,
  semanaAtual,
  concluirOnboarding,
  REGRAS,
} from './progresso.ts';

test('diaAnterior atravessa virada de mês e de ano', () => {
  assert.equal(diaAnterior('2026-03-01'), '2026-02-28');
  assert.equal(diaAnterior('2027-01-01'), '2026-12-31');
});

test('dias limpos seguidos aumentam a sequência e os dias totais', () => {
  let e = fecharDia(estadoInicial, '2026-11-10', 'limpo');
  e = fecharDia(e, '2026-11-11', 'limpo');
  assert.equal(e.sequencia, 2);
  assert.equal(e.diasTotais, 2);
  assert.equal(e.sementes, 2 * REGRAS.sementesCheckinLimpo);
});

test('pular um dia reinicia a sequência mas mantém os dias totais', () => {
  let e = fecharDia(estadoInicial, '2026-11-08', 'limpo');
  e = fecharDia(e, '2026-11-10', 'limpo');
  assert.equal(e.sequencia, 1);
  assert.equal(e.diasTotais, 2);
});

test('recaída zera a sequência sem apagar nada do que foi construído', () => {
  let e = fecharDia(estadoInicial, '2026-11-09', 'limpo');
  e = fecharDia(e, '2026-11-10', 'limpo');
  e = comprar({ ...e, sementes: 500 }, 'palha', 150);
  const antes = e;
  e = fecharDia(e, '2026-11-11', 'recaida');
  assert.equal(e.sequencia, 0);
  assert.equal(e.diasTotais, antes.diasTotais);
  assert.equal(e.melhorSequencia, 2);
  assert.deepEqual(e.itens, ['palha']);
  assert.equal(e.sementes, antes.sementes);
});

test('o mesmo dia não pode ser fechado duas vezes', () => {
  const e1 = fecharDia(estadoInicial, '2026-11-11', 'limpo');
  const e2 = fecharDia(e1, '2026-11-11', 'limpo');
  assert.equal(e2, e1);
});

const DIA = '2026-11-11';
const COMPLETA = 180;

test('só as 3 primeiras partidas do dia dão sementes', () => {
  let e = estadoInicial;
  const ganhos: number[] = [];
  for (let i = 0; i < 5; i++) {
    const r = registrarPartida(e, DIA, COMPLETA, 0, 1);
    e = r.estado;
    ganhos.push(r.ganho.sementes);
  }
  assert.deepEqual(ganhos, [20, 20, 20, 0, 0]);
  assert.equal(e.sementes, 60);
  assert.equal(partidasPagasRestantes(e, DIA), 0);
  assert.equal(partidasPagasRestantes(e, '2026-11-12'), 3);
});

test('o teto volta no dia seguinte e a madeira tem limite diário', () => {
  let e = estadoInicial;
  for (let i = 0; i < 3; i++) e = registrarPartida(e, DIA, COMPLETA, 8, 4).estado;
  assert.equal(e.madeira, REGRAS.madeiraMaxPorDia);
  const r = registrarPartida(e, '2026-11-12', COMPLETA, 8, 9);
  assert.equal(r.ganho.sementes, 20);
  assert.equal(r.ganho.madeira, 1);
  assert.equal(r.estado.mare.recordeCombo, 9);
});

test('sementesPorTempo segue os degraus de 1, 2 e 3 minutos', () => {
  assert.equal(sementesPorTempo(0), 0);
  assert.equal(sementesPorTempo(59), 0);
  assert.equal(sementesPorTempo(60), 7);
  assert.equal(sementesPorTempo(119), 7);
  assert.equal(sementesPorTempo(120), 14);
  assert.equal(sementesPorTempo(179), 14);
  assert.equal(sementesPorTempo(180), 20);
  assert.equal(sementesPorTempo(240), 20);
});

test('partida encerrada recebe a recompensa do degrau alcançado', () => {
  for (const [segundos, esperado] of [
    [60, 7],
    [119, 7],
    [120, 14],
    [180, 20],
  ] as const) {
    const r = registrarPartida(estadoInicial, DIA, segundos, 0, 1);
    assert.equal(r.ganho.sementes, esperado, `${segundos} s`);
    assert.equal(r.ganho.paga, true);
    assert.equal(r.estado.sementes, esperado);
    assert.equal(r.estado.xp, REGRAS.xpPorPartida);
    assert.equal(partidasPagasRestantes(r.estado, DIA), 2);
  }
});

test('partida abaixo de 1 minuto não rende nada e não altera o estado', () => {
  const antes = registrarPartida(estadoInicial, DIA, COMPLETA, 0, 2).estado;
  const r = registrarPartida(antes, DIA, 59, 9, 30);
  assert.deepEqual(r.ganho, { sementes: 0, madeira: 0, paga: false });
  assert.equal(r.estado, antes);
  assert.equal(r.estado.mare.recordeCombo, 2);
  assert.equal(partidasPagasRestantes(r.estado, DIA), 2);
});

test('partidas curtas que rendem sementes gastam partida paga e respeitam o teto', () => {
  let e = estadoInicial;
  const ganhos: number[] = [];
  for (const segundos of [60, 120, 65, COMPLETA]) {
    const r = registrarPartida(e, DIA, segundos, 0, 1);
    e = r.estado;
    ganhos.push(r.ganho.sementes);
  }
  assert.deepEqual(ganhos, [7, 14, 7, 0]);
  assert.equal(partidasPagasRestantes(e, DIA), 0);
  assert.ok(e.sementes <= REGRAS.partidasPagasPorDia * REGRAS.sementesPorPartida);
});

test('o teto diário nunca passa de 60 sementes', () => {
  let e = estadoInicial;
  for (let i = 0; i < 6; i++) e = registrarPartida(e, DIA, COMPLETA, 0, 1).estado;
  assert.equal(e.sementes, 60);
});

test('partida curta com recompensa também pode dar madeira, dentro do limite diário', () => {
  let e = estadoInicial;
  const madeiras: number[] = [];
  for (const segundos of [60, 120, 60]) {
    const r = registrarPartida(e, DIA, segundos, 5, 5);
    e = r.estado;
    madeiras.push(r.ganho.madeira);
  }
  assert.deepEqual(madeiras, [1, 1, 0]);
  assert.equal(e.madeira, REGRAS.madeiraMaxPorDia);
  assert.equal(registrarPartida(estadoInicial, DIA, 59, 8, 5).ganho.madeira, 0);
});

test('compra exige saldo e não duplica item', () => {
  let e = { ...estadoInicial, sementes: 200 };
  e = comprar(e, 'oculos', 250);
  assert.equal(e.itens.length, 0);
  e = comprar(e, 'palha', 150);
  e = comprar(e, 'palha', 150);
  assert.deepEqual(e.itens, ['palha']);
  assert.equal(e.sementes, 50);
});

test('dinheiro guardado usa a média semanal informada', () => {
  let e = concluirOnboarding(estadoInicial, 140, '2026-11-01');
  e = { ...e, diasTotais: 14 };
  assert.equal(dinheiroGuardado(e), 280);
});

test('nível e próximo marco', () => {
  assert.equal(nivel(0).numero, 1);
  assert.equal(nivel(950).numero, 4);
  assert.equal(nivel(950).nome, 'Firme');
  assert.equal(proximoMarco(0)?.dias, 1);
  assert.equal(proximoMarco(29)?.nome, 'Farol');
  assert.equal(proximoMarco(400), null);
});

test('semana atual vai de domingo a sábado e marca dias futuros', () => {
  const e = fecharDia(estadoInicial, '2026-11-09', 'limpo');
  const s = semanaAtual(e, '2026-11-11'); // quarta-feira
  assert.equal(s[0].data, '2026-11-08');
  assert.equal(s[1].resultado, 'limpo');
  assert.equal(s[3].futuro, false);
  assert.equal(s[4].futuro, true);
});
