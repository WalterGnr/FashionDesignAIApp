# Local Tool Requirements

Last checked: 2026-06-23

Purpose: track what must be installed on the development computer before each implementation phase.

## Current Local Status

Installed and visible from the terminal:

- Git: installed
- Node.js: installed (`v24.14.0`)
- npm: installed (`11.9.0`)
- Visual Studio Code command line: installed
- Python: installed (`3.13.14`)
- pip: installed (`26.1.2`)
- Docker CLI: installed (`29.5.3`)
- Docker Compose: installed (`v5.1.4`)

Not currently visible from the terminal:

- GitHub CLI
- WSL is not enabled yet

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

- Python 3.11 or newer: installed
- pip: installed
- Docker Desktop: installed
- WSL 2 support: pending Administrator setup

Alternative to Docker:

- Native PostgreSQL installation
- Native Redis installation, later when background jobs begin

Docker is recommended because it keeps local database setup repeatable and closer to production-style development.

## Manual Windows Step Still Needed

Docker Desktop was installed for the current user, and the Docker CLI and Docker Compose are available from the installed Docker Desktop files.

WSL activation still needs an elevated Administrator prompt. Codex attempted to enable the Windows features, but Windows returned:

```text
Error: 740
Elevated permissions are required to run DISM.
```

Before database containers can run, open PowerShell as Administrator and run:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
wsl --set-default-version 2
```

Then restart Windows.

After restart, open Docker Desktop once so it can finish WSL setup and ask for any required first-run confirmations.

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

- Now: Python and Docker Desktop are installed; WSL Administrator activation is still pending.
- Before desktop implementation: confirm Node and npm compatibility with the Electron/Vite stack.
- Before backend implementation: confirm Python, Docker Desktop, and WSL 2 are all active.
- Before AI integration: prepare OpenAI API access and environment variables.
- Before packaging/release: install any signing, installer, or packaging tools required for Windows desktop distribution.
