# Tech4Um - Frontend Documentation

Documentação técnica do frontend da aplicação **Tech4Um**, desenvolvida com **React 19** e **Vite** para oferecer uma experiência de usuário rápida e responsiva.

---

## Índice

- [Visão Geral](#visão-geral)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura e Gerenciamento de Estado](#arquitetura-e-gerenciamento-de-estado)
- [Stack Tecnológica](#stack-tecnológica)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Lógica de Desenvolvimento](#lógica-de-desenvolvimento)

---

## Visão Geral

O frontend do **Tech4Um** é uma Single Page Application (SPA) moderna que consome a API do backend e estabelece conexão em tempo real via WebSockets. A interface foi construída utilizando **TailwindCSS v4** para estilização utilitária e responsiva.

---

## Estrutura do Projeto

```
Frontend/
├── src/
│   ├── assets/                # Imagens e recursos estáticos
│   ├── contexts/              # Gerenciamento de estado global (Context API)
│   │   ├── auth-context.tsx   # Autenticação e persistência de sessão
│   │   ├── rooms-context.tsx  # Dados das salas e filtros
│   │   └── socket-context.tsx # Conexão Socket.IO
│   │
│   ├── hooks/                 # Custom Hooks
│   ├── services/              # Comunicação com API (Axios)
│   ├── shared/                # Componentes reutilizáveis
│   ├── utils/                 # Funções utilitárias
│   ├── views/                 # Páginas da aplicação
│   │   ├── Home.jsx           # Landing Page / Login
│   │   ├── Forum.jsx          # Listagem de Salas
│   │   └── ChatRoom.jsx       # Interface de Chat
│   │
│   ├── App.jsx                # Componente raiz e rotas
│   └── main.jsx               # Ponto de entrada
```

---

## Arquitetura e Gerenciamento de Estado

A aplicação utiliza a **Context API** do React para gerenciamento de estado global, evitando prop drilling e separando responsabilidades:

- **AuthContext:** Gerencia o usuário logado, token JWT e funções de login/logout.
- **SocketContext:** Mantém a instância única da conexão Socket.IO e disponibiliza o socket para os componentes.
- **RoomsContext:** Armazena a lista de salas, filtros aplicados e dados da sala atual.

---

## Stack Tecnológica

- **React 19**: Biblioteca UI.
- **Vite**: Build tool e dev server.
- **TailwindCSS 4**: Framework CSS.
- **React Router DOM 7**: Roteamento.
- **Socket.IO Client**: Cliente WebSocket.
- **Axios**: Cliente HTTP.
- **Emoji Picker React**: Seletor de emojis.
- **React Nice Avatar**: Geração de avatares.

---

## Configuração do Ambiente

### Instalação

```bash
cd Frontend
pnpm install
```

### Execução

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## Lógica de Desenvolvimento

O frontend foi projetado para ser reativo e centrado na experiência do usuário em tempo real, refletindo instantaneamente as ações ocorridas no backend.

### Principais Funcionalidades

1. **Usuário e Autenticação**
    - **Persistência:** O token JWT é armazenado em cookies (`@App:token`) para persistir a sessão entre recarregamentos.
    - **Interceptadores:** O Axios intercepta todas as requisições para injetar o token automaticamente no header `Authorization`.
    - **Redirecionamento:** Usuários não autenticados são redirecionados automaticamente para a página de login.

2. **Salas (Forum View)**
    - **Listagem Dinâmica:** A lista de salas é buscada da API e armazenada no contexto.
    - **Filtros:** A interface permite filtrar salas por tags ou busca textual, atualizando a visualização sem recarregar a página.
    - **Criação:** Modal para criação de novas salas com validação de campos.

3. **Chat (ChatRoom View)**
    - **Conexão Real-Time:** Ao entrar na tela de chat, o componente se conecta ao namespace da sala via Socket.IO.
    - **Mensagens:**
        - Mensagens recebidas via socket são adicionadas imediatamente ao estado local (optimistic UI).
        - Suporte a emojis e menções.
    - **Feedback Visual:**
        - **Typing:** Exibe "Usuário X está digitando..." quando o evento `user_typing` é recebido.
        - **Participantes:** Lista lateral mostra usuários online na sala em tempo real.

4. **Interface e UX**
    - **Design Responsivo:** Layout adaptável para desktop e mobile usando classes do Tailwind.
    - **Avatares:** Geração determinística de avatares baseada no nome do usuário.
    - **Notificações:** Feedback visual para ações de sucesso ou erro (Toasts).