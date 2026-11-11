import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  Estado,
  GanhoPartida,
  ResultadoDia,
  comprar,
  concluirOnboarding,
  estadoInicial,
  fecharDia,
  hoje,
  registrarPartida,
  venceuFissura,
} from '@/logic/progresso';

type Acoes = {
  concluirOnboarding: (gastoSemanal: number) => void;
  fecharHoje: (resultado: ResultadoDia) => void;
  registrarPartida: (segundos: number, perfeitos: number, melhorCombo: number) => GanhoPartida;
  venceuFissura: () => void;
  comprar: (id: string, preco: number) => boolean;
  apagarTudo: () => void;
};

// Tudo fica salvo só no aparelho (AsyncStorage). Nada vai pra servidor.
export const useVirada = create<Estado & Acoes>()(
  persist(
    (set, get) => ({
      ...estadoInicial,
      concluirOnboarding: (gasto) => set((e) => concluirOnboarding(e, gasto, hoje())),
      fecharHoje: (resultado) => set((e) => fecharDia(e, hoje(), resultado)),
      registrarPartida: (segundos, perfeitos, combo) => {
        const r = registrarPartida(get(), hoje(), segundos, perfeitos, combo);
        set(r.estado);
        return r.ganho;
      },
      venceuFissura: () => set((e) => venceuFissura(e)),
      comprar: (id, preco) => {
        const antes = get().itens.length;
        set((e) => comprar(e, id, preco));
        return get().itens.length > antes;
      },
      apagarTudo: () => set({ ...estadoInicial }),
    }),
    {
      // Chave do nome antigo do app (Virada). Não mudar: é onde está o progresso já salvo no aparelho.
      name: 'virada-estado-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** true quando os dados salvos já foram carregados do aparelho. */
export function useHidratado() {
  const [pronto, setPronto] = useState(useVirada.persist.hasHydrated());
  useEffect(() => {
    const desfazer = useVirada.persist.onFinishHydration(() => setPronto(true));
    setPronto(useVirada.persist.hasHydrated());
    return desfazer;
  }, []);
  return pronto;
}
