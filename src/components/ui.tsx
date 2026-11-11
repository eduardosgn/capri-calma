import { ReactNode } from 'react';
import { Image, ImageProps, ImageStyle, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect } from 'react-native-svg';
import { cor, fonte } from '@/theme';

/* ---------- Relevo (camadas: sombra embaixo, face com borda uniforme em cima) ---------- */
const BORDA = 3;

// Propriedades que posicionam/dimensionam o bloco inteiro; o resto (padding, gap, alinhamento) vai pra face.
const CHAVES_EXTERNAS = new Set<string>([
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical',
  'marginStart', 'marginEnd', 'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'alignSelf',
  'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight', 'aspectRatio',
  'position', 'top', 'bottom', 'left', 'right', 'start', 'end', 'zIndex', 'opacity', 'transform', 'display',
]);

function separarEstilo(style: StyleProp<ViewStyle>) {
  const { borderRadius, borderBottomWidth, ...resto } = StyleSheet.flatten(style) ?? {};
  const externo: Record<string, unknown> = {};
  const interno: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(resto)) (CHAVES_EXTERNAS.has(k) ? externo : interno)[k] = v;
  return {
    externo: externo as ViewStyle,
    interno: interno as ViewStyle,
    raio: typeof borderRadius === 'number' ? borderRadius : undefined,
    relevo: typeof borderBottomWidth === 'number' ? borderBottomWidth : undefined,
  };
}

type Cores = readonly [string, string, ...string[]];

/**
 * Bloco com relevo inferior sem bordas de larguras diferentes.
 * `relevo` é a altura total da faixa escura de baixo (borda da face + sombra), como o antigo borderBottomWidth.
 * `style` aceita o mesmo estilo que antes ia direto no bloco: `borderRadius` e `borderBottomWidth`
 * viram raio/relevo, props de layout ficam no contêiner e o resto (padding, gap...) vai pra face.
 */
export function Relevo({
  children,
  corBorda,
  corSombra = corBorda,
  fundo,
  raio: raioPadrao = 16,
  relevo: relevoPadrao = BORDA,
  afundado = false,
  style,
}: {
  children?: ReactNode;
  corBorda: string;
  corSombra?: string;
  fundo: string | Cores;
  raio?: number;
  relevo?: number;
  afundado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { externo, interno, raio = raioPadrao, relevo = relevoPadrao } = separarEstilo(style);
  const sombra = Math.max(0, relevo - BORDA);
  const raioInterno = Math.max(0, raio - BORDA);
  return (
    <View style={externo}>
      {sombra > 0 && (
        <View
          pointerEvents="none"
          style={[s.relevoSombra, { top: sombra, borderRadius: raio, backgroundColor: corSombra }]}
        />
      )}
      <View
        style={[
          s.relevoFace,
          { marginBottom: sombra, borderRadius: raio, borderColor: corBorda },
          afundado && sombra > 0 && { transform: [{ translateY: sombra }] },
          interno,
        ]}
      >
        {typeof fundo === 'string' ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: raioInterno, backgroundColor: fundo }]} />
        ) : (
          <LinearGradient pointerEvents="none" colors={fundo} style={[StyleSheet.absoluteFill, { borderRadius: raioInterno }]} />
        )}
        {children}
      </View>
    </View>
  );
}

/* ---------- Fundo com imagem (substitui o ImageBackground, deprecated no RN) ---------- */
export function FundoImagem({
  children,
  style,
  imageStyle,
  ...imagem
}: Omit<ImageProps, 'style' | 'children'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}) {
  // Mesmo comportamento do ImageBackground: a imagem preenche o contêiner e herda width/height dele.
  const { width, height } = StyleSheet.flatten(style) ?? {};
  return (
    <View style={style}>
      <Image {...imagem} style={[StyleSheet.absoluteFill, { width, height }, imageStyle]} />
      {children}
    </View>
  );
}

