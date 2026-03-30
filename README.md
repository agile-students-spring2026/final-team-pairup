# PairUp
### NYU CS Job-Prep Teammate Matcher

PairUp is a web app designed to help **NYU Computer Science students find compatible job-prep partners or small prep groups** for activities such as LeetCode practice, system design mock interviews, behavioral interview prep, and resume review.

## Product Vision Statement

For **NYU CS students actively preparing for internships or full-time roles**,  
who need **reliable, compatible partners for interview preparation**,  
**PairUp** is a **job-prep teammate matching platform**  
that **matches students based on goals, skill level, availability, and preferences**.  
Unlike **scattered group chats, vague posts, or manual coordination**,  
our product provides **structured matching, match explanations, and a lightweight way to connect and organize prep sessions**.

---

## Description

Many students want to prepare consistently for technical interviews, but finding the right partner is difficult. Students vary in:

- experience level
- target role
- schedule availability
- prep style
- preferred level of accountability

Most coordination currently happens through unstructured chats or informal posts, which often leads to poor fit, unreliable meetups, and wasted time.

Our project aims to solve this by creating a platform where students can:

- create a profile in a few minutes
- get ranked matches with explanations
- send connection requests
- coordinate prep more effectively
- provide feedback to improve future recommendations

---

## Target Users

Our initial users are:

- **NYU CS students actively applying for internships or full-time roles**
- classmates and friends in Agile & DevOps course
- students in NYU tech communities and related campus circles

We plan to begin with a pilot group of real students we can directly talk to and gather feedback from, then iterate based on that feedback.

---

## Core Features

### MVP
- Profile creation and editing
- Matching system that returns a ranked list of compatible partners
- Match explanations
- Send and accept connection requests

### Stretch Goals
- Group matching for 3–4 people
- Session reminders and lightweight scheduling support
- Improved matching using user feedback over time

---

## Team

- **Saun Chen** — [Saun321](https://github.com/Saun321)
- **Scott Kim** — [jk8308-jpg](https://github.com/jk8308-jpg)
- **Eddie Liu** — [eddieliu-dev](https://github.com/eddieliu-dev)
- **Louisia Liu** — [LouisaQvQ](https://github.com/LouisaQvQ)
- **Ruilin Ma** — [RuilinMa0526](https://github.com/RuilinMa0526)

---

## Project History

This project started from a simple but common problem among NYU CS students: many people want to prepare for technical interviews, but struggle to find a prep partner who matches their goals, schedule, and working style.

We chose to build this project because good prep partnerships can improve accountability, consistency, and practice quality, while also making job preparation less isolating and more accessible.

The project is being developed as part of the Agile & DevOps course.

---

## How to Contribute

We welcome contributions, feedback, and suggestions.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines, development workflow, and collaboration expectations.

---

## Building and Testing

This repository currently ships a **React** front end under `front-end/` (Create React App). There is no separate back-end package in this repo yet; the UI uses mocked data via `front-end/src/services/mockApi.js`.

### Prerequisites

- **Node.js** (LTS recommended, e.g. 18.x or 20.x)
- **npm** (comes with Node)

### Install and run (development)

From the repository root:

```bash
cd front-end
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000). Use `Ctrl+C` in the terminal to stop the dev server.

### Production build

```bash
cd front-end
npm install
npm run build
```

Static output is written to `front-end/build/`. Serve that folder with any static host, or use a tool such as `npx serve -s build` for a quick local check.

### Tests

```bash
cd front-end
npm test
```

By default Create React App runs tests in **watch** mode. For a single non-interactive run (for example in CI):

```bash
cd front-end
CI=true npm test
```

---

## Additional Documentation

Relevant project documents and resources:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [README.md](./README.md)

---

## Why This Project Matters

A strong prep partner can make interview prep much more effective by improving:

- accountability
- consistency
- quality of feedback
- motivation
- structure

PairUp aims to reduce the friction of finding that partner and make job prep more accessible for NYU CS students.

---

## Current Status

The **front-end** is under active Sprint 1 development: screens and flows are implemented in React with mocked API data. A real back end can be wired in later by replacing calls in `front-end/src/services/mockApi.js`.

---

## License

TBD