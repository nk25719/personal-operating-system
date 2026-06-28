# Contributing to POS

Thank you for contributing.

## Product Rules

- Keep the daily user maintenance burden under two minutes.
- Do not add visible complexity unless it answers a clear user question.
- Prefer optional modules over crowded core screens.
- Prefer automation and conversational capture over forms.
- Treat sensitive personal and health information carefully.
- Health-related features must remain informational and must not diagnose or prescribe treatment.

## Development

```bash
npm install
npx expo start
```

Before opening a pull request, run TypeScript checks if dependencies are installed:

```bash
npx tsc --noEmit
```