/* ---------- Painel de pedra ---------- */
export function Pedra({
  children,
  escura,
  style,
}: {
  children?: ReactNode;
  escura?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return escura ? (
    <Relevo corBorda={cor.pedraSombra} fundo={cor.pedraEscura} raio={14} style={style}>
      {children}
    </Relevo>
  ) : (
    <Relevo corBorda={cor.pedraBorda} corSombra={cor.pedraSombra} fundo={cor.pedra} raio={16} relevo={7} style={style}>
      {children}
    </Relevo>
  );
}

/* ---------- Botões ---------- */
type Variante = 'ouro' | 'rosa' | 'pedra';
const GRADIENTES: Record<Exclude<Variante, 'pedra'>, [string, string, string]> = {
  ouro: [cor.ouroTopo, cor.ouroMeio, cor.ouroBase],
  rosa: [cor.rosaTopo, cor.rosaMeio, cor.rosaBase],
};
const BORDAS: Record<Variante, string> = {
  ouro: cor.ouroBorda,
  rosa: cor.rosaBorda,
  pedra: cor.pedraSombra,
};

export function Botao({
  titulo,
  onPress,
  variante = 'ouro',
  altura = 60,
  icone,
  maiusculo = true,
  tamanhoFonte = 18,
  desativado,
  style,
}: {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  altura?: number;
  icone?: ReactNode;
  maiusculo?: boolean;
  tamanhoFonte?: number;
  desativado?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const corTexto = variante === 'ouro' ? cor.ouroTexto : variante === 'rosa' ? '#FFFFFF' : cor.texto;
  const conteudo = (
    <View style={s.botaoConteudo}>
      {icone}
      <Text
        style={[
          s.botaoTexto,
          { color: corTexto, fontSize: tamanhoFonte },
          !maiusculo && { textTransform: 'none', fontFamily: fonte.corpoBlack },
        ]}
      >
        {titulo}
      </Text>
    </View>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      disabled={desativado}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={[{ height: altura }, desativado && { opacity: 0.5 }, style]}
    >
      {({ pressed }) => (
        <Relevo
          corBorda={BORDAS[variante]}
          fundo={variante === 'pedra' ? cor.pedra : GRADIENTES[variante]}
          raio={18}
          relevo={7}
          afundado={pressed}
          style={s.botaoRelevo}
        >
          {conteudo}
        </Relevo>
      )}
    </Pressable>
  );
}

/* ---------- Textos ---------- */
/**
 * Bowlby One: ascendente 1.111 e descendente 0.455 do tamanho (altura natural 1.566).
 * Uma lineHeight menor que isso corta o topo das letras no iOS, então os textos com
 * fonte.titulo usam a altura natural. Use este estilo em todo texto com fonte.titulo.
 */
export const textoTitulo = { includeFontPadding: false, textAlignVertical: 'center' } as const satisfies TextStyle;

// O TituloOuro ocupava 1.15 do tamanho no layout. A margem negativa devolve esse espaço
// (como o line-height 1.15 do protótipo), sem limitar a área onde as letras são desenhadas.
const ALTURA_NATURAL_TITULO = 1.566;
const ALTURA_LAYOUT_TITULO = 1.15;
const COMPENSACAO_TITULO = (ALTURA_NATURAL_TITULO - ALTURA_LAYOUT_TITULO) / 2;

export function TituloOuro({ children, tamanho = 32, style }: { children: ReactNode; tamanho?: number; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[s.tituloOuro, { fontSize: tamanho, marginVertical: -tamanho * COMPENSACAO_TITULO }, style]}>
      {children}
    </Text>
  );
}

export function Rotulo({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.rotulo, style]}>{children}</Text>;
}

export function Corpo({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.corpo, style]}>{children}</Text>;
}

/* ---------- Barra de progresso ---------- */
export function Barra({ valor, altura = 14 }: { valor: number; altura?: number }) {
  const pct = Math.max(0, Math.min(1, valor));
  return (
    <View style={[s.trilho, { height: altura }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}>
      <LinearGradient colors={[cor.verdeTopo, cor.verdeBase]} style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 999 }} />
    </View>
  );
}

/* ---------- Ícones (mesmos traços do protótipo) ---------- */
const CAMINHOS = {
  inicio: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  simulador: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  conquistas: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  ajuda: 'M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z',
  chama: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
  voltar: 'M15 18 9 12l6-6',
  ondas: 'M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  check: 'm5 12 5 5 9-10',
  telefone:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
} as const;
export type NomeIcone = keyof typeof CAMINHOS | 'cadeado';

export function Icone({ nome, cor: c = cor.texto, tamanho = 24, espessura = 2.2 }: { nome: NomeIcone; cor?: string; tamanho?: number; espessura?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={espessura} strokeLinecap="round" strokeLinejoin="round">
      {nome === 'cadeado' ? (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={2} />
          <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      ) : (
        <Path d={CAMINHOS[nome]} />
      )}
    </Svg>
  );
}

export function Semente({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M12 22V12" stroke={cor.fundo} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M12 12C12 6.5 8 3 2.5 3c0 5.5 4 9 9.5 9z" fill="#8FD14F" stroke={cor.fundo} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 14c0-4.5 3.5-8 9-8 0 4.5-3.5 8-9 8z" fill={cor.verdeTopo} stroke={cor.fundo} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function Madeira({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Rect x={3} y={8} width={16} height={9} rx={4.5} fill="#B07A48" stroke={cor.fundo} strokeWidth={1.8} />
      <Rect x={14.5} y={8} width={6.5} height={9} rx={3.25} fill="#E2B57E" stroke={cor.fundo} strokeWidth={1.8} />
      <Path d="M17.75 11v3" stroke="#9C6B3E" strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export function BotaoVoltar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onPress} style={s.voltar}>
      <Relevo corBorda={cor.pedraBorda} corSombra={cor.pedraSombra} fundo={cor.pedra} raio={14} relevo={7} style={s.voltarRelevo}>
        <Icone nome="voltar" espessura={3} />
      </Relevo>
    </Pressable>
  );
}

const s = StyleSheet.create({
  relevoSombra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  relevoFace: {
    flexGrow: 1,
    borderWidth: BORDA,
    overflow: 'hidden',
  },
  botaoRelevo: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  botaoConteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  botaoTexto: {
    ...textoTitulo,
    fontFamily: fonte.titulo,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tituloOuro: {
    ...textoTitulo,
    fontFamily: fonte.titulo,
    color: cor.ouro,
    textShadowColor: cor.ouroTexto,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 1,
  },
  rotulo: {
    fontFamily: fonte.corpoExtra,
    fontSize: 12,
    letterSpacing: 0.8,
    color: cor.textoSuave,
    textTransform: 'uppercase',
  },
  corpo: {
    fontFamily: fonte.corpo,
    fontSize: 15,
    lineHeight: 22,
    color: cor.textoClaro,
  },
  trilho: {
    backgroundColor: cor.fundo,
    borderWidth: 2,
    borderColor: cor.pedraSombra,
    borderRadius: 999,
    overflow: 'hidden',
  },
  voltar: {
    width: 48,
    height: 48,
  },
  voltarRelevo: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
