import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Barra, Botao, BotaoVoltar, Icone, Madeira, Pedra, Semente, textoTitulo, FundoImagem } from '@/components/ui';
import { hoje, marcosConquistados, partidasPagasRestantes, proximoMarco } from '@/logic/progresso';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

// No MVP a ilha é uma imagem pré-renderizada por etapa.
// Quando houver os renders de cada fase, troque a imagem conforme os marcos conquistados.
export default function Ilha() {
  const insets = useSafeAreaInsets();
  const e = useVirada();
  const marco = proximoMarco(e.diasTotais);
  const anterior = marcosConquistados(e.diasTotais).at(-1)?.dias ?? 0;
  const progresso = marco ? (e.diasTotais - anterior) / (marco.dias - anterior) : 1;
  const nublado = e.historico[hoje()] === 'recaida';
  const restantes = partidasPagasRestantes(e, hoje());

  return (
    <FundoImagem source={require('../../assets/images/ilha.jpg')} style={s.tela} resizeMode="cover">
      {nublado && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(40,36,60,0.5)' }]} />}
      <LinearGradient colors={['rgba(30,26,22,0)', 'rgba(30,26,22,0.75)']} locations={[0.55, 1]} style={StyleSheet.absoluteFill} />

      <View style={[s.topo, { paddingTop: insets.top + 12 }]}>
        <BotaoVoltar onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pedra style={s.pilula}>
            <Semente />
            <Text style={s.pilulaOuro}>{e.sementes.toLocaleString('pt-BR')}</Text>
          </Pedra>
          <Pedra style={s.pilula}>
            <Madeira />
            <Text style={s.pilulaOuro}>{e.madeira}</Text>
          </Pedra>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={[s.rodape, { paddingBottom: insets.bottom + 24 }]}>
        {nublado && (
          <Pedra style={s.painel}>
            <Text style={s.painelTexto}>A ilha tá nublada hoje, mas continua inteira. Amanhã o sol volta.</Text>
          </Pedra>
        )}
        {marco && (
          <Pedra style={s.painel}>
            <View style={s.linhaEntre}>
              <Text style={s.marcoNome}>PRÓXIMO MARCO: {marco.nome.toUpperCase()}</Text>
              <Text style={s.marcoFalta}>{marco.dias - e.diasTotais} dias</Text>
            </View>
            <Barra valor={progresso} altura={16} />
            <Text style={s.marcoDescricao}>{marco.descricao}</Text>
          </Pedra>
        )}
        <Botao
          titulo="Jogar Maré"
          altura={66}
          tamanhoFonte={22}
          icone={<Icone nome="ondas" cor={cor.ouroTexto} tamanho={26} espessura={2.8} />}
          onPress={() => router.push('/mare')}
        />
        <Text style={s.partidas}>
          {restantes > 0 ? `${restantes} de 3 partidas de hoje ainda dão sementes` : 'Sementes de hoje já ganhas. A Maré segue livre pra relaxar.'}
        </Text>
        <Botao titulo="Loja" variante="pedra" altura={54} tamanhoFonte={17} onPress={() => router.push('/loja')} />
      </View>
    </FundoImagem>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  pilula: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  pilulaOuro: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 16, color: cor.ouro },
  rodape: { paddingHorizontal: 16, gap: 12 },
  painel: { padding: 14, gap: 8 },
  painelTexto: { fontFamily: fonte.corpoBold, fontSize: 14, color: cor.texto },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  marcoNome: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 14, color: cor.texto },
  marcoFalta: { fontFamily: fonte.corpoBlack, fontSize: 13, color: cor.ouro },
  marcoDescricao: { fontFamily: fonte.corpoBold, fontSize: 13, color: cor.textoSuave },
  partidas: { fontFamily: fonte.corpoBold, fontSize: 13, color: cor.textoClaro, textAlign: 'center' },
});

