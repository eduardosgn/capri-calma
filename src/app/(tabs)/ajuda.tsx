import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icone } from '@/components/ui';
import { cor, fonte } from '@/theme';

// Tela calma de propósito: sem visual de jogo, texto claro, ajuda real em primeiro lugar.
const CAMINHOS = [
  {
    titulo: 'Jogadores Anônimos',
    texto: 'Grupos de apoio gratuitos, presenciais e online, de pessoas que passaram pelo mesmo.',
  },
  {
    titulo: 'CAPS da sua cidade',
    texto: 'O SUS atende dependência de jogo de graça nos Centros de Atenção Psicossocial. Procure o mais perto de você.',
  },
  {
    titulo: 'Autoexclusão nas bets',
    texto: 'As casas de aposta regulamentadas são obrigadas a oferecer a opção de bloquear a sua conta. Procure por "autoexclusão" no app ou site da bet.',
  },
  {
    titulo: 'Bloquear sites de aposta',
    texto: 'Filtros de conteúdo do próprio celular (controle parental) conseguem bloquear sites e apps de aposta.',
  },
];

export default function Ajuda() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: cor.creme }} contentContainerStyle={[s.conteudo, { paddingTop: insets.top + 20 }]}>
      <View style={s.tracinho} />
      <Text style={s.h1}>Você não precisa passar por isso sozinho.</Text>
      <Text style={s.texto}>O app ajuda no dia a dia, mas conversar com gente de verdade faz muita diferença.</Text>

      <Pressable accessibilityRole="button" accessibilityLabel="Ligar pro CVV, 188" onPress={() => Linking.openURL('tel:188')} style={({ pressed }) => [s.cvv, pressed && { opacity: 0.85 }]}>
        <View style={s.cvvIcone}>
          <Icone nome="telefone" cor="#FFFFFF" tamanho={22} espessura={2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.cvvTitulo}>Ligar pro CVV · 188</Text>
          <Text style={s.cvvTexto}>Grátis, 24 horas, pra qualquer aperto</Text>
        </View>
      </Pressable>

      <View style={s.lista}>
        {CAMINHOS.map((c, i) => (
          <View key={c.titulo} style={[s.item, i < CAMINHOS.length - 1 && s.itemBorda]}>
            <Text style={s.itemTitulo}>{c.titulo}</Text>
            <Text style={s.itemTexto}>{c.texto}</Text>
          </View>
        ))}
      </View>

      <Text style={s.rodape}>Se você estiver pensando em se machucar, ligue 188 ou procure o pronto-socorro mais próximo.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  conteudo: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  tracinho: { width: 40, height: 5, borderRadius: 999, backgroundColor: cor.ouroBase },
  h1: { fontFamily: fonte.corpoBlack, fontSize: 30, lineHeight: 34, color: cor.tinta },
  texto: { fontFamily: fonte.corpo, fontSize: 15, lineHeight: 22, color: cor.tintaSuave },
  cvv: { backgroundColor: cor.verdeCalmo, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  cvvIcone: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#24521F', alignItems: 'center', justifyContent: 'center' },
  cvvTitulo: { fontFamily: fonte.corpoBlack, fontSize: 17, color: '#FFFFFF' },
  cvvTexto: { fontFamily: fonte.corpo, fontSize: 13, color: '#DDEFD9' },
  lista: { backgroundColor: cor.card, borderWidth: 1, borderColor: cor.cardBorda, borderRadius: 20 },
  item: { padding: 16, gap: 4 },
  itemBorda: { borderBottomWidth: 1, borderBottomColor: cor.cardBorda },
  itemTitulo: { fontFamily: fonte.corpoExtra, fontSize: 15, color: cor.tinta },
  itemTexto: { fontFamily: fonte.corpo, fontSize: 13, lineHeight: 19, color: cor.tintaSuave },
  rodape: { fontFamily: fonte.corpoBold, fontSize: 13, lineHeight: 19, color: cor.tintaSuave },
});
