# GitHub Setup

Last updated: 2026-06-20

## Current Local Git State

The project has been initialized as a local Git repository on branch `main`.

Initial commit:

```text
b9ef0f3 docs: establish project foundation
```

## Repository Contents

The first commit contains the project planning, sprint planning, architecture, security, environment, domain learning, and development workflow documents.

No application code, dependencies, database, or AI integration has been added yet.

## Recommended GitHub Repository Settings

GitHub repository:

```text
https://github.com/WalterGnr/FashionDesignAIApp
```

Recommended visibility:

```text
Private
```

Reason:

- The project contains product strategy and planning.
- Future commits may include proprietary design workflows.
- User measurements and AI/product details should be protected once implementation begins.

## Manual GitHub Setup Steps

Because the GitHub CLI is not installed on this machine, the simplest setup path is:

1. Go to GitHub.
2. Create a new empty repository.
3. Name it `FashionDesignAIApp`.
4. Set visibility to private unless there is a specific reason to make it public.
5. Do not initialize it with a README, `.gitignore`, or license because this project already has those local files.
6. Copy the repository URL.
7. Add the remote locally:

```powershell
git remote add origin https://github.com/WalterGnr/FashionDesignAIApp.git
```

8. Push the local `main` branch:

```powershell
git push -u origin main
```

## Alternative: GitHub CLI

If GitHub CLI is installed later, the repository can be created with:

```powershell
gh repo create FashionDesign-App --private --source . --remote origin --push
```

## Security Reminder

Never commit:

- `.env`
- API keys
- Database passwords
- generated private renders
- real body measurement data
- exported tech packs with private client/manufacturer data
