---
description: Use este skill ao fazer qualquer alteração visual no frontend — componentes, layout, cores, espaçamento ou novos elementos de UI. Garante que o código novo siga o design system do NewClinic.
---

# Design System — NewClinic

## Estrutura de layout

O app tem três camadas fixas:

```
┌─────────────────────────────────────┐
│  NewClinic              Olá, Nome  Sair │  ← .header (sticky, fundo branco)
├─────────────────────────────────────┤
│                                     │
│       [ Aba 1 ]  [ Aba 2 ]         │  ← .tab-bar (centralizado em .container)
│                                     │
│       (conteúdo da aba ativa)       │  ← páginas renderizadas pelo React Router
│                                     │
└─────────────────────────────────────┘
```

- `.header` — apenas marca e logout. Nunca adicionar links de navegação aqui.
- `.tab-bar` — navegação principal, centralizada, com botões `.tab` / `.tab.active`.
- `.container` — largura máxima 960px, centralizado, padding 24px lateral.

## Paleta de cores

| Token         | Valor     | Uso                              |
|---------------|-----------|----------------------------------|
| Azul primário | `#2563eb` | brand, botão padrão, tab ativa   |
| Azul hover    | `#1d4ed8` | hover de botão primário          |
| Cinza texto   | `#1f2937` | texto principal                  |
| Cinza suave   | `#6b7280` | textos secundários (.muted)      |
| Cinza borda   | `#e5e7eb` | bordas de cards e inputs         |
| Cinza fundo   | `#f4f6f8` | background da página             |
| Branco        | `#fff`    | fundo de cards e header          |

## Classes CSS reutilizáveis

### Navegação
- `.tab-bar` — container flex centralizado para as abas
- `.tab` — botão de aba (borda + fundo branco)
- `.tab.active` — aba selecionada (fundo azul primário)

### Containers
- `.card` — caixa branca com bordas arredondadas e sombra sutil
- `.center-box` — para telas de login/cadastro (max 420px, centralizado)
- `.list-item` — flex row para itens de lista com conteúdo à esquerda e ação à direita

### Botões
- `.btn` — botão primário azul
- `.btn.secondary` — cinza (ex: Sair)
- `.btn.success` — verde (ex: Aceitar)
- `.btn.danger` — vermelho (ex: Recusar)

### Formulários
- `.field` — wrapper flex coluna para label + input/select
- `.row` — agrupa campos lado a lado com flex wrap
- `.role-toggle` — seleção de perfil (Paciente / Clínica)

### Feedback
- `.badge.PENDENTE` — amarelo
- `.badge.ACEITO` — verde
- `.badge.RECUSADO` — vermelho
- `.error` — mensagem de erro vermelha
- `.muted` — texto cinza secundário

### Mídia
- `.avatar` — imagem de perfil circular 48×48px

## Padrões de componentes

### Adicionar uma nova aba de navegação
1. Adicionar o objeto `{ label, path }` no array `tabs` do componente `TabBar` em `App.tsx`.
2. Adicionar a rota correspondente dentro de `<Routes>` em `App.tsx`.
3. Criar a página em `frontend/src/pages/NomePagina.tsx`.

### Criar uma nova tela de conteúdo
- Envolver em `<div>` simples (não em `.container` — já existe no layout pai).
- Usar `.card` para seções de formulário ou listagens.
- Usar `.list-item` dentro de `.card` para cada item da lista.

### Regras de design
- Não adicionar links de navegação no `.header`.
- Não criar novas cores fora da paleta — usar as variáveis listadas acima.
- Manter bordas arredondadas de `8px` em inputs e `10px` em cards e tabs.
- Toda interação de botão deve ter estado `:hover` ou `.active`.
- Não usar `margin-top` em `.container` — usar a `tab-bar` como separador visual.

## Arquivos principais de UI

- `frontend/src/styles.css` — todo o CSS global do projeto
- `frontend/src/App.tsx` — layout raiz (Header, TabBar, Routes)
- `frontend/src/pages/` — uma página por rota
- `frontend/src/components/` — componentes reutilizáveis entre páginas
