---
description: Use este skill ao fazer qualquer alteração visual no frontend — componentes, layout, cores, espaçamento ou novos elementos de UI. Garante que o código novo siga o design system do NewClinic.
---

# Design System — NewClinic

## Estrutura de layout

O app tem três camadas fixas:

```
┌─────────────────────────────────────────────┐
│  NewClinic (gradiente teal→cyan→indigo)  Sair│  ← .header (sticky, gradiente)
├─────────────────────────────────────────────┤
│                                             │
│         [ Aba 1 ]  [ Aba 2 ]               │  ← .tab-bar (centralizado em .container)
│                                             │
│         (conteúdo da aba ativa)             │  ← páginas renderizadas pelo React Router
│                                             │
└─────────────────────────────────────────────┘
```

- `.header` — gradiente colorido, apenas marca e botão Sair. Nunca adicionar links de nav aqui.
- `.tab-bar` — navegação principal, centralizada, com botões `.tab` / `.tab.active`.
- `.container` — largura máxima 960px, centralizado, padding 28px lateral.

## Paleta de cores (variáveis CSS em :root)

| Variável          | Valor       | Uso                                        |
|-------------------|-------------|--------------------------------------------|
| `--primary`       | `#0d9488`   | cor principal (teal), botões, tabs ativas  |
| `--primary-dark`  | `#0f766e`   | hover de botão primário                    |
| `--primary-light` | `#ccfbf1`   | backgrounds de foco, role-toggle ativo     |
| `--accent`        | `#6366f1`   | destaque no gradiente do header            |
| `--surface`       | `#ffffff`   | fundo de cards, tabs, inputs               |
| `--text`          | `#0f172a`   | texto principal                            |
| `--muted`         | `#64748b`   | textos secundários (.muted)                |
| `--border`        | `#d8e6e4`   | bordas de cards e inputs                   |
| `--success`       | `#16a34a`   | badges/botões ACEITO                       |
| `--danger`        | `#dc2626`   | badges/botões RECUSADO, erros              |
| `--warning`       | `#d97706`   | badge PENDENTE                             |
| `--shadow`        | teal sutil  | sombra padrão de cards                     |
| `--shadow-lg`     | teal forte  | sombra em hover de cards                   |
| `--radius`        | `12px`      | border-radius padrão de cards              |

**Nunca usar cores hardcoded** — sempre referenciar as variáveis acima.

## Classes CSS reutilizáveis

### Navegação
- `.tab-bar` — container flex centralizado para as abas de navegação
- `.tab` — botão de aba (borda `--border`, fundo `--surface`)
- `.tab.active` — aba selecionada (fundo `--primary`, texto branco)

### Containers
- `.card` — caixa branca com borda, radius 12px e sombra teal sutil
- `.center-box` — telas de login/cadastro (max 420px, centralizado)
- `.list-item` — flex row: conteúdo à esquerda, ação à direita
- `.stats-row` / `.stat-card` — linha de cards de estatística com borda superior colorida

### Botões
- `.btn` — primário (fundo `--primary`)
- `.btn.secondary` — cinza `#64748b` (fora do header); dentro do `.header` usa glass rgba
- `.btn.success` — verde `--success`
- `.btn.danger` — vermelho `--danger`

### Formulários
- `.field` — wrapper flex coluna para label + input/select com foco teal
- `.row` — agrupa campos lado a lado
- `.role-toggle` — botões de seleção Paciente / Clínica
- `.field input.invalid` + `.field-error` — estado de validação de erro

### Feedback visual
- `.badge.PENDENTE` — amarelo
- `.badge.ACEITO` — verde
- `.badge.RECUSADO` — vermelho
- `.toast` / `.toast-stack` — notificações animadas no canto superior direito
- `.error` — mensagem de erro inline vermelha
- `.muted` — texto cinza secundário
- `.empty-state` — estado vazio com ícone centralizado

### Componentes avançados
- `.modal-overlay` / `.modal` / `.modal-header` / `.modal-body` / `.modal-actions` — modal com animação
- `.cal-header` / `.cal-grid` / `.cal-cell` — calendário de seleção de datas
- `.timeslot-grid` / `.timeslot-btn` — grade de horários disponíveis
- `.filter-tabs` / `.filter-tab` — filtros em pill (ex: filtrar por status)

### Mídia
- `.avatar` — imagem circular 50×50px com borda branca e sombra
- `.profile-avatar` — avatar grande 110×110px para tela de perfil

## Componentes React reutilizáveis

| Componente               | Arquivo                              | Uso                              |
|--------------------------|--------------------------------------|----------------------------------|
| `<Avatar>`               | `src/components/Avatar.tsx`          | Foto de perfil com fallback automático por tipo ("PATIENT" \| "CLINIC") |
| `<StarRating>`           | `src/components/StarRating.tsx`      | Estrelas de 0–5 com meia estrela; `onChange` ativa modo interativo |

## Padrões de componentes

### Adicionar uma nova aba de navegação (clínica ou paciente)
1. Adicionar `{ label, path }` no array `tabs` correto dentro de `TabBar` em `App.tsx`.
2. Adicionar a `<Route>` correspondente em `App.tsx`.
3. Criar a página em `frontend/src/pages/NomePagina.tsx`.

### Criar uma nova tela de conteúdo
- Não envolver em `.container` — ele já existe no layout pai.
- Usar `.card` para seções de formulário ou listagens.
- Usar `.list-item` dentro de `.card` para itens com ação à direita.

### Regras obrigatórias
- Não adicionar links de navegação no `.header`.
- Não criar cores hardcoded — usar variáveis `--primary`, `--danger`, etc.
- Todo botão deve ter estado `:hover` com `box-shadow` ou mudança de cor.
- Usar `<Avatar src={x} type="PATIENT"|"CLINIC">` — nunca `<img src={x || ""}>`

## Arquivos principais de UI

- `frontend/src/styles.css` — CSS global com variáveis e todas as classes
- `frontend/src/App.tsx` — layout raiz (Header, TabBar, Routes)
- `frontend/src/pages/` — uma página por rota
- `frontend/src/components/` — Avatar, StarRating e outros reutilizáveis
