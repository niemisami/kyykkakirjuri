# AGENTS.md

Full stack web app built with PNPM, Typescript, Drizzle ORM, Better Auth, Tanstack Query, React, Vite and Tailwind CSS.

## Rules

- Always respect [package.json](./.agents/package.json) engine e.g. "pnpm" and use it for running scripts and installing dependencies.
- [Code style](./.agents/rules/code-style.md)
- Inline the code style rules directly in the prompt or ensure the referenced file content is provided to the model
- When asked to write or modify code, implement the change directly in this repository using the existing stack and conventions.
- When generating new source files, use TypeScript and the project libraries listed above.
- When asked to review code, prioritize bugs, behavioral regressions, security risks, and missing tests.
- When asked questions, answer from repository context and clearly state assumptions when context is missing.
- Keep edits small and focused, preserving existing architecture, naming, and public APIs unless the task requires otherwise.
- Follow style already present in touched files: consistent formatting, clear naming, and readable function size.
- Prefer explicit types at module boundaries and avoid `any` unless no safer option exists.
- Cover edge cases in implementation and review: null or undefined values, empty inputs, invalid state transitions, and error paths.
- Add or update tests for behavior changes when practical.

## Guidelines

- Always use `base-ui` component instructions when creating or modifying `shadcn` components
