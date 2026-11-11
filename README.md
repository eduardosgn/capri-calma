# Capi Calma

App pra ajudar quem quer largar as apostas (tigrinho, bets), com um jogo de respiração e uma ilha que cresce a cada dia sem apostar. Tudo fica salvo só no celular.

## Rodar no celular

1. Instale as dependências: `npm install --legacy-peer-deps`
2. Rode `npx expo start`
3. Abra o app **Expo Go** no celular e leia o QR code que aparece no terminal

> O `--legacy-peer-deps` evita um conflito de versões opcionais do React DOM que não afeta o app.

Comandos úteis:

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda os testes da lógica de progressão |
| `npm run typecheck` | Checa os tipos do TypeScript |
| `npx expo start --clear` | Inicia limpando o cache do Metro |

## O que já tem (MVP)

- **Onboarding**: gasto semanal, usado só pra calcular o dinheiro guardado.
- **Início**: dias sem apostar, sequência, check-in da noite ("Fechei o dia sem apostar" ou "Apostei hoje"), semana, próximo marco e dinheiro que ficou no bolso.
- **Botão de fissura**: 3 minutos de bolhas pra estourar, com vibração, e atalho pra Ajuda.
- **Maré**: jogo de respiração (4s inspira, 4s solta) com combo, perfeitos e recompensa pelo tempo jogado (dá pra encerrar antes dos 3 minutos).
- **Ilha**: render da Ilha 1, próximo marco, sementes e madeira, acesso à Maré e à Loja.
- **Loja**: preço fixo, tudo à vista, sem caixa surpresa.
- **Simulador da Verdade**: 10, 100 ou 1000 giros com RTP de 95% e o gráfico do saldo.
- **Conquistas**: nível, resumo e medalhas por marcos.
- **Ajuda**: CVV 188 com ligação direta e caminhos de apoio.

## Regras de progressão (resumo)

Estão em `src/logic/progresso.ts`, todas testadas em `src/logic/progresso.test.ts`.

- Só as **3 primeiras partidas da Maré por dia** dão sementes, pelo tempo jogado: **7** a partir de 1 min, **14** a partir de 2 min, **20** com os 3 min (teto de 60 por dia). Menos de 1 min não rende nem gasta partida. Depois das 3, a Maré segue livre, sem recompensa.
- Fechar o dia sem apostar dá **30 sementes** e soma **1 dia total**.
- **Recaída zera só a sequência.** Dias totais, itens e sementes ficam.
- Madeira: 1 por partida com 5 ou mais perfeitos, no máximo 2 por dia.

## Estrutura

```
src/
  app/            telas (Expo Router)
    (tabs)/       Início, Simulador, Conquistas, Ajuda
    onboarding.tsx, fissura.tsx, mare.tsx, ilha.tsx, loja.tsx
  components/ui.tsx   painéis de pedra, botões, ícones, barra
  logic/progresso.ts  regras puras de progressão
  store/useVirada.ts  estado salvo no aparelho (Zustand + AsyncStorage)
  theme/index.ts      cores e fontes
assets/images/    renders da ilha e da Capi
```

## Próximos passos

- Renders da Ilha 1 por etapa (vazia, com cais, horta, farol) e troca da imagem pelos marcos.
- Sons da Maré e do botão de fissura.
- Lembrete do check-in da noite (notificação local).
- Obras com madeira e pedra, álbum de peixes e missões da vida real (doc de design de progressão).
- Ícone e splash do app.
