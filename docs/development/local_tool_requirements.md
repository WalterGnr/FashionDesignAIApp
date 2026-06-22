# Local Tool Requirements

Last checked: 2026-06-21

Purpose: track what must be installed on the development computer before each implementation phase.

## Current Local Status

Installed and visible from the terminal:

- Git: installed
- Node.js: installed (`v24.14.0`)
- npm: installed (`11.9.0`)
- Visual Studio Code command line: installed

Not currently visible from the terminal:

- Python
- pip
- Docker
- Docker Compose
- GitHub CLI

## Required For Sprint 02

Sprint 02 is still planning only.

No new program installation is required.

Useful but not required:

- OpenAI account and API access for later AI integration planning
- Continued GitHub access through the existing repository

## Required For First Desktop App Build

The first actual desktop app scaffold should begin in the desktop implementation sprint, after the planning sprint for the desktop app shell is accepted.

Required:

- Git
- Node.js
- npm
- Visual Studio Code or another code editor

Already available:

- Git
- Node.js
- npm
- Visual Studio Code command line

## Required For Backend and Database Work

Required when FastAPI and PostgreSQL implementation begins:

- Python 3.11 or newer
- pip
- Docker Desktop, recommended for PostgreSQL and Redis

Alternative to Docker:

- Native PostgreSQL installation
- Native Redis installation, later when background jobs begin

Docker is recommended because it keeps local database setup repeatable and closer to production-style development.

## Required For AI Integration

Required when implementing AI command interpretation or voice:

- OpenAI API key
- Backend environment variable configuration

Security rule:

- Do not paste real API keys into chat.
- Do not commit `.env` files with real secrets.
- AI keys belong in backend environment variables, never in the Electron renderer.

## Optional Tools

Optional but useful:

- GitHub CLI, for repository and pull request management
- Figma, for UI design exploration
- Postman, Insomnia, or Bruno, for API testing
- DB client such as DBeaver, TablePlus, or pgAdmin

## Installation Timing

Do not install everything immediately.

Recommended timing:

- Now: no installation needed for the current planning work.
- Before desktop implementation: confirm Node and npm compatibility with the Electron/Vite stack.
- Before backend implementation: install Python and Docker Desktop.
- Before AI integration: prepare OpenAI API access and environment variables.
- Before packaging/release: install any signing, installer, or packaging tools required for Windows desktop distribution.
