# Skill: Segurança — Diretrizes e Padrões

Objetivo
-------
Fornecer um conjunto conciso de práticas de segurança para o projeto NewClinic, ajudando a equipe (e a IA geradora de código) a tomar decisões seguras e consistentes ao lidar com autenticação, dados de pacientes/clínicas, API REST e upload de arquivos.

Quando usar
-----------
- Ao revisar um PR que toca autenticação, rotas da API ou tratamento de dados.
- Ao criar novas rotas Express ou middlewares.
- Ao lidar com upload de imagens, senhas, tokens ou dados pessoais (CPF/CNPJ).
- Ao configurar variáveis de ambiente e deploy.

Princípios fundamentais
-----------------------
- Menor privilégio: cada perfil (PATIENT/CLINIC) acessa só o que precisa.
- Validar toda entrada: nunca confiar em dados do cliente.
- Segredos fora do código: chaves e senhas só em variáveis de ambiente.
- Falhar fechado: em dúvida, negar acesso.
- Defesa em profundidade: validação no frontend NÃO substitui validação no backend.

Autenticação e sessão
----------------------
- Senhas sempre com hash `bcrypt` (custo >= 10). Nunca armazenar em texto puro.
- `JWT_SECRET` forte (>= 32 caracteres aleatórios), só via `.env`, nunca commitado.
- Tokens JWT com expiração (`expiresIn`); não guardar dados sensíveis no payload.
- Verificar token em todas as rotas autenticadas (middleware), não só no frontend.
- Checar o `role` do token antes de ações restritas (ex.: só CLINIC altera status de agendamento).
- No frontend, armazenar token com cuidado; limpar no logout.

Autorização (controle de acesso)
---------------------------------
- Validar que o recurso pertence ao usuário (ex.: clínica só edita a própria disponibilidade).
- Nunca confiar em IDs vindos do cliente sem checar dono — evitar IDOR.
- Endpoints de clínica (`PATCH /appointments/:id/status`) exigem `role === CLINIC` E posse do agendamento.

Validação de entrada
---------------------
- Validar tipo, formato e tamanho de todo campo (email, CPF, CNPJ, senha).
- Sanitizar strings; rejeitar payloads inesperados.
- Usar consultas parametrizadas (Prisma já protege contra SQL injection — não montar SQL cru).
- Limitar tamanho do corpo da requisição (`express.json({ limit })`).

Upload de arquivos
------------------
- Aceitar só tipos de imagem permitidos (validar MIME real, não só extensão).
- Limitar tamanho do arquivo.
- Gerar nome aleatório no servidor; nunca usar o nome enviado pelo cliente.
- Servir uploads de pasta isolada; não permitir path traversal (`../`).

Dados pessoais (LGPD)
---------------------
- CPF, CNPJ, email e foto são dados pessoais — coletar só o necessário.
- Não logar dados sensíveis (senha, token, CPF) em console ou arquivos.
- Não expor hash de senha nem campos internos nas respostas da API.

Configuração e transporte
--------------------------
- `.env` no `.gitignore`; versionar só `.env.example` sem valores reais.
- HTTPS em produção (TLS).
- CORS restrito às origens conhecidas (não usar `*` em produção).
- Cabeçalhos de segurança (ex.: `helmet`) em produção.

Tratamento de erros
--------------------
- Mensagens de erro genéricas ao cliente; detalhes só nos logs do servidor.
- Login: não revelar se foi o email ou a senha que errou ("credenciais inválidas").
- Nunca vazar stack trace para o cliente em produção.

Checklist de revisão de segurança (para PRs)
--------------------------------------------
1. Rota nova exige autenticação e checa o `role` correto?
2. O usuário só acessa/edita recursos que são dele?
3. Toda entrada do cliente é validada no backend?
4. Nenhum segredo (chave, senha, token) está no código ou no git?
5. Senhas com bcrypt e tokens com expiração?
6. Erros retornam mensagem genérica e não vazam dados internos?
7. Upload limita tipo/tamanho e renomeia o arquivo?

Exemplo prático (middleware de autorização)
-------------------------------------------
```ts
// backend/src/auth/middleware.ts
import { Request, Response, NextFunction } from 'express';

export function requireRole(role: 'PATIENT' | 'CLINIC') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user; // setado pelo middleware de JWT
    if (!user) return res.status(401).json({ error: 'Não autenticado' });
    if (user.role !== role) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}
```

```ts
// uso: só clínica aceita/recusa, e checando posse do agendamento
router.patch('/appointments/:id/status', requireAuth, requireRole('CLINIC'),
  async (req, res) => {
    const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!appt || appt.clinicId !== req.user.clinicId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    // ... atualizar status
  }
);
```

Referências rápidas
-------------------
- OWASP Top 10
- OWASP ASVS (níveis de verificação)
- LGPD (Lei 13.709/2018) — tratamento de dados pessoais

Próximos passos sugeridos
-------------------------
- Adicionar `helmet` e `cors` configurado no backend.
- Centralizar validação de entrada (ex.: `zod`) nas rotas.
- Garantir limite e validação de MIME no `upload.ts`.
