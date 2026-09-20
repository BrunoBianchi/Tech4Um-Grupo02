# Tech4Um

Real-time forum and messaging MVP — **1st place @ Hackathon Ninja 2026** (team of 3). Rooms, Socket.IO chat and JWT auth, shipped as a Dockerized full-stack app.

Deployed demo (when live): [tech4um.xyz](https://tech4um.xyz)

## Problem

Hackathon brief: deliver a usable online forum with live chat under tight time constraints. The MVP focuses on identity, rooms and low-latency messaging — with extras (tags, mentions, typing indicators, online status) that make the product feel complete rather than a bare chat socket.

## Features

- Register / login / logout with JWT (Socket.IO handshake also validates the token)
- Create and list forum rooms; join rooms and persist message history
- Real-time public chat via WebSockets (Socket.IO)
- Room tags, infinite-scroll pagination, filters (date, popularity, owner)
- Mentions (`@user`), emoji/GIF picker, welcome messages, typing indicators
- Online/offline presence on room cards and navbar
- Layered validation (frontend + Zod schemas + DB constraints)
- Docker Compose for backend, frontend and PostgreSQL

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React, Vite, React Router, TypeScript/JSX, Tailwind CSS, Socket.IO client |
| Backend | Node.js, Express, TypeScript, TypeORM, Socket.IO |
| Database | PostgreSQL |
| Auth | JWT (jose), bcrypt |
| Tooling | pnpm, Docker Compose |

```
Backend/     Express + Socket.IO, MSC-style services, TypeORM entities
Frontend/    Vite SPA — auth/rooms/socket contexts and screens
docker-compose.yml
```

## Architecture notes

Backend follows an MSC (Model–Service–Controller) layout. REST handles auth and room CRUD; Socket.IO carries live messages after a JWT handshake with Express. Frontend state is split across auth, rooms and socket React contexts.

Design reference: [Figma](https://www.figma.com/design/FDYqPAYNQTwOnHf0wME0HR/4UM). Dedicated notes live under [`Backend/`](./Backend) and [`Frontend/`](./Frontend).

## Getting started

**Prerequisites:** Docker and Docker Compose.

```bash
git clone https://github.com/BrunoBianchi/Tech4Um-Grupo02.git
cd Tech4Um-Grupo02
docker compose build --no-cache
docker compose up
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `http://localhost:5432` (or as in `docker-compose.yml`)

```bash
docker compose down   # stop
```

## Author

**Bruno Bianchi** — Full-Stack Developer (team of 3)  
[github.com/BrunoBianchi](https://github.com/BrunoBianchi) · [brunobianchi.dev](https://brunobianchi.dev)
