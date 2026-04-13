---
name: post-migration-validator
description: Validates, formats, and auto-fixes codebase after a migration. Use this skill at the end of migration scripts to ensure the codebase has no linting or type errors, and that generated files are syntactically and structurally correct.
---

# Post Migration Validator

## Overview

This skill is designed to run as the final step after automated code generation or migration (e.g., converting React components to Next.js/MUI or generating Payload CMS blocks). It ensures the resulting codebase is clean, formatted, and free of type errors.

## Workflow

When activated, you must follow these steps sequentially:

### Step 1: Format the Code
Run Prettier to format the newly generated files:
```bash
npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,scss}"
```
(If Prettier is not installed, skip to Step 2).

### Step 2: Auto-Fix Linting Errors
Run the project's linter with the `--fix` flag. Prefer using the project's package manager (e.g., `npm`, `yarn`, `pnpm`):
```bash
npx eslint "src/**/*.{ts,tsx}" --fix
```
Wait for the command to finish.

### Step 3: Type Checking
Run the TypeScript compiler to check for type errors without emitting files:
```bash
npx tsc --noEmit
```
This is crucial to ensure that the newly migrated MUI components and Payload CMS blocks have correct interfaces and don't break the build.

### Step 4: Intelligent Fixes (If Needed)
If `tsc` or `eslint` report errors in Step 2 or 3:
1. Analyze the output carefully.
2. Use `read_file` or `grep_search` to inspect the problematic files.
3. Automatically apply fixes using the `replace` tool or by rewriting the file. Common issues include missing imports, incorrect MUI prop types, or missing Payload CMS fields.
4. Re-run the failing check (e.g., `npx tsc --noEmit`) to confirm the fix.

### Step 5: Verify Image & Data Configuration
Check for common issues that prevent images from showing:
1. **Next.js Config:** Ensure `next.config.ts` includes `localPatterns` for `/media/**` or wherever images are served.
2. **Media Collection:** Check `src/collections/Media.ts` for `staticDir: 'public/media'`.
3. **Fetching Depth:** Ensure `layout.tsx` or `page.tsx` use `depth: 2` if images are nested in blocks or globals.

### Step 6: Final Report
Provide a concise, user-friendly summary stating that the codebase has been validated, formatted, and is ready for use. Mention any stubborn errors that could not be automatically fixed.
