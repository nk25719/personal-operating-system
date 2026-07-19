# POS - Personal Operating System

POS is an AI-assisted Personal Operating System designed to help people intentionally build the life, character, skills, and routines they aspire to have.

Unlike traditional productivity apps that mainly manage tasks, POS centers around identity, purpose, obligations, habits, projects, health constraints, environment, and long-term growth.

## Core Question

> What would move you closer to the person you are becoming today?

POS can rotate this guiding question so each person hears language that feels natural to them, such as “What would your future self thank you for?” or “What is one meaningful step toward the life you are building?”

## Product Goal

POS should feel light enough to use every day. A person should be able to check in, capture what changed, and move on within a couple of minutes while automation, conversation, integrations, and AI reasoning reduce manual planning.

## Current Version

**v1.0.0 - Personal foundation**

This repository currently contains an Expo / React Native iOS-ready MVP with:

- Today-first dashboard
- Visible Tasks screen
- Visible Profile and demographics screen
- Conversational capture screen
- Optional modules layer
- Editable identity, personal language, demographics, habits, goals, tasks, learning topics, health profile, environment, and integrity fields
- Reminder and calendar service hooks
- AI advisor placeholder with local fallback
- Notion and web research service placeholders

## Design Principles

1. Daily check-ins stay short enough to feel natural.
2. Automation comes before manual input.
3. Conversation comes before forms.
4. The visible interface stays simple; complexity lives in optional modules.
5. Every screen must answer one clear question.
6. Tasks should emerge from identity, purpose, goals, obligations, and context.
7. AI acts as an advisor, not a replacement for user judgment.
8. Health-aware suggestions remain informational and do not provide medical advice.
9. Extra capabilities stay modular and optional.
10. Privacy and user control are product requirements, not afterthoughts.

## Core POS Engines

### Identity Engine
Defines who the human is trying to become and what values they want to protect.

### Planning Engine
Turns identity, goals, obligations, energy, and constraints into a realistic schedule.

### Habit Engine
Builds small repeated practices that support character and long-term outcomes.

### Knowledge Engine
Connects learning topics, resources, papers, videos, mentors, standards, and notes.

### Wellbeing Engine
Adapts suggested habits around health information, sleep, energy, pain, and limitations while staying non-medical.

### Environment & Integrity Engine
Helps users intentionally choose social environments, experiences, and accountability structures that strengthen character.

### Automation Engine
Connects calendar, reminders, Notion, GitHub, email, health apps, and other services to keep the system low maintenance.

## Character-Building Framework

POS is guided by these seven tools for helping humans reach their goals and build character:

- Habituation through practice
- Reflection on personal experience
- Engagement with virtuous exemplars
- Dialogue that increases virtue literacy
- Awareness of situational variables and biases
- Moral reminders
- Friendships of mutual accountability

These principles shape habit recommendations, reflection prompts, role-model research, reminders, environment review, and accountability features.

## Repository Structure

```text
app/                 Expo Router screens
components/          Shared UI components
data/                Seed data
hooks/               App state hooks
services/            AI, planner, reminders, calendar, Notion, web research, OS logic
types/               TypeScript domain types
docs/                Product, architecture, modules, and research documentation
```

## Run Locally

```bash
npm install
npx expo start
```

Then press `i` for iOS Simulator or scan with Expo Go.

## Local-First App Status

POS is an Expo / React Native personal operating system for identity-centered planning. It helps a person capture what changed, choose small actions, shape habits and projects, review patterns, and keep recommendations grounded in their values and current season.

The current app is local-first. Core profile data, captures, habits, tasks, projects, review events, and planner memory are stored on the device. OpenAI keys and Notion tokens are stored separately with SecureStore when available, and backup export/import excludes those secrets. There is no backend sync in this version.

## Development

Run the app:

```bash
npm install
npx expo start
```

Run the safety checks:

```bash
npx tsc --noEmit
npm test
npm run lint
npx expo-doctor
```

## Firebase Auth Setup

POS uses Firebase Authentication for login. Enable these providers in the Firebase console:

- Email/password
- Google, for web sign-in

Create `.env` from `.env.example` and add the Firebase web app config:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
```

These Firebase config values are public client config, not provider secrets. Do not store OpenAI or Notion tokens here.

On web, Firebase Google sign-in uses the browser popup flow. Native Google sign-in still needs an Expo AuthSession implementation before mobile beta.

## Web Deploy

Build the web preview:

```bash
npx expo export --platform web
```

Deploy the generated `dist` folder with Firebase Hosting:

```bash
firebase deploy --only hosting
```

On web, SecureStore may be unavailable. POS avoids persisting OpenAI/Notion secrets in AsyncStorage; provider tokens should be treated as mobile/local-device only until a server-side secret store exists.

after every app change, before deploying, run:

```bash
npx expo export --platform web
firebase deploy
npx expo-doctor
```
script that should be run before every deply: 

npm ci 
&& npm run build

Manual QA lives in [docs/qa/manual-test-plan.md](docs/qa/manual-test-plan.md). It covers first launch, capture, extracted tasks, habits, agency check, recommendation responses, reviews, export, and restore preview/import.


## Roadmap

See [ROADMAP.md](ROADMAP.md).

## Safety Note

POS may store sensitive life, health, and identity information. The app should treat all such information as private by default. Health-related features are for personal organization and reflection only and are not medical advice, diagnosis, or treatment.
