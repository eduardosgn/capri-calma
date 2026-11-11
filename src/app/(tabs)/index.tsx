import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Barra, Botao, Icone, Pedra, Relevo, Rotulo, TituloOuro, textoTitulo, FundoImagem } from '@/components/ui';
import { dinheiroGuardado, hoje, marcosConquistados, proximoMarco, semanaAtual } from '@/logic/progresso';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const e = useVirada();
  const dia = hoje();
  const resultadoHoje = e.historico[dia];
  const marco = proximoMarco(e.diasTotais);
  const anterior = marcosConquistados(e.diasTotais).at(-1)?.dias ?? 0;
  const progressoMarco = marco ? (e.diasTotais - anterior) / (marco.dias - anterior) : 1;
  const semana = semanaAtual(e, dia);
  const guardado = dinheiroGuardado(e);

  return (
    <View style={{ flex: 1, backgroundColor: cor.fundo }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <FundoImagem source={require('../../../assets/images/ilha.jpg')} style={s.capa} imageStyle={{ top: -40 }}>
          <LinearGradient colors={['rgba(30,26,22,0.4)', 'rgba(30,26,22,0)', cor.fundo]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
          <View style={[s.topo, { paddingTop: insets.top + 12 }]}>
            <View style={s.cabecalho}>
              <Text style={s.saudacao}>{saudacao()}</Text>
              <TituloOuro tamanho={24}>SUA VIRADA</TituloOuro>
            </View>
            <Pedra style={s.sequencia}>
              <Icone nome="chama" cor="#FF8FB4" tamanho={16} espessura={2.6} />
              <Text style={s.sequenciaTexto}>Sequência {e.sequencia}</Text>
            </Pedra>
          </View>
          <View style={s.capaRodape}>
            <View>
              <TituloOuro tamanho={60}>{e.diasTotais}</TituloOuro>
              <Text style={s.diasLegenda}>{e.diasTotais === 1 ? 'DIA SEM APOSTAR' : 'DIAS SEM APOSTAR'}</Text>
            </View>
            <Botao titulo="Entrar na ilha" altura={46} tamanhoFonte={14} onPress={() => router.push('/ilha')} />
          </View>
        </FundoImagem>

        <View style={s.corpo}>
          {!resultadoHoje ? (
            <Pedra style={s.painel}>
              <Text style={s.painelTitulo}>Como foi hoje?</Text>
              <Botao titulo="Fechei o dia sem apostar" maiusculo={false} tamanhoFonte={16} altura={54} onPress={() => e.fecharHoje('limpo')} />
              <Pressable accessibilityRole="button" onPress={() => e.fecharHoje('recaida')} style={s.linkRecaida}>
                <Text style={s.linkRecaidaTexto}>Apostei hoje</Text>
              </Pressable>
            </Pedra>
          ) : resultadoHoje === 'limpo' ? (
            <Pedra style={[s.painel, s.linha]}>
              <Icone nome="check" cor={cor.verdeTopo} espessura={3} />
              <Text style={s.painelTitulo}>Dia fechado. +30 sementes pra ilha.</Text>
            </Pedra>
          ) : (
            <Pedra style={s.painel}>
              <Text style={s.painelTitulo}>Recomeçar também conta.</Text>
              <Text style={s.painelTexto}>
                A sequência zerou, mas tudo que você construiu continua aí: {e.diasTotais} dias, a ilha e os itens.
              </Text>
              <Botao titulo="Quero falar com alguém" variante="pedra" maiusculo={false} tamanhoFonte={15} altura={50} onPress={() => router.push('/ajuda')} />
            </Pedra>
          )}

          <Pedra style={s.painel}>
            <View style={s.semana}>
              {semana.map((d) => (
                <View key={d.data} style={s.diaSemana}>
                  <Text style={s.diaLetra}>{d.letra}</Text>
                  {d.resultado === 'limpo' ? (
                    <Relevo corBorda={cor.ouroBorda} fundo={[cor.ouroTopo, cor.ouroMeio, cor.ouroBase]} style={s.quadrado}>
                      <Icone nome="check" cor={cor.ouroTexto} tamanho={16} espessura={3.4} />
                    </Relevo>
                  ) : d.resultado === 'recaida' ? (
                    <Relevo corBorda={cor.pedraSombra} fundo={cor.pedraEscura} style={s.quadrado}>
                      <Text style={s.recaidaMarca}>·</Text>
                    </Relevo>
                  ) : (
                    <Relevo corBorda={cor.pedraSombra} fundo={cor.pedraEscura} style={[s.quadrado, { opacity: d.futuro ? 0.5 : 1 }]} />
                  )}
                </View>
              ))}
            </View>
            {marco && (
              <View style={{ gap: 6 }}>
                <View style={s.linhaEntre}>
                  <Text style={s.metaTexto}>Próximo marco: {marco.nome}</Text>
                  <Text style={[s.metaTexto, { color: cor.ouro }]}>faltam {marco.dias - e.diasTotais}</Text>
                </View>
                <Barra valor={progressoMarco} />
              </View>
            )}
          </Pedra>

          <Pedra style={[s.painel, s.linhaEntre]}>
            <View>
              <Rotulo>Ficou no seu bolso</Rotulo>
              <TituloOuro tamanho={30}>R$ {guardado.toLocaleString('pt-BR')}</TituloOuro>
            </View>
            <Text style={s.equivalencia}>
              {guardado >= 50 ? `Dá pra ${Math.floor(guardado / 50)} pizza${guardado >= 100 ? 's' : ''} com a família` : 'Cada dia limpo soma aqui'}
            </Text>
          </Pedra>

          <Botao
            titulo="Tô com vontade agora"
            variante="rosa"
            altura={68}
            tamanhoFonte={19}
            icone={<Icone nome="chama" cor="#FFFFFF" espessura={2.6} />}
            onPress={() => router.push('/fissura')}
            style={{ marginTop: 4 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  capa: { height: 300, justifyContent: 'space-between' },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16 },
  cabecalho: { gap: 4 },
  saudacao: { fontFamily: fonte.corpoExtra, fontSize: 14, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  sequencia: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  sequenciaTexto: { fontFamily: fonte.corpoBlack, fontSize: 13, color: '#FF8FB4' },
  capaRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 12 },
  diasLegenda: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 13, color: cor.texto },
  corpo: { paddingHorizontal: 16, gap: 16, marginTop: 8 },
  painel: { padding: 14, gap: 12 },
  painelTitulo: { fontFamily: fonte.corpoBlack, fontSize: 16, color: cor.texto },
  painelTexto: { fontFamily: fonte.corpo, fontSize: 14, lineHeight: 20, color: cor.textoClaro },
  linha: { flexDirection: 'row', alignItems: 'center' },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkRecaida: { alignSelf: 'center', padding: 8 },
  linkRecaidaTexto: { fontFamily: fonte.corpoBold, fontSize: 14, color: cor.textoSuave, textDecorationLine: 'underline' },
  semana: { flexDirection: 'row', justifyContent: 'space-between' },
  diaSemana: { alignItems: 'center', gap: 6 },
  diaLetra: { fontFamily: fonte.corpoExtra, fontSize: 11, color: cor.textoSuave },
  quadrado: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recaidaMarca: { color: cor.textoSuave, fontSize: 20, lineHeight: 22 },
  metaTexto: { fontFamily: fonte.corpoExtra, fontSize: 13, color: cor.texto },
  equivalencia: { maxWidth: 150, fontFamily: fonte.corpoExtra, fontSize: 13, lineHeight: 18, color: cor.texto, textAlign: 'right' },
});
