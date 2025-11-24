# Aplicativo Tech4Um-Grupo02

Este Repositório contém os códigos e especificações técnicas referentes ao 
desenvolvimento do MVP Tech4Um (Forum de mensagens em tempo real).

---

## Índice 

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Engenharia de Software](#engenharia-de-software)
    - [Requisitos](#1-requisitos)
        - [Funcionais](#11-requisitos-funcionais)
        - [Não Funcionais](#12-requisitos-não-funcionais)
    - [Diagramas](#2-diagramas)
        - [Sequencia](#21-sequencia)
        - [Estado](#22-estado)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
    - [Github](#1-github)
    - [JIRA](#2-jira)
    - [Discord](#3-discord)
    - [Docker](#4-docker)
- [Backend](#backend)
- [Frontend](#frontend)
- [Instruções de Execução](#Instrucoes-de-Execucao)
- [Agradecimentos](#agradecimentos)

---


## Visão Geral

O **Tech4Um** é uma solução de forum online, composta por um Backend robusto 
desenvolvido em **Node.js e Typescript** e um Frontend moderno seguindo
a prototipagem oficial no [**Figma**](https://www.figma.com/design/FDYqPAYNQTwOnHf0wME0HR/4UM?node-id=0-1&p=f) 
construído em **React**, respeitando toda a documentação do aplicativo
no [**Google Docs**](https://docs.google.com/document/d/1fxOYiqd5Zhbin8a70hsNzNpU5sAz1zOyDZ1jJxWeh8U/edit?tab=t.0)

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

#### 1.1 Requisitos Funcionais

Os requisitos funcionais descrevem os comportamentos e as ações específicas que o sistema deve executar. Eles estão organizados por módulos:

**Módulo de Gestão de Identidade**
* **RF01 - Cadastro:** O sistema deve permitir o registro de novos usuários (Register).
* **RF02 - Autenticação:** O sistema deve permitir o acesso via credenciais de e-mail e senha (Login).
* **RF03 - Encerramento:** O sistema deve permitir o encerramento seguro da sessão (Logout).

**Módulo de Fóruns**
* **RF04 - Listagem:** O sistema deve exibir uma lista paginada dos fóruns disponíveis.
* **RF05 - Criação:** O sistema deve permitir que usuários autenticados criem novos tópicos de fórum.

**Módulo de Chat**
* **RF06 - Mensagens:** O sistema deve permitir o envio e recebimento de mensagens públicas e privadas.
* **RF07 - Participantes:** O sistema deve listar os participantes ativos no chat.
* **RF08 - Visibilidade:** O sistema deve oferecer uma opção para ocultar ou exibir a lista de participantes.

---

#### 1.2 Requisitos Não Funcionais

Os requisitos não funcionais definem os critérios de qualidade e as restrições técnicas do sistema, servindo como métricas para avaliar *como* o software deve operar:

**Segurança**
* **RNF01 - Autenticação Robusta:** O controle de sessão deve utilizar o padrão **JWT (JSON Web Token)**, garantindo integridade e estatelessness.
* **RNF02 - Proteção de Dados:** As senhas devem ser armazenadas no banco de dados utilizando **Hashing seguro** (ex: Bcrypt ou Argon2).
* **RNF03 - Privacidade:** As mensagens privadas devem trafegar com **criptografia de ponta a ponta**.

**Desempenho e Arquitetura**
* **RNF04 - Tempo Real:** A comunicação do chat deve utilizar **WebSockets** para garantir baixa latência na entrega de mensagens.
* **RNF05 - Padrão de API:** A interface de programação (backend) deve ser segura e seguir padrões arquiteturais definidos (ex: RESTful).

**Usabilidade (UX)**
* **RNF06 - Interface Responsiva:** A interface gráfica deve ser intuitiva e adaptar-se automaticamente a diferentes tamanhos de tela (Desktop e Mobile).

---

### 2 Diagramas
Na engenharia de software, os diagramas são representações visuais utilizadas para simplificar e modelar sistemas complexos. Eles funcionam como uma "planta baixa" do software, permitindo que desenvolvedores, arquitetos e clientes visualizem a estrutura, o comportamento e as interações do sistema antes e durante a codificação.

#### 2.1 Sequencia

Um diagrama de sequência, em engenharia de software, é um diagrama UML que mostra como os objetos/atores de um sistema trocam mensagens ao longo do tempo para realizar um caso de uso específico, destacando a ordem em que essas interações acontecem.


#### 2.2 Estado

Em engenharia de software, um diagrama de estados (ou diagrama de máquina de estados UML) mostra os possíveis estados de um objeto ao longo do seu ciclo de vida e as transições entre esses estados em resposta a eventos.

![Diagrama de estado](https://i.imgur.com/AKRirn2.jpeg)

---

## Tecnologias Utilizadas


### 1 Github

A utilização do [**Github**](https://github.com/BrunoBianchi/Tech4Um-Grupo02) se deu principalmente no processo de versionamento do código, foi utilizando uma estrutura focada em features, ou seja a criação de uma nova branch aninhada com o [**JIRA**](#12-jira) para cada uma das features, possibilitando o rollback caso necessário.

![Imagem Branchs Github](https://i.imgur.com/mM71AEf.png)

### 2 JIRA

A utilização do [**JIRA**](https://bruno2002raiado.atlassian.net/jira/software/projects/KAN/boards/1/timeline?selectedIssue=KAN-7) se deu principalmente no processo de organização temporal das features, separadas em 2 épicos: Backend e Frontend. Com  ele foi possível orquestrar o tempo de desenvolvimento bem como checkpoints pessoais do grupo.

![Imagem do Kanban Jira](https://i.imgur.com/Aav9D41.png)

### 3 Discord

O **Discord** foi utilizado como o principal meio de comunicação entre nosso grupo e os mentores, com ele conseguimos realizar reuniões periódicas para discussões no processo de desenvolvimento.

### 4 Docker

O **Docker** foi utilizado com o arquivo **compose** para a modelagem e execução facilitada em qualquer sistema operacional, sem a necessidade de conexões extras.

---


### 2 Backend

### 3 Frontend

---

## Backend

Esta seção do documento trata resumidamente do papel do backend na nossa 
aplicação, para características mais técnicas temos um Readme Dedicado ao
[**Backend**](https://github.com/BrunoBianchi/Tech4Um-Grupo02/tree/main/Backend)

> Optamos por uma arquitetura utilizando padrão Orientada a Dados (Data-Driven) e um estilo de repositórios MSC (Model-Service-Controller)
---

## Frontend

Esta seção do documento trata resumidamente do papel do frontend na nossa 
aplicação, para características mais técnicas temos um Readme Dedicado ao
[**Frontend**](https://github.com/BrunoBianchi/Tech4Um-Grupo02/tree/main/Frontend)

> O frontend utiliza react (SPA) + arquitetura básica do vite e react router para facilidade de renderização de diferentes informações.

---


## Instruções de Execução

---