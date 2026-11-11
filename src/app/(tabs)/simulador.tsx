import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Polyline } from 'react-native-svg';
import { Botao, textoTitulo } from '@/components/ui';
import { cor, fonte } from '@/theme';

// Simulação de caça-níquel com retorno de 95% (RTP).
// Prêmios: 1% paga 30x, 5% paga 5x, 20% paga 2x. 0,01*30 + 0,05*5 + 0,20*2 = 0,95.
function girar(saldo: number): number {
  const r = Math.random();
  const premio = r < 0.01 ? 30 : r < 0.06 ? 5 : r < 0.26 ? 2 : 0;
  return saldo - 1 + premio;
}

const INICIAL = { saldo: 100, apostado: 0, voltou: 0, historico: [100] as number[] };
const W = 310;
const H = 110;

const brl = (x: number) => `R$ ${Math.round(x).toLocaleString('pt-BR')}`;

export default function Simulador() {
  const insets = useSafeAreaInsets();
  const [sim, setSim] = useState(INICIAL);

  const rodar = (n: number) =>
    setSim((s) => {
      let { saldo, apostado, voltou } = s;
      const historico = s.historico.slice();
      for (let i = 0; i < n && saldo >= 1; i++) {
        const novo = girar(saldo);
        voltou += novo - (saldo - 1);
        apostado += 1;
        saldo = novo;
        historico.push(saldo);
      }
      return { saldo, apostado, voltou, historico };
    });

  const { pontos, y100 } = useMemo(() => {
    const h = sim.historico;
    const max = Math.max(150, ...h);
    const y = (v: number) => H - (v / max) * H;
    const pts = h.length < 2 ? `0,${y(100)} ${W},${y(100)}` : h.map((v, i) => `${((i / (h.length - 1)) * W).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return { pontos: pts, y100: y(100) };
  }, [sim.historico]);

  const giros = sim.apostado;
  const status = giros === 0 ? 'nenhum giro ainda' : sim.saldo < 1 ? `zerou em ${giros} giros` : `${giros} giros`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cor.creme }} contentContainerStyle={[s.conteudo, { paddingTop: insets.top + 20 }]}>
      <View style={s.tracinho} />
      <Text style={s.h1}>Simulador da Verdade</Text>
      <Text style={s.texto}>Você começa com R$ 100 de mentira e aposta R$ 1 por giro. Gira e vê pra onde o dinheiro vai.</Text>

      <View style={s.visor}>
        <View style={s.linhaEntre}>
          <View>
            <Text style={s.visorRotulo}>Seu saldo</Text>
            <Text style={s.visorSaldo}>{brl(sim.saldo)}</Text>
          </View>
          <Text style={s.visorRotulo}>{status}</Text>
        </View>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" accessibilityLabel="Gráfico do saldo ao longo dos giros">
          <Line x1={0} y1={y100} x2={W} y2={y100} stroke="#6B6257" strokeWidth={1} strokeDasharray="4 4" />
          <Polyline points={pontos} fill="none" stroke="#FF6B9A" strokeWidth={2.5} strokeLinejoin="round" />
        </Svg>
        <View style={s.botoes}>
          <Botao titulo="10 giros" variante="pedra" maiusculo={false} tamanhoFonte={14} altura={48} style={{ flex: 1 }} onPress={() => rodar(10)} />
          <Botao titulo="100 giros" variante="pedra" maiusculo={false} tamanhoFonte={14} altura={48} style={{ flex: 1 }} onPress={() => rodar(100)} />
          <Botao titulo="1000 giros" maiusculo={false} tamanhoFonte={14} altura={48} style={{ flex: 1 }} onPress={() => rodar(1000)} />
        </View>
        <Pressable accessibilityRole="button" onPress={() => setSim(INICIAL)} style={{ alignSelf: 'center', padding: 8 }}>
          <Text style={s.recomecar}>Recomeçar com R$ 100</Text>
        </Pressable>
      </View>

      <View style={s.botoes}>
        <View style={s.card}>
          <Text style={s.cardRotulo}>Você apostou</Text>
          <Text style={s.cardValor}>{brl(sim.apostado)}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardRotulo}>Voltou pra você</Text>
          <Text style={s.cardValor}>{brl(sim.voltou)}</Text>
        </View>
        <View style={[s.card, { backgroundColor: cor.alertaFundo, borderColor: '#F7C0CF' }]}>
          <Text style={[s.cardRotulo, { color: cor.alerta }]}>A casa levou</Text>
          <Text style={[s.cardValor, { color: cor.alerta }]}>{brl(Math.max(0, sim.apostado - sim.voltou))}</Text>
        </View>
      </View>

      {[
        ['O que é RTP', 'É quanto do que entra volta pros jogadores. Nesse simulador é 95%: a cada R$ 100 apostados, a casa fica com R$ 5. Sempre.'],
        ['O "quase ganhei" é de propósito', 'Mostrar o prêmio passando raspando faz o cérebro reagir como se fosse vitória. É desenho de produto, não sorte.'],
        ['"Tá pagando agora" não existe', 'Cada giro é sorteado do zero. O jogo não lembra o que aconteceu antes nem "deve" um prêmio pra ninguém.'],
      ].map(([t, d]) => (
        <View key={t} style={s.info}>
          <Text style={s.infoTitulo}>{t}</Text>
          <Text style={s.infoTexto}>{d}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  conteudo: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  tracinho: { width: 40, height: 5, borderRadius: 999, backgroundColor: cor.ouroBase },
  h1: { fontFamily: fonte.corpoBlack, fontSize: 30, lineHeight: 34, color: cor.tinta },
  texto: { fontFamily: fonte.corpo, fontSize: 14, lineHeight: 20, color: cor.tintaSuave },
  visor: { backgroundColor: cor.fundo, borderRadius: 22, padding: 16, gap: 12 },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  visorRotulo: { fontFamily: fonte.corpoBold, fontSize: 12, color: cor.textoSuave },
  visorSaldo: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 30, color: cor.ouro },
  botoes: { flexDirection: 'row', gap: 8 },
  recomecar: { fontFamily: fonte.corpoBold, fontSize: 13, color: cor.textoSuave, textDecorationLine: 'underline' },
  card: { flex: 1, backgroundColor: cor.card, borderWidth: 1, borderColor: cor.cardBorda, borderRadius: 16, padding: 12, gap: 4 },
  cardRotulo: { fontFamily: fonte.corpoBold, fontSize: 11, color: cor.tintaSuave },
  cardValor: { fontFamily: fonte.corpoBlack, fontSize: 16, color: cor.tinta },
  info: { backgroundColor: cor.card, borderWidth: 1, borderColor: cor.cardBorda, borderRadius: 16, padding: 14, gap: 4 },
  infoTitulo: { fontFamily: fonte.corpoBlack, fontSize: 15, color: cor.tinta },
  infoTexto: { fontFamily: fonte.corpo, fontSize: 13, lineHeight: 19, color: cor.tintaSuave },
});
