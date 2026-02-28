# Contributing to PairUp

Thank you for your interest in contributing to **PairUp**. This document explains how our team collaborates, writes code, manages GitHub workflow, and contributes to the project.

## Project Overview

PairUp is a student connection platform designed to help users discover meaningful academic and professional mock interview matches based on shared interests, background, goals, and availability.

This project is being developed collaboratively as part of an Agile & DevOps course. Contributions should follow the team norms and development process described below.

---

## Team Values and Norms

Our team agrees to follow these core values while working on the project:

- **Communication:** Keep teammates informed about progress, blockers, and changes.
- **Respect:** Be constructive, supportive, and professional in all team interactions.
- **Responsibility:** Complete assigned tasks on time and ask for help early if blocked.
- **Collaboration:** Review each other’s work, share knowledge, and contribute fairly.
- **Consistency:** Follow agreed coding standards, Git workflow, and project structure.

### Team Expectations

- Respond to team messages within a reasonable time.
- Attend standups and team meetings when possible.
- Update task progress honestly.
- Ask questions when requirements are unclear.
- Support teammates when they need help.
- Resolve disagreements respectfully and based on what is best for the project.

---

## Sprint Cadence and Meetings

Our team works in short sprints following the course schedule.

- **Sprint length:** 1–3 weeks
- **Standups:**  
Tuesday 7:00-7:15  
Thursday 9:00-9:15
- **Progress tracking:** Managed through GitHub Projects / Issues
- **Task ownership:** Each issue should have a clear assignee

During standups, each team member should briefly share:

- What they completed
- What they are currently working on
- Any blockers or support needed

---

## Git Workflow

We use GitHub for version control and collaboration. To keep the `main` branch stable, our team follows a branch-based workflow using a shared `dev` branch.

### Branch Structure

- `main` contains the most stable and production-ready version of the project
- `dev` is the integration branch where completed work is merged and tested first
- Individual contributors should create separate feature branches from `dev`

### Branch Naming Convention

Use clear and descriptive branch names such as:

- `your-name/homepage-ui`
- `your-name/matching-logic`
- `your-name/explore-page`
- `your-name/login-bug`
- `your-name/update-readme`

### Workflow Steps

1. Pull the latest changes from `dev`
2. Create a new branch from `dev` for your task
3. Make and test your changes locally
4. Commit your work with clear commit messages
5. Push your feature branch to GitHub
6. Open a Pull Request into `dev`
7. Review, test, and resolve any conflicts in `dev`
8. Once `dev` is stable and working correctly, merge `dev` into `main`

### Why We Use This Workflow

This workflow helps us:

- keep `main` clean and stable
- catch merge conflicts earlier
- test combined features before release
- reduce the chance of breaking the main branch
- collaborate more safely as a team

---

## Commit Message Guidelines

Write short but descriptive commit messages.

Examples:

- `Add homepage layout`
- `Implement profile card component`
- `Fix explore page filter bug`
- `Update README and contribution guide`

Try to keep commits focused on one logical change.

---

## Pull Request Guidelines

When opening a Pull Request, please:

- Use a clear title
- Describe what you changed
- Reference the related issue if applicable
- Include screenshots for UI changes if helpful
- Make sure your code does not break existing functionality

PRs should be reviewed before merging whenever possible.

---

## Rules for Contributing

- Do not push directly to `main`
- Do not merge feature branches directly into `main`
- All feature work should branch off from `dev`
- All completed work should be merged into `dev` first
- Only merge `dev` into `main` when the team agrees it is stable
- Keep changes small and focused when possible
- Communicate blockers early

---

## Coding Standards

To keep the codebase clean and maintainable, we follow these standards:

- Write readable, self-documenting code
- Use descriptive variable and function names
- Keep components and functions small when possible
- Avoid unnecessary complexity or over-engineering
- Remove dead or commented-out code before merging
- Follow consistent formatting across the project
- Test your code before submitting it

If the team adopts a formatter or linter later, all contributors should use it.

---

## Development Setup

To set up the project locally:

1. Clone the repository
2. Open the project in your code editor
3. Install dependencies
4. TBD