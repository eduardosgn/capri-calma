import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { Botao, BotaoVoltar, Icone, Pedra, Semente, TituloOuro, textoTitulo, FundoImagem } from '@/components/ui';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

type Item = { id: string; nome: string; tipo: string; preco?: number; cor: string; marcoDias?: number };

// Catálogo da Ilha 1. Preço fixo, tudo à vista, sem caixa surpresa.
const CATALOGO: Item[] = [
  { id: 'palha', nome: 'Chapéu de palha', tipo: 'Skin da Capi', preco: 150, cor: '#E9C46A' },
  { id: 'oculos', nome: 'Óculos escuros', tipo: 'Skin da Capi', preco: 200, cor: '#1A1340' },
  { id: 'capa', nome: 'Capa de chuva', tipo: 'Skin da Capi', preco: 250, cor: '#FFD23F' },
  { id: 'rede', nome: 'Rede entre árvores', tipo: 'Decoração', preco: 180, cor: '#FF3D7F' },
  { id: 'chuva', nome: 'Som de chuva', tipo: 'Tema da Maré', preco: 120, cor: '#4CC9F0' },
  { id: 'garca', nome: 'Garça companheira', tipo: 'Bicho', preco: 400, cor: '#FFFFFF' },
  { id: 'tartaruga', nome: 'Tartaruga', tipo: 'Bicho', preco: 1500, cor: '#9BCB1F' },
  { id: 'ponte', nome: 'Ponte pra ilha 2', tipo: 'Marco', cor: '#9C6B3E', marcoDias: 90 },
];

function Esfera({ c }: { c: string }) {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      <Ellipse cx={28} cy={50} rx={16} ry={3.5} fill="#000" opacity={0.35} />
      <Circle cx={28} cy={27} r={20} fill={c} stroke="#1E1A16" strokeWidth={2.5} />
      <Ellipse cx={21} cy={18} rx={7} ry={4.5} fill="#fff" opacity={0.55} />
    </Svg>
  );
}

export default function Loja() {
  const insets = useSafeAreaInsets();
  const sementes = useVirada((e) => e.sementes);
  const itens = useVirada((e) => e.itens);
  const diasTotais = useVirada((e) => e.diasTotais);
  const comprar = useVirada((e) => e.comprar);

  return (
    <FundoImagem source={require('../../assets/images/ilha.jpg')} style={s.tela} blurRadius={14}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,26,22,0.7)' }]} />
      <FlatList
        data={CATALOGO}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24, gap: 14 }}
        ListHeaderComponent={
          <View style={{ gap: 14, paddingTop: insets.top + 12, paddingBottom: 6 }}>
            <View style={s.topo}>
              <BotaoVoltar onPress={() => router.back()} />
              <Pedra style={s.saldo}>
                <Semente />
                <Text style={s.saldoTexto}>{sementes.toLocaleString('pt-BR')}</Text>
              </Pedra>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <TituloOuro tamanho={32}>LOJA DA ILHA</TituloOuro>
              <Text style={s.sub}>Preço fixo, tudo à vista. Sem surpresa.</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const tem = itens.includes(item.id);
          const bloqueado = item.marcoDias !== undefined && diasTotais < item.marcoDias;
          return (
            <Pedra style={s.card}>
              <Pedra escura style={s.vitrine}>
                <Esfera c={item.cor} />
              </Pedra>
              <View>
                <Text style={s.nome}>{item.nome}</Text>
                <Text style={s.tipo}>{item.tipo}</Text>
              </View>
              {tem ? (
                <View style={s.tem}>
                  <Text style={s.temTexto}>NA SUA ILHA</Text>
                </View>
              ) : item.marcoDias !== undefined ? (
                <View style={s.bloqueado}>
                  <Icone nome="cadeado" cor={cor.textoClaro} tamanho={14} espessura={2.6} />
                  <Text style={s.bloqueadoTexto}>{bloqueado ? `${item.marcoDias} dias` : 'Liberado'}</Text>
                </View>
              ) : (
                <Botao
                  titulo={String(item.preco)}
                  altura={46}
                  tamanhoFonte={15}
                  icone={<Semente tamanho={18} />}
                  desativado={sementes < (item.preco ?? 0)}
                  onPress={() => comprar(item.id, item.preco ?? 0)}
                />
              )}
            </Pedra>
          );
        }}
      />
    </FundoImagem>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saldo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  saldoTexto: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 16, color: cor.ouro },
  sub: { fontFamily: fonte.corpoBold, fontSize: 14, color: cor.textoClaro },
  card: { flex: 1, padding: 10, gap: 8 },
  vitrine: { height: 86, alignItems: 'center', justifyContent: 'center' },
  nome: { fontFamily: fonte.corpoBlack, fontSize: 14, color: cor.texto },
  tipo: { fontFamily: fonte.corpoBold, fontSize: 12, color: cor.textoSuave },
  tem: { height: 46, borderRadius: 14, backgroundColor: cor.verdeBase, borderWidth: 3, borderColor: cor.verdeBorda, alignItems: 'center', justifyContent: 'center' },
  temTexto: { ...textoTitulo, fontFamily: fonte.titulo, fontSize: 13, color: cor.verdeTexto },
  bloqueado: { height: 46, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#8C8170', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  bloqueadoTexto: { fontFamily: fonte.corpoExtra, fontSize: 13, color: cor.textoClaro },
});
