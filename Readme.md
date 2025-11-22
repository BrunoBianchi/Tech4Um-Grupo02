# Aplicativo Tech4Um-Grupo02

Este Repositório contém os códigos e especificações técnicas referentes ao 
desenvolvimento do MVP Tech4Um (Forum de mensagens em tempo real).

---

## Índice 

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Engenharia de Software](#engenharia-de-software)
    - [Requisitos](#1-requisitos)
        - [Funcioais](#1.1-funcionais)
        - [Não Funcionais](#1.2-nao-funcionais)
    - [Diagramas](#2-diagramas)
        - [Sequencia](#2.1-sequencia)
        - [Estado](#2.2-estado)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
    - [Geral](#1-geral)
    - [Backend](#2-backend)
    - [Frontend](#3-frontend)
- [Backend](#backend)
- [Frontend](#frontend)
- [Software Utilizados em Geral](#softwares-utilizados)
- [Instruções de Execução](#Instrucoes-de-Execucao)
- [Agradecimentos](#agradecimentos)

---


## Visão Geral

O **Tech4Um** é uma solução de forum online, composta por um Backend robusto 
desenvolvido em **Linguagem Backend** e um Frontend moderno seguindo
a prototipagem oficial no [Figma](https://www.figma.com/design/FDYqPAYNQTwOnHf0wME0HR/4UM?node-id=0-1&p=f) 
construído em **Framework frontend**

---

## Estrutura do projeto

```
Tech4Um-Grupo02/
├── Backend/                      # Lógica do servidor (API) em Node.js/TypeScript
│   ├── src/                      # Código fonte do backend
│   │   ├── database/             # Configuração do banco, entidades, migrações, baseEntity
│   │   ├── features/             # Módulos de funcionalidades (controllers, services, DTOs)
│   │   ├── middlewares/          # Middlewares Express (autenticação, tratamento de erros)
│   │   ├── utils/                # Utilitários, serviços compartilhados, classes de erro
│   │   └── main.ts               # Ponto de entrada da aplicação backend
│   ├── jest.config.ts            # Configuração do Jest para o backend
│   ├── tsconfig.json             # Configuração do TypeScript para o backend
│   ├── package.json              # Dependências e scripts do backend
│   └── .env                      # Variáveis de ambiente específicas do backend (ex: .env.example)
├── frontend/                     # Interface de usuário em React/Vite
│   ├── app/                      # Código fonte do frontend (estrutura similar a Next.js/Remix)
│   │   ├── components/           # Componentes React reutilizáveis
│   │   ├── contexts/             # Context API para gerenciamento de estado global
│   │   ├── hooks/                # Custom hooks React
│   │   ├── screens/              # Telas/páginas da aplicação (componentes de rota)
│   │   ├── services/             # Lógica de chamada à API e outros serviços
│   │   ├── types/                # Definições de tipos TypeScript para o frontend
│   │   ├── root.tsx              # Componente raiz da aplicação React
│   │   └── app.css               # Estilos globais ou CSS base
│   ├── public/                   # Assets estáticos (imagens, ícones, fontes)
│   ├── jest.config.ts            # Configuração do Jest para o frontend
│   ├── tsconfig.json             # Configuração do TypeScript para o frontend
│   ├── vite.config.ts            # Configuração do Vite
│   ├── package.json              # Dependências e scripts do frontend
│   └── pnpm-lock.yaml            # Lockfile do pnpm para o frontend (se não for workspace pnpm)
├── package.json                  # Configurações do monorepo (workspaces pnpm) e scripts globais
└── pnpm-lock.yaml                # Lockfile do pnpm para a raiz do monorepo
```
---

## Engenharia de Software
Engenharia de software é uma metodologia ao todo para um processo 
de organização de requisitos até a entrega de um MVP. Será utilizado essa 
metodologia com o intuito de criar um aplicativo focado em: *Manutenção*, 
*Confiabilidade e segurança*, *Eficiência* e *Aceitabilidade*

### 1 Requisitos

### 2 Diagramas
Na engenharia de software, os diagramas são representações visuais utilizadas para simplificar e modelar sistemas complexos. Eles funcionam como uma "planta baixa" do software, permitindo que desenvolvedores, arquitetos e clientes visualizem a estrutura, o comportamento e as interações do sistema antes e durante a codificação.

#### 2.1 Sequencia


#### 2.2 Estado
---

## Tecnologias Utilizadas

### 1 Geral

### 2 Backend

### 3 Frontend

---

## Backend

---

## Frontend

---

## Softwares Utilizados 

- [Jira](https://www.atlassian.com/br/software/jira) (Organização das sprints)
- [Github](https://github.com) (Vercionamento do código)
- [Docker](https://www.docker.com) (Containerização da aplicação)
- [Discord](https://discord.com) (Canal para comunicação e reuniões)

---

## Instruções de Execução

---