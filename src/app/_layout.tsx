import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, BowlbyOne_400Regular } from '@expo-google-fonts/bowlby-one';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useHidratado } from '@/store/useVirada';
import { cor } from '@/theme';

export default function RootLayout() {
  const [fontesProntas] = useFonts({
    BowlbyOne_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  const hidratado = useHidratado();

  if (!fontesProntas || !hidratado) {
    return <View style={{ flex: 1, backgroundColor: cor.fundo }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cor.fundo } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="fissura" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="mare" options={{ gestureEnabled: false }} />
        <Stack.Screen name="ilha" />
        <Stack.Screen name="loja" />
      </Stack>
    </SafeAreaProvider>
  );
}
