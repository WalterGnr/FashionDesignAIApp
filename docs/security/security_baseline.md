# Security Baseline

Last updated: 2026-06-19

Status: Sprint 00 foundation document.

## Security Goals

- Protect API keys and database credentials.
- Keep the Electron renderer unprivileged.
- Treat AI output as untrusted until validated.
- Treat user files and reference images as untrusted input.
- Preserve privacy around body measurements and design work.

## Electron Rules

When the desktop app is implemented:

- Keep `contextIsolation` enabled.
- Keep direct Node.js access out of renderer code.
- Use a narrow preload bridge.
- Validate all IPC inputs.
- Avoid loading remote arbitrary content.
- Use secure defaults before packaging.

## Backend Rules

- Backend owns secrets.
- Backend validates AI output before database writes.
- Backend controls database access.
- Backend issues or brokers short-lived AI sessions if needed.
- Backend redacts secrets in logs.

## AI Rules

AI-generated data is not trusted automatically.

Before a design operation is applied:

- Parse it.
- Validate it against the schema.
- Check locked fields.
- Check measurement ranges.
- Reject unknown operation names.
- Ask for clarification when command intent is ambiguous.

## File Upload Rules

Future uploaded reference images or documents should be handled as untrusted.

Minimum rules:

- Validate file type.
- Validate file size.
- Store outside executable paths.
- Avoid privileged renderer access to raw local paths.
- Strip or ignore unsafe metadata when practical.

## Measurement Privacy

Body measurement profiles are sensitive.

Rules:

- Store only measurements needed for the product.
- Avoid logging full measurement profiles.
- Link renders and tech packs to model profile IDs.
- Make deletion/export policy explicit before production release.

## Secret Checklist

Never commit:

- `.env`
- API keys
- Database passwords
- Storage secret keys
- Real user data
- Generated private renders
- Tech pack exports with private data

## Sprint 00 Decision

The app will be designed so the renderer never receives the OpenAI API key. AI access will go through the backend or a backend-brokered short-lived session.
