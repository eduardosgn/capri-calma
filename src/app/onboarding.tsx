import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao, Corpo, Pedra, TituloOuro, FundoImagem } from '@/components/ui';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

const GASTOS = [
  { rotulo: 'R$ 50', valor: 50 },
  { rotulo: 'R$ 100', valor: 100 },
  { rotulo: 'R$ 250', valor: 250 },
  { rotulo: 'R$ 500 ou mais', valor: 500 },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const concluir = useVirada((e) => e.concluirOnboarding);
  const [gasto, setGasto] = useState(100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cor.fundo }} contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}>
      <FundoImagem source={require('../../assets/images/ilha.jpg')} style={s.capa} resizeMode="cover">
        <LinearGradient colors={['rgba(30,26,22,0.25)', 'rgba(30,26,22,0)', cor.fundo]} style={StyleSheet.absoluteFill} />
        <View style={[s.logo, { marginTop: insets.top + 32 }]}>
          {/* Duas linhas: "CAPI CALMA" em 54 não cabe na largura de um iPhone. */}
          <View accessible accessibilityRole="header" accessibilityLabel="Capi Calma" style={s.nomeApp}>
            <TituloOuro tamanho={54}>CAPI</TituloOuro>
            <TituloOuro tamanho={54}>CALMA</TituloOuro>
          </View>
          <Pedra style={s.plaquinha}>
            <Text style={s.plaquinhaTexto}>SEM APOSTA, SÓ VITÓRIA</Text>
          </Pedra>
        </View>
      </FundoImagem>

      <View style={s.conteudo}>
        <Text style={s.h1}>Bora virar o jogo.</Text>
        <Corpo>
          Sem julgamento. Aqui cada dia sem apostar vale ponto, e o dinheiro que ficou no bolso aparece na sua frente.
        </Corpo>

        <Text style={s.pergunta}>Quanto você costumava gastar por semana com apostas?</Text>
        <View style={s.grade}>
          {GASTOS.map((g) => (
            <Botao
              key={g.valor}
              titulo={g.rotulo}
              variante={gasto === g.valor ? 'ouro' : 'pedra'}
              maiusculo={false}
              tamanhoFonte={16}
              altura={54}
              onPress={() => setGasto(g.valor)}
              style={s.opcao}
            />
          ))}
        </View>
        <Text style={s.nota}>Esse valor é usado só pra calcular quanto você já deixou de gastar.</Text>

        <View style={{ flex: 1, minHeight: 24 }} />

        <Botao
          titulo="Começar minha virada"
          altura={66}
          tamanhoFonte={19}
          onPress={() => {
            concluir(gasto);
            router.replace('/');
          }}
        />
        <Text style={s.privacidade}>Seus dados ficam só no seu celular.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  capa: { height: 320 },
  logo: { alignItems: 'center', gap: 6 },
  nomeApp: { alignItems: 'center' },
  plaquinha: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderBottomWidth: 5 },
  plaquinhaTexto: { fontFamily: fonte.corpoBlack, fontSize: 12, letterSpacing: 1, color: cor.texto },
  conteudo: { flex: 1, paddingHorizontal: 20, gap: 14, marginTop: -20 },
  h1: { fontFamily: fonte.corpoBlack, fontSize: 30, color: '#FFFFFF' },
  pergunta: { fontFamily: fonte.corpoExtra, fontSize: 15, color: cor.texto, marginTop: 8 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcao: { width: '48%' },
  nota: { fontFamily: fonte.corpo, fontSize: 13, color: cor.textoSuave },
  privacidade: { fontFamily: fonte.corpoBold, fontSize: 13, color: cor.textoSuave, textAlign: 'center', marginTop: 4 },
});
