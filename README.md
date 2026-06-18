# NewClinic

Sistema web para agendamento de consultas entre pacientes e clínicas.

- **Backend:** Node.js + Express + TypeScript + Prisma (PostgreSQL via Supabase) — JWT + bcrypt
- **Frontend:** React + TypeScript + Vite + React Router

## Funcionalidades

- Cadastro e login de **pacientes** e **clínicas** (com seleção de perfil)
- Upload de foto de perfil no cadastro e edição do perfil (armazenamento local em `backend/uploads/`)
- Busca de clínicas por nome e especialidade
- Solicitação de agendamento pelo paciente (status PENDENTE / ACEITO / RECUSADO)
- Clínica aceita ou recusa solicitações
- Configuração de disponibilidade da clínica (horário de abertura/fechamento e dias desabilitados)
- Avaliações: paciente dá nota (0–5, em múltiplos de 0,5) e comentário para a clínica; cada paciente tem uma avaliação por clínica (criada ou atualizada)

> Notificações não foram implementadas (decisão de escopo).

## Estrutura

```
NewClinic/
├── backend/    # API REST (Express + Prisma)
└── frontend/   # SPA React (Vite)
```

## Como rodar

### 1. Backend

```bash
cd backend
mkdir -p env
cp .env.example env/.env       # preencha DATABASE_URL (Supabase) e JWT_SECRET
npm install
npm run prisma:generate
npm run prisma:push            # cria as tabelas no banco do Supabase
npm run seed                   # (opcional) cria clínicas e um paciente de teste
npm run dev                    # API em http://localhost:3333
```

> O `.env` deve ficar em `backend/env/.env` — é esse o caminho carregado pela API
> (veja `src/index.ts`).

A `DATABASE_URL` é a connection string do Supabase. Use o **Session pooler**
(*painel → botão "Connect" → aba "Session pooler"*), não a conexão *direct*
(`db.<ref>.supabase.co`), que é IPv6-only e não conecta na maioria das redes.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # app em http://localhost:5173
```

O Vite faz proxy de `/api` e `/uploads` para o backend em `localhost:3333`.

## Usuários de teste (após `npm run seed`)

- **Paciente:** `paciente@teste.com` / `123456`
- **Clínicas:** `pele@clinic.com`, `cardio@clinic.com`, `orto@clinic.com`, `olhos@clinic.com` / `123456`

## Endpoints principais

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/register/patient` | público | Cadastro de paciente (aceita upload `photo`) |
| POST | `/auth/register/clinic` | público | Cadastro de clínica (aceita upload `photo`) |
| POST | `/auth/login` | público | Login (`role`: PATIENT/CLINIC) |
| GET | `/clinics/specialties` | público | Lista de especialidades disponíveis |
| GET | `/clinics` | autenticado | Busca clínicas (`?name=&specialty=`) |
| GET | `/clinics/me/availability` | clínica | Obter disponibilidade |
| PUT | `/clinics/me/availability` | clínica | Atualizar disponibilidade |
| GET | `/clinics/:clinicId/reviews` | autenticado | Lista avaliações + média da clínica |
| POST | `/clinics/:clinicId/reviews` | paciente | Avaliar clínica (cria ou atualiza) |
| POST | `/appointments` | paciente | Solicitar agendamento |
| GET | `/appointments` | autenticado | Listar agendamentos do usuário |
| PATCH | `/appointments/:id/status` | clínica | Aceitar / Recusar |
| GET | `/profile/me` | autenticado | Dados do perfil logado |
| PUT | `/profile/me` | autenticado | Atualizar perfil (aceita upload `photo`) |
