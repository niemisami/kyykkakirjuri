# Code style

## General guidelines

- Single quotes, no semicolons.
- Use ASCII U+002d "-" character for hyphens instead of U+2010 "‐" or U+2011 "‑" characters.

## Naming conventions

**files**
- by default use camelCase for file names (e.g. `userProfile.ts`).
- Use PascalCase for React component files (e.g. `UserProfile.tsx`).
- Use snake-case for docs and markdown files (e.g. `code-style.md`).

**variables**
- Use descriptive names that clearly indicate the purpose of the variable (e.g. `userName`) instead of shorthand and vague names (e.g. `u`, `un`).
- Use camelCase for variable names (e.g. `userName`).
- Use capitalized words for constants (e.g. `MAX_SIZE`, `DEFAULT_TIMEOUT`).
- Avoid using single-character variable names except for loop counters (e.g. `i`, `j`).
- Variable definition on the same line as assignment (e.g. `let count = 0;`).

**boolean**
- Use `is` prefix for boolean variables (e.g. `isActive`, `isValid`).

**functions**
- Prefer arrow functions for concise syntax (e.g. `const add = (a, b) => a + b;`).
- React event handler prop functions should start with `on` (e.g. `onClick`, `onSubmit`).
