import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Barra, Botao, BotaoVoltar, Pedra, TituloOuro } from '@/components/ui';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

const DURACAO = 180; // segundos
const TOTAL_BOLHAS = 25;

export default function Fissura() {
  const insets = useSafeAreaInsets();
  const vencidas = useVirada((e) => e.fissurasVencidas);
  const venceu = useVirada((e) => e.venceuFissura);
  const [segundos, setSegundos] = useState(0);
  const [estouradas, setEstouradas] = useState<boolean[]>(() => Array(TOTAL_BOLHAS).fill(false));

  useEffect(() => {
    const id = setInterval(() => setSegundos((t) => Math.min(DURACAO, t + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const restantes = estouradas.filter((b) => !b).length;
  const resta = DURACAO - segundos;
  const relogio = `${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}`;

  const estourar = (i: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setEstouradas((atual) => {
      const novo = atual.map((b, j) => (j === i ? true : b));
      // Quando todas estouram, começa uma rodada nova pra pessoa continuar ocupada.
      return novo.every(Boolean) ? Array(TOTAL_BOLHAS).fill(false) : novo;
    });
  };

  return (
    <View style={[s.tela, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
      <View style={s.topo}>
        <BotaoVoltar onPress={() => router.back()} />
        <Text style={s.vencidas}>Você já venceu {vencidas} {vencidas === 1 ? 'fissura' : 'fissuras'}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={s.h1}>Segura comigo.{'\n'}A vontade passa.</Text>
        <Text style={s.texto}>A fissura costuma durar poucos minutos. Estoura as bolhas enquanto o tempo corre.</Text>
      </View>

      <Pedra style={s.painel}>
        <View style={s.linhaEntre}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <TituloOuro tamanho={30}>{relogio}</TituloOuro>
            <Text style={s.legenda}>{resta === 0 ? 'passou o tempo' : 'de 3 min'}</Text>
          </View>
          <Pedra escura style={s.contador}>
            <Text style={s.contadorTexto}>faltam {restantes}</Text>
          </Pedra>
        </View>
        <Barra valor={segundos / DURACAO} altura={12} />
        <Pedra escura style={s.grade}>
          {estouradas.map((estourada, i) =>
            estourada ? (
              <View key={i} style={[s.bolha, s.bolhaVazia]} />
            ) : (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel="Estourar bolha" onPress={() => estourar(i)} style={s.bolhaToque}>
                <LinearGradient colors={['#DFF6FF', '#6FD0F5', '#1F7FBF']} start={{ x: 0.3, y: 0.2 }} end={{ x: 0.8, y: 1 }} style={[s.bolha, s.bolhaCheia]} />
              </Pressable>
            ),
          )}
        </Pedra>
      </Pedra>

      <View style={{ flex: 1 }} />

      <View style={{ gap: 12 }}>
        <Botao
          titulo="Passou! Voltar pro meu dia"
          altura={62}
          tamanhoFonte={16}
          onPress={() => {
            venceu();
            router.back();
          }}
        />
        <Botao
          titulo="Ainda tá forte. Quero falar com alguém"
          variante="pedra"
          maiusculo={false}
          tamanhoFonte={15}
          altura={54}
          onPress={() => router.replace('/ajuda')}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16, gap: 18 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vencidas: { fontFamily: fonte.corpoBold, fontSize: 13, color: cor.textoSuave },
  h1: { fontFamily: fonte.corpoBlack, fontSize: 32, lineHeight: 36, color: '#FFFFFF' },
  texto: { fontFamily: fonte.corpo, fontSize: 15, lineHeight: 22, color: cor.textoClaro },
  painel: { padding: 14, gap: 14 },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legenda: { fontFamily: fonte.corpoExtra, fontSize: 13, color: cor.textoSuave },
  contador: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  contadorTexto: { fontFamily: fonte.corpoBlack, fontSize: 13, color: cor.verdeTopo },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, padding: 12 },
  bolhaToque: { width: '17%', aspectRatio: 1 },
  bolha: { width: '100%', aspectRatio: 1, borderRadius: 999 },
  bolhaCheia: { borderWidth: 3, borderColor: cor.aguaEscura },
  bolhaVazia: { width: '17%', borderWidth: 2, borderStyle: 'dashed', borderColor: '#6B6257' },
});
