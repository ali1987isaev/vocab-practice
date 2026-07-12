# Vocab Practice

A mobile-first English vocabulary practice app for a small, active set of words and phrases.

## Included

- Daily review queue
- Active-recall flashcards
- Again / Hard / Good / Easy scheduling
- English pronunciation using the browser Web Speech API
- Context sentences and multiple examples
- Add, edit, search, and delete cards
- JSON backup and restore
- Offline-ready PWA shell
- Automatic GitHub Pages deployment workflow
- Five starter phrasal verbs from the initial concept

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. Push this project to the `main` branch.
3. Open **Settings → Pages** in GitHub.
4. Set **Source** to **GitHub Actions**.
5. The included workflow will build and publish the app automatically.

The Vite base path is set to `./`, so the build works for both user pages and repository pages.

## Data storage

Cards and progress are stored in browser `localStorage`. Use **Settings → Export JSON** to create backups, especially before moving to another phone or clearing browser data.

## Suggested next improvements

- Fill-in-the-blank exercises
- Listening-only cards
- Russian → English card direction
- Typed answers
- IndexedDB storage
- Cloud sync through Supabase or GitHub Gist
- More advanced FSRS scheduling
