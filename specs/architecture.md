# Arquitetura

## Objetivo

Aplicação web para gerenciamento de agendamentos entre pacientes e clínicas.

## Frontend

Tecnologias:

* React
* Vite
* React Router
* TypeScript

Responsabilidades:

* Cadastro de usuários
* Login
* Busca de clínicas
* Solicitação de agendamentos
* Gerenciamento de agendamentos

## Backend

Tecnologias:

* Node.js
* Express.js
* TypeScript

Responsabilidades:

* API REST
* Autenticação
* Gerenciamento de usuários
* Gerenciamento de clínicas
* Gerenciamento de agendamentos

## Banco de Dados

Tecnologia:

* PostgreSQL

Tabelas principais:

* Pacientes
* Clínicas
* Especialidades
* Agendamentos

## Autenticação

* JWT
* Senhas criptografadas com bcrypt

## Upload de Imagens

* Armazenamento local em pasta uploads/

## Fluxo de Agendamento

1. Paciente pesquisa clínica.
2. Paciente solicita agendamento.
3. Agendamento fica com status PENDENTE.
4. Clínica aceita ou recusa.
5. Status é atualizado para ACEITO ou RECUSADO.
6. Paciente visualiza o resultado ao acessar o sistema.

## Status do Agendamento

* PENDENTE
* ACEITO
* RECUSADO
