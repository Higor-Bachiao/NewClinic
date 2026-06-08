# NewClinic

Sistema web para agendamento de consultas entre pacientes e clínicas.

- **Backend:** Node.js + Express + TypeScript + Prisma (PostgreSQL via Supabase) — JWT + bcrypt
- **Frontend:** React + TypeScript + Vite + React Router

## Funcionalidades

- Cadastro e login de **pacientes** e **clínicas** (com seleção de perfil)
- Busca de clínicas por nome e especialidade
- Solicitação de agendamento pelo paciente (status PENDENTE / ACEITO / RECUSADO)
- Clínica aceita ou recusa solicitações
- Configuração de disponibilidade da clínica (horário de abertura/fechamento e dias desabilitados)
- Upload de foto de perfil (armazenamento local em `backend/uploads/`)

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
cp .env.example .env          # preencha DATABASE_URL (Supabase) e JWT_SECRET
npm install
npm run prisma:generate
npm run prisma:push           # cria as tabelas no banco do Supabase
npm run seed                  # (opcional) cria clínicas e um paciente de teste
npm run dev                   # API em http://localhost:3333
```

A `DATABASE_URL` é a connection string do Supabase
(*Project Settings → Database → Connection string → URI*).

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
| POST | `/auth/register/patient` | público | Cadastro de paciente |
| POST | `/auth/register/clinic` | público | Cadastro de clínica |
| POST | `/auth/login` | público | Login (`role`: PATIENT/CLINIC) |
| GET | `/clinics` | autenticado | Busca clínicas (`?name=&specialty=`) |
| GET/PUT | `/clinics/me/availability` | clínica | Disponibilidade |
| POST | `/appointments` | paciente | Solicitar agendamento |
| GET | `/appointments` | autenticado | Listar agendamentos do usuário |
| PATCH | `/appointments/:id/status` | clínica | Aceitar / Recusar |
