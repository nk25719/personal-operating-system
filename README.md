# POS - Personal Operating System

POS is an AI-assisted Personal Operating System designed to help people intentionally build the life, character, skills, and routines they aspire to have.

Unlike traditional productivity apps that mainly manage tasks, POS centers around identity, purpose, obligations, habits, projects, health constraints, environment, and long-term growth.

## Core Question

> Which action right now contributes most to the person I am trying to become?

Every schedule, habit, reminder, purchase, outing, project, or commitment should be evaluated against this question.

## Product Goal

POS should help a person run their life with very low maintenance. The user should spend less than two minutes per day maintaining the system. The app should use automation, conversation, integrations, and AI reasoning to reduce manual planning.

## Current Version

**v0.1.0 - Product foundation**

This repository currently contains an Expo / React Native iOS-ready MVP with:

- Today-first dashboard
- Conversational capture screen
- Optional modules layer
- Editable identity, habits, goals, learning topics, health profile, environment, and integrity fields
- Reminder and calendar service hooks
- AI advisor placeholder with local fallback
- Notion and web research service placeholders

## Design Principles

1. The user maintains the app in under two minutes per day.
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

 

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## Safety Note

POS may store sensitive life, health, and identity information. The app should treat all such information as private by default. Health-related features are for personal organization and reflection only and are not medical advice, diagnosis, or treatment.
