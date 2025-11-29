# Tech4Um - Backend Documentation

Documentação técnica completa do backend da aplicação **Tech4Um**, um forum de mensagens em tempo real desenvolvido em Node.js/TypeScript para o desafio Tech4Humans 2025.

---

## Índice

- [Visão Geral do Backend](#visão-geral-do-backend)
- [Estrutura Detalhada do Projeto](#estrutura-detalhada-do-projeto)
- [Arquitetura e Padrões de Design](#arquitetura-e-padrões-de-design)
    - [Arquitetura em Camadas (Layers)](#arquitetura-em-camadas-layers)
    - [Services Funcionais](#services-funcionais)
- [Stack Tecnológica do Backend](#stack-tecnológica-do-backend)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Deploy e Infraestrutura](#deploy-e-infraestrutura)
- [Banco de Dados](#banco-de-dados)
    - [Entidades](#entidades)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Comunicação em Tempo Real](#comunicação-em-tempo-real)
    - [Socket Gateway](#socket-gateway)
- [Implementação das Features](#implementação-das-features)
    - [Módulo de Salas (Rooms)](#módulo-de-salas-rooms)
- [Scripts e Comandos](#scripts-e-comandos)

---

## Visão Geral do Backend

O backend do **Tech4Um** foi desenvolvido com foco em **escalabilidade**, **segurança** e **comunicação em tempo real**. Utiliza Node.js com TypeScript, Express para rotas HTTP, Socket.IO para comunicação via WebSockets e PostgreSQL com TypeORM.

---

## Estrutura Detalhada do Projeto

A estrutura do projeto segue uma organização em camadas, separando configurações, controladores, gateways, modelos, rotas e serviços.

```
Backend/
├── src/
│   ├── config/                            # Configurações globais
│   │   ├── database/                      # Configuração do Banco de Dados
│   │   │   └── datasource.ts              # DataSource do TypeORM
│   │   ├── express/                       # Configuração do Express
│   │   │   └── express-server.ts
│   │   └── socketio/                      # Configuração do Socket.IO
│   │       └── socketio-server.ts
│   │
│   ├── controllers/                       # Controladores HTTP
│   │   └── api-controller.ts
│   │
│   ├── gateways/                          # Gateways para comunicação Real-time
│   │   └── socket-gateway.ts              # Lógica de eventos do Socket.IO
│   │
│   ├── middlewares/                       # Middlewares do Express
│   │   └── auth-middleware.ts
│   │
│   ├── models/                            # Entidades do Banco de Dados (TypeORM)
│   │   ├── BaseEntity.ts
│   │   ├── UserEntity.ts
│   │   ├── RoomEntity.ts
│   │   └── MessageEntity.ts
│   │
│   ├── routes/                            # Definição de Rotas
│   │   ├── auth-route.ts
│   │   └── room-route.ts
│   │
│   ├── services/                          # Lógica de Negócio (Functional Services)
│   │   ├── auth/                          # Serviços de Autenticação
│   │   ├── room/                          # Serviços de Salas
│   │   │   ├── create-service.ts
│   │   │   ├── get-service.ts
│   │   │   └── join-service.ts
│   │   ├── user/                          # Serviços de Usuário
│   │   ├── jwt/                           # Serviços de JWT
│   │   └── error/                         # Tratamento de Erros
│   │
│   └── main.ts                            # Ponto de entrada da aplicação
```

---

## Arquitetura e Padrões de Design

### Arquitetura em Camadas (Layers)

O projeto adota uma arquitetura em camadas clássica, onde cada diretório tem uma responsabilidade específica:

- **Routes:** Definem os endpoints e delegam para os Services ou Controllers.
- **Services:** Contêm a regra de negócio pura.
- **Models:** Definem a estrutura dos dados (Entidades).
- **Gateways:** Gerenciam conexões externas (como Socket.IO).

### Services Funcionais

Diferente de abordagens baseadas em classes, este projeto utiliza **funções exportadas** para os serviços, promovendo simplicidade e facilidade de teste.

**Exemplo de Service (Functional):**
```typescript
// src/services/room/create-service.ts
import { AppDataSource } from "../../config/database/datasource.ts"
import { RoomEntity } from "../../models/RoomEntity.ts"
// ... imports

export const createRoom = async(room: Partial<RoomEntity>, ownerId: string): Promise<Partial<RoomEntity>> => {
    // Lógica de negócio
    const newRoom = roomRepository.create(room)
    await roomRepository.save(newRoom)
    return newRoom
}
```

---

## Lógica de Desenvolvimento

O projeto foi concebido para criar um sistema de fórum em tempo real que suporte múltiplas salas de discussão e mensagens instantâneas, permitindo uma interação fluida e organizada entre usuários.

### Principais Funcionalidades

1. **Usuário**
    - **Cadastro e Autenticação:** Utilização de bcrypt para hash de senhas e JWT para sessões seguras.
    - **Middlewares:** Interceptação de requisições para validação de token e controle de acesso a rotas protegidas.

2. **Salas (Rooms)**
    - **Múltiplas Salas:** Usuários podem criar e participar de diversas salas simultaneamente.
    - **Propriedade:** O usuário criador é definido como dono (owner), permitindo gestão futura.
    - **Tags e Categorização:** Salas podem ser marcadas com tags para facilitar a descoberta.
    - **Regras de Negócio:**
        - Nome e descrição obrigatórios.
        - Associação automática do criador como participante.

3. **Mensagens**
    - **Histórico Persistente:** Armazenamento em banco relacional para recuperação de conversas passadas.
    - **Envio Híbrido:** O envio dispara a persistência no banco e a emissão do evento via Socket.IO simultaneamente.
    - **Regras de Negócio:**
        - Mensagem deve pertencer a uma sala e um usuário existentes.
        - Conteúdo não pode ser vazio.

4. **Comunicação Real-Time**
    - **Eventos Bidirecionais:** Uso de Socket.IO para comunicação de baixa latência.
    - **Sincronização de Estado:**
        - **Typing Indicators:** Feedback visual quando outro usuário está digitando.
        - **Lista de Participantes:** Atualização em tempo real de quem está online na sala.
    - **Regras de Negócio:**
        - Autenticação via token no handshake da conexão.
        - Isolamento de eventos por Room ID.

5. **Filtros e Busca**
    - **Busca Dinâmica:** Permite filtrar salas por nome ou tags específicas.
    - **Ordenação:** Suporte a ordenação por data de criação ou popularidade (número de usuários).
    - **Paginação:** Controle de volume de dados retornados nas listagens.

6. **Segurança**
    - **Validação de Dados:** Schemas Zod garantem que apenas dados no formato correto cheguem aos services.
    - **Sanitização:** Prevenção básica contra injeção via ORM e validação de tipos.
    - **Proteção XSS com Cookies:** A utilização de cookies com as flags `HttpOnly` e `Secure` é crucial para mitigar vulnerabilidades de Cross-Site Scripting (XSS). Ao contrário do `localStorage` ou `sessionStorage`, cookies configurados desta maneira não podem ser acessados via JavaScript (document.cookie), impedindo que scripts maliciosos injetados na aplicação roubem o token de autenticação do usuário.

---

## Stack Tecnológica do Backend

- **Node.js & TypeScript**: Base da aplicação.
- **Express**: Framework Web.
- **Socket.IO**: Comunicação Real-time.
- **TypeORM**: ORM para PostgreSQL.
- **PostgreSQL**: Banco de dados relacional.
- **Zod**: Validação de dados.
- **Nginx**: Servidor Web e Proxy Reverso para deploy.
- **Digital Ocean Droplet**: Infraestrutura de hospedagem (VPS).
- **Let's Encrypt**: Certificados SSL/TLS gratuitos para HTTPS.

---

## Configuração do Ambiente

### Instalação

```bash
cd Backend
pnpm install
```

### Variáveis de Ambiente (.env)

```env
PORT=3000
# Configurações do Banco de Dados e JWT
```

---

## Deploy e Infraestrutura

O projeto utiliza Nginx como proxy reverso para gerenciar subdomínios e SSL. Abaixo está a configuração utilizada para rodar a aplicação em `api.tech4um.xyz` (Backend) e `tech4um.xyz` (Frontend).

```nginx
server {
    listen 80;
    server_name api.tech4um.xyz;

    # Backend sem HTTPS ainda
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name tech4um.xyz www.tech4um.xyz;

    location / {
        proxy_pass http://localhost:3000;  # coloque a porta da sua aplicação Docker
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Banco de Dados

### Entidades

As entidades estão localizadas em `src/models/` e seguem o padrão do TypeORM.

#### **UserEntity**
Representa os usuários do sistema.
- `id`: UUID
- `username`: String
- `email`: String
- `password`: String (Hash)

#### **RoomEntity**
Representa as salas de chat.
- `id`: UUID
- `name`: String
- `description`: String
- `owner`: Relacionamento com UserEntity
- `users`: Participantes da sala

#### **MessageEntity**
Representa as mensagens enviadas.
- `id`: UUID
- `content`: Conteúdo da mensagem
- `user`: Autor da mensagem
- `room`: Sala da mensagem

---

## Comunicação em Tempo Real

### Socket Gateway

A lógica do Socket.IO é centralizada em `src/gateways/socket-gateway.ts`.

**Funcionalidades:**
- **Autenticação:** Validação de token JWT no handshake ou headers.
- **Eventos:**
    - `send_message`: Envio de mensagens.
    - `join_room`: Entrada em salas.
    - `typing_start` / `typing_stop`: Indicadores de digitação.
    - `request_participants`: Lista participantes da sala.

---

## Implementação das Features

### Módulo de Salas (Rooms)

As funcionalidades de salas são divididas em serviços específicos em `src/services/room/`:

- **create-service.ts**: Criação de novas salas.
- **get-service.ts**: Listagem e busca de salas.
- **join-service.ts**: Lógica para entrar em uma sala.

As rotas correspondentes estão em `src/routes/room-route.ts`.

---

## Scripts e Comandos

```json
{
  "scripts": {
    "dev": "nodemon src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js"
  }
}
```