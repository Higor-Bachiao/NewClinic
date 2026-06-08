# Skill: UX — Diretrizes e Padrões

Objetivo
-------
Fornecer um conjunto conciso de princípios, heurísticas e padrões de interface para o projeto NewClinic, ajudando equipes a tomar decisões de design consistentes, acessíveis e centradas no usuário.

Quando usar
-----------
- Ao revisar uma interface ou PR com mudanças de UI
- Ao projetar novos fluxos (cadastro, agendamento, busca)
- Ao padronizar componentes reutilizáveis

Princípios fundamentais
-----------------------
- Clareza: a interface deve comunicar intenção e próximo passo.
- Consistência: padrões visuais e interacionais iguais em todo o produto.
- Acessibilidade: conteúdo navegável por teclado e compatível com leitores de tela.
- Feedback imediato: informar sucesso, erro e progresso.
- Minimizar carga cognitiva: reduzir campos e etapas desnecessárias.

Heurísticas e checklist rápido
-----------------------------
- Texto dos botões: verbos claros (ex.: "Agendar", "Confirmar").
- Prioridade visual: botão primário para ação principal, secundário para alternativa.
- Formulários: validação inline, mensagens de erro específicas e focos claros.
- Estados vazios: mostrar CTA e instruções quando não há dados.
- Erros de sistema: mensagem amigável + ação sugerida (ex.: tentar novamente).
- Performance: evitar telas travadas — usar skeletons para carregamento.
- A11y: contraste >= AA, labels associadas, tabindex lógico.

Padrões de componentes (resumo)
------------------------------
- Botões
  - Primário: ação principal, cor destacada, único por linha/area.
  - Secundário: ações alternativas (link ou outline).
- Inputs & Formulários
  - Placeholder não substitui label.
  - Agrupar campos relacionados; indicar obrigatoriedade.
  - Apresentar resumo de erros no topo em formulários longos.
- Feedback de carregamento
  - Use skeletons para listas e cartões; use spinner para ações pontuais.
- Tabelas/Listas
  - Ordenação e filtragem visíveis; estado de seleção claro.
- Cards
  - Informação essencial em destaque; ações principais expostas.

Exemplos práticos
------------------
- Fluxo de agendamento: passo 1 seleção de clínica → passo 2 escolha de horário → passo 3 confirmação. Mostrar resumo persistente à direita/embaixo.
- Formulário de cadastro: validar email e telefone inline; não ocultar mensagens de erro ao submeter.
- Busca de clínicas: inputs com auto-suggest; indicar distância/nota no resultado.

Checklist de revisão UX (para PRs)
--------------------------------
1. A ação principal é óbvia? (botão primário)
2. Labels e mensagens de erro são claras e acionáveis?
3. O fluxo é acessível por teclado e leitores de tela?
4. Há estados para carregamento, vazio e erro?
5. O layout se mantém em mobile/responsive?

Como contribuir
---------------
- Abra uma PR com: descrição, screenshots (desktop/mobile), passos para testar.
- Para novos padrões, inclua um exemplo de uso e rationale curto.

Referências rápidas
------------------
- Nielsen: 10 Heuristics
- WCAG 2.1 (contraste, labels, foco)

Contato
-------
Para dúvidas ou ajustes, abra uma issue descrevendo o caso de uso e screenshots.

Tela base da clínica — Modernização
----------------------------------
Objetivo: transformar a tela de detalhe da clínica em uma experiência clara, rápida e conversível, adequada para desktop e mobile.

Layout recomendado
- Header fixo com: foto/capa (ou carrossel pequeno), nome da clínica, nota média e botão primário `Agendar`.
- Coluna principal (esquerda em desktop / topo em mobile): resumo curto + informações essenciais (endereço, telefones, horário de funcionamento), serviços oferecidos.
- Coluna secundária (direita em desktop / abaixo em mobile): bloco de agendamento rápido com seleção de data/hora, preço estimado e confirmação.
- Seções abaixo: galeria, lista de profissionais (se aplicável), mapas, avaliações e FAQ.

Hierarquia visual e microcopy
- Priorize a ação principal (`Agendar`) com cor e tamanho maiores.
- Use microcopy orientando o usuário em pontos de decisão (ex.: "Selecione um horário disponível").
- Resumos em linha (ex.: tempo médio de atendimento, preço médio) facilitam comparação.

Componentes e padrões interativos
- Card da clínica: imagem, nome, rating, breve descrição, distância e CTA.
- Bloco de agendamento: selector de data (calendário compacto), lista de horários disponíveis (botões), confirmação com resumo.
- Skeletons para carregamento de lista/galeria; loader inline para ações de agendamento.

Acessibilidade (essenciais)
- Todos os botões têm texto discernível; use `aria-label` quando necessário.
- Foco visível e ordem de tabulação lógica (header → principal → agendamento → footer).
- Contraste mínimo AA; labels explícitas para inputs.

Responsividade
- Desktop: layout duas colunas, resumo persistente do agendamento à direita.
- Tablet: pilha vertical com blocos colapsáveis para map/avaliações.
- Mobile: tudo em coluna única; CTAs fixos no rodapé quando apropriado.

Tokens visuais (exemplo rápido)
- Espaçamento: 8/16/24 scale
- Tipografia: Título 20/24, Subtítulo 16, Body 14
- Cores: `--primary` (ação), `--muted` (metadata), `--bg` (cards)

Exemplo conciso (React + CSS variables)
```tsx
// frontend/src/components/ClinicBase.tsx
import React from 'react';

export default function ClinicBase({clinic}){
  return (
    <main className="clinic-root">
      <header className="clinic-hero">
        <img src={clinic.cover} alt={`Imagem da ${clinic.name}`} />
        <div className="hero-meta">
          <h1>{clinic.name}</h1>
          <div className="meta-row">{clinic.rating} • {clinic.distance}</div>
        </div>
        <button className="btn primary">Agendar</button>
      </header>

      <section className="clinic-grid">
        <div className="clinic-main">
          <p className="short">{clinic.description}</p>
          {/* serviços, contatos, galeria */}
        </div>
        <aside className="clinic-cta">
          {/* componente de agendamento rápido */}
        </aside>
      </section>
    </main>
  )
}
```

```css
:root{
  --primary:#0b74ff;
  --muted:#6b7280;
  --bg:#ffffff;
}
.clinic-root{padding:16px}
.clinic-hero{display:flex;align-items:center;gap:16px}
.clinic-grid{display:grid;grid-template-columns:1fr 360px;gap:24px}
@media(max-width:900px){.clinic-grid{grid-template-columns:1fr}}
```

Métricas a observar após a mudança
- Taxa de conversão (visualização → agendamento)
- Tempo médio para completar um agendamento
- Taxa de engajamento em CTA secundários (ex.: contato)

Próximos passos sugeridos
- Criar um componente protótipo em `frontend/src/components/ClinicBase.tsx` e testar com dados reais.
- Fazer user testing com 3-5 usuários para validar fluxo de agendamento.

