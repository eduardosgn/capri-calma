import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icone } from '@/components/ui';
import { useVirada } from '@/store/useVirada';
import { cor, fonte } from '@/theme';

export default function TabsLayout() {
  const onboardingFeito = useVirada((e) => e.onboardingFeito);
  const insets = useSafeAreaInsets();

  if (!onboardingFeito) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cor.ouro,
        tabBarInactiveTintColor: cor.textoSuave,
        tabBarLabelStyle: { fontFamily: fonte.corpoExtra, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: cor.fundo,
          borderTopWidth: 3,
          borderTopColor: cor.pedraSombra,
          height: 64 + insets.bottom,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color }) => <Icone nome="inicio" cor={String(color)} /> }} />
      <Tabs.Screen name="simulador" options={{ title: 'Simulador', tabBarIcon: ({ color }) => <Icone nome="simulador" cor={String(color)} /> }} />
      <Tabs.Screen name="conquistas" options={{ title: 'Conquistas', tabBarIcon: ({ color }) => <Icone nome="conquistas" cor={String(color)} /> }} />
      <Tabs.Screen name="ajuda" options={{ title: 'Ajuda', tabBarIcon: ({ color }) => <Icone nome="ajuda" cor={String(color)} /> }} />
    </Tabs>
  );
}
