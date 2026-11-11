import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Barra, Botao, BotaoVoltar, Pedra, Rotulo, Semente, TituloOuro, textoTitulo, FundoImagem } from '@/components/ui';
import { GanhoPartida, REGRAS, hoje, partidasPagasRestantes, sementesPorTempo } from '@/logic/progresso';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

// Ritmo "Maré calma": 4s inspira, 4s solta. O círculo vai de 50 a 120 de raio.
const MEIO_CICLO = 4000;
const DURACAO = 180;
const R_MIN = 50;
const R_MAX = 120;
const JANELA_PERFEITO = 350; // ms de tolerância em volta do anel
const JANELA_BOA = 750;

export default function Mare() {
  const insets = useSafeAreaInsets();
  const estado = useVirada();
  const restantesHoje = partidasPagasRestantes(estado, hoje());

  const escala = useRef(new Animated.Value(R_MIN / R_MAX)).current;
  const inicio = useRef(Date.now());
  const [segundos, setSegundos] = useState(0);
  const [fase, setFase] = useState<'Inspira' | 'Solta'>('Inspira');
  const [combo, setCombo] = useState(0);
  const [melhor, setMelhor] = useState(0);
  const [perfeitos, setPerfeitos] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [feedback, setFeedback] = useState('Respira junto');
  const [resultado, setResultado] = useState<GanhoPartida | null>(null);
  const encerrada = useRef(false);

  useEffect(() => {
    inicio.current = Date.now();
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(escala, { toValue: 1, duration: MEIO_CICLO, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(escala, { toValue: R_MIN / R_MAX, duration: MEIO_CICLO, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    const relogio = setInterval(() => {
      if (encerrada.current) return; // relógio congela no tempo em que a partida acabou
      const t = Date.now() - inicio.current;
      setSegundos(Math.min(DURACAO, Math.floor(t / 1000)));
      setFase(t % (2 * MEIO_CICLO) < MEIO_CICLO ? 'Inspira' : 'Solta');
    }, 200);
    return () => {
      anim.stop();
      clearInterval(relogio);
    };
  }, [escala]);

  // Fim da partida (pelo tempo ou pelo botão Encerrar): aplica a recompensa uma vez só.
  const finalizar = (segundosJogados: number) => {
    if (encerrada.current) return;
    encerrada.current = true;
    setSegundos(segundosJogados);
    setResultado(estado.registrarPartida(segundosJogados, perfeitos, melhor));
  };

  useEffect(() => {
    if (segundos >= DURACAO) finalizar(DURACAO);
  });

  const encerrar = () => finalizar(Math.min(DURACAO, Math.floor((Date.now() - inicio.current) / 1000)));

  const tocar = () => {
    if (encerrada.current) return;
    const t = (Date.now() - inicio.current) % MEIO_CICLO;
    const distancia = Math.min(t, MEIO_CICLO - t);
    if (distancia < JANELA_PERFEITO) {
      const c = combo + 1;
      setCombo(c);
      setMelhor((m) => Math.max(m, c));
      setPerfeitos((p) => p + 1);
      setPontos((p) => p + 10 * c);
      setFeedback('Perfeito!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (distancia < JANELA_BOA) {
      const c = combo + 1;
      setCombo(c);
      setMelhor((m) => Math.max(m, c));
      setPontos((p) => p + 5);
      setFeedback('Boa');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else {
      setCombo(0);
      setFeedback('Respira e tenta de novo');
    }
  };

  const resta = DURACAO - segundos;
  const relogio = `${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}`;
  const garantido = sementesPorTempo(segundos);
  const curta = garantido === 0;

  return (
    <FundoImagem source={require('../../assets/images/ilha.jpg')} style={s.tela} blurRadius={12}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,26,22,0.6)' }]} />
      <View style={[s.topo, { paddingTop: insets.top + 12 }]}>
        <BotaoVoltar onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pedra style={s.pilula}>
            <Text style={s.pilulaTexto}>{relogio}</Text>
          </Pedra>
          {!resultado && <Botao titulo="Encerrar" variante="pedra" altura={43} tamanhoFonte={13} onPress={encerrar} />}
        </View>
      </View>

      {!resultado &&
        (restantesHoje > 0 ? (
          <Pedra escura style={s.degraus}>
            <View
              accessible
              accessibilityLabel={
                curta
                  ? `Com 1 minuto você garante ${REGRAS.degrausMare[0].sementes} sementes`
                  : `Garantido: ${garantido} sementes`
              }
              style={s.degrausTopo}
            >
              <Semente tamanho={16} />
              <Text style={s.degrausTexto}>
                {curta ? `Com 1 min: ${REGRAS.degrausMare[0].sementes} sementes` : `Garantido: ${garantido} sementes`}
              </Text>
            </View>
            <View style={s.degrausLinha}>
              {REGRAS.degrausMare.map((d, i) => {
                const anterior = i === 0 ? 0 : REGRAS.degrausMare[i - 1].segundos;
                return (
                  <View key={d.segundos} style={s.degrau}>
                    <Barra valor={(segundos - anterior) / (d.segundos - anterior)} altura={10} />
                    <Text style={[s.degrauRotulo, segundos >= d.segundos && { color: cor.ouro }]}>
                      {d.segundos / 60} min · {d.sementes}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pedra>
        ) : (
          <Pedra style={[s.pilula, s.diversao]}>
            <Semente tamanho={18} />
            <Text style={[s.pilulaTexto, { color: cor.ouro, fontSize: 13 }]}>só por diversão</Text>
          </Pedra>
        ))}

      {resultado ? (
        <View style={s.resultado}>
          <TituloOuro tamanho={34}>BOA RESPIRAÇÃO!</TituloOuro>
          <Pedra style={s.painel}>
            <Text style={s.resultadoLinha}>Perfeitos: {perfeitos} · Melhor combo: x{melhor}</Text>
            {resultado.paga ? (
              <Text style={s.resultadoGanho}>
                +{resultado.sementes} sementes{resultado.madeira ? ` · +${resultado.madeira} madeira` : ''}
              </Text>
            ) : curta && restantesHoje > 0 ? (
              <Text style={s.resultadoLinha}>Respirou um pouco. Partidas a partir de 1 minuto rendem sementes.</Text>
            ) : (
              <Text style={s.resultadoLinha}>Hoje você já ganhou tudo. Jogue pra relaxar.</Text>
            )}
          </Pedra>
          <Botao titulo="Voltar pra ilha" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <View style={{ alignItems: 'center', gap: 4, marginTop: 20 }}>
            <TituloOuro tamanho={38}>{fase.toUpperCase()}</TituloOuro>
            <Text style={s.instrucao}>Toca quando o círculo encostar num anel</Text>
          </View>

          <View style={s.palco}>
            <View style={[s.anel, { width: R_MAX * 2 + 28, height: R_MAX * 2 + 28, borderWidth: 8, borderColor: cor.pedra }]} />
            <View style={[s.anel, { width: R_MAX * 2, height: R_MAX * 2, borderColor: cor.ouroMeio, borderStyle: 'dashed' }]} />
            <View style={[s.anel, { width: R_MIN * 2, height: R_MIN * 2, borderColor: cor.ouroMeio, borderStyle: 'dashed' }]} />
            <Animated.View style={[s.agua, { transform: [{ scale: escala }] }]} />
            <View style={s.combo}>
              <TituloOuro tamanho={48}>x{combo}</TituloOuro>
              <Text style={s.feedback}>{feedback.toUpperCase()}</Text>
            </View>
          </View>

          <View style={[s.rodape, { paddingBottom: insets.bottom + 24 }]}>
            <View style={s.placar}>
              {[
                ['Pontos', String(pontos)],
                ['Perfeitos', String(perfeitos)],
                ['Melhor', `x${melhor}`],
              ].map(([r, v]) => (
                <Pedra key={r} escura style={s.placarItem}>
                  <Rotulo>{r}</Rotulo>
                  <Text style={s.placarValor}>{v}</Text>
                </Pedra>
              ))}
            </View>
            <Botao titulo="Tocar" altura={84} tamanhoFonte={28} onPress={tocar} />
          </View>
        </>
      )}
    </FundoImagem>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  pilula: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  pilulaTexto: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 16, color: cor.texto },
  diversao: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginTop: 10, marginRight: 16 },
  degraus: { marginTop: 10, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  degrausTopo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  degrausTexto: { fontFamily: fonte.corpoBlack, fontSize: 13, color: cor.texto },
  degrausLinha: { flexDirection: 'row', gap: 6 },
  degrau: { flex: 1, gap: 3 },
  degrauRotulo: { fontFamily: fonte.corpoExtra, fontSize: 11, color: cor.textoSuave, textAlign: 'right' },
  instrucao: { fontFamily: fonte.corpoBold, fontSize: 14, color: cor.textoClaro },
  palco: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  anel: { position: 'absolute', borderRadius: 999, borderWidth: 4 },
  agua: {
    position: 'absolute',
    width: R_MAX * 2,
    height: R_MAX * 2,
    borderRadius: 999,
    backgroundColor: cor.agua,
    borderWidth: 4,
    borderColor: cor.aguaEscura,
    opacity: 0.9,
  },
  combo: { alignItems: 'center' },
  feedback: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 16, color: cor.verdeTopo },
  rodape: { paddingHorizontal: 16, gap: 14 },
  placar: { flexDirection: 'row', gap: 8 },
  placarItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  placarValor: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 18, color: cor.ouro },
  resultado: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, gap: 18, alignItems: 'stretch' },
  painel: { padding: 16, gap: 8, alignItems: 'center' },
  resultadoLinha: { fontFamily: fonte.corpoBold, fontSize: 15, color: cor.texto, textAlign: 'center' },
  resultadoGanho: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 20, color: cor.ouro },
});
