import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Barra, Icone, Pedra, Rotulo, TituloOuro, textoTitulo, FundoImagem } from '@/components/ui';
import { MARCOS, nivel } from '@/logic/progresso';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

function Medalha() {
  return (
    <Svg width={52} height={56} viewBox="0 0 52 56">
      <Path d="M16 30 L10 54 L20 48 L26 56 L30 32 Z" fill="#F0306F" stroke="#3A1E00" strokeWidth={2} strokeLinejoin="round" />
      <Path d="M36 30 L42 54 L32 48 L26 56 L22 32 Z" fill="#C8124F" stroke="#3A1E00" strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={26} cy={22} r={19} fill="#FFC21A" stroke="#3A1E00" strokeWidth={3} />
      <Circle cx={26} cy={22} r={13} fill="#FFE27A" stroke="#E08A00" strokeWidth={2} />
      <Path d="m26 13 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#E08A00" />
    </Svg>
  );
}

export default function Conquistas() {
  const insets = useSafeAreaInsets();
  const e = useVirada();
  const n = nivel(e.xp);

  const extras = [
    { nome: 'Primeira fissura vencida', ganha: e.fissurasVencidas >= 1 },
    { nome: '5 fissuras vencidas', ganha: e.fissurasVencidas >= 5 },
    { nome: 'Sequência de 7', ganha: e.melhorSequencia >= 7 },
  ];
  const medalhas = [...MARCOS.map((m) => ({ nome: m.nome, ganha: e.diasTotais >= m.dias })), ...extras];

  return (
    <FundoImagem source={require('../../../assets/images/ilha.jpg')} style={{ flex: 1, backgroundColor: cor.fundo }} blurRadius={14}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,26,22,0.72)' }]} />
      <ScrollView contentContainerStyle={[s.conteudo, { paddingTop: insets.top + 16 }]}>
        <TituloOuro tamanho={32} style={{ textAlign: 'center' }}>CONQUISTAS</TituloOuro>

        <Pedra style={s.painel}>
          <View style={s.linhaEntre}>
            <Text style={s.nivel}>NÍVEL {n.numero} · {n.nome.toUpperCase()}</Text>
            <Text style={s.xp}>{n.xpNoNivel} / {n.xpParaProximo} XP</Text>
          </View>
          <Barra valor={n.xpNoNivel / n.xpParaProximo} altura={16} />
        </Pedra>

        <View style={s.resumo}>
          {[
            ['Dias totais', e.diasTotais],
            ['Melhor sequência', e.melhorSequencia],
            ['Fissuras vencidas', e.fissurasVencidas],
          ].map(([r, v]) => (
            <Pedra key={String(r)} escura style={s.resumoItem}>
              <Rotulo style={{ textAlign: 'center' }}>{r}</Rotulo>
              <Text style={s.resumoValor}>{v}</Text>
            </Pedra>
          ))}
        </View>

        <View style={s.grade}>
          {medalhas.map((m) =>
            m.ganha ? (
              <Pedra key={m.nome} style={s.medalha}>
                <Medalha />
                <Text style={s.medalhaNome}>{m.nome}</Text>
              </Pedra>
            ) : (
              <Pedra key={m.nome} escura style={s.medalha}>
                <View style={{ height: 56, justifyContent: 'center' }}>
                  <Icone nome="cadeado" cor="#8C8170" tamanho={30} espessura={2.4} />
                </View>
                <Text style={[s.medalhaNome, { color: cor.textoSuave }]}>{m.nome}</Text>
              </Pedra>
            ),
          )}
        </View>
      </ScrollView>
    </FundoImagem>
  );
}

const s = StyleSheet.create({
  conteudo: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  painel: { padding: 14, gap: 8 },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  nivel: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 16, color: cor.ouro },
  xp: { fontFamily: fonte.corpoExtra, fontSize: 12, color: cor.textoSuave },
  resumo: { flexDirection: 'row', gap: 8 },
  resumoItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  resumoValor: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 22, color: cor.ouro },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  medalha: { width: '31%', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, gap: 6 },
  medalhaNome: { fontFamily: fonte.corpoBlack, fontSize: 12, lineHeight: 15, color: cor.texto, textAlign: 'center' },
});
