# Coding Guidelines

This project follows a simple, consistent JavaScript style that favors readability, small focused modules, and predictable behavior. The codebase is organized as a monorepo with a React frontend and an Express backend, so each package should keep its own concerns separated while still following the same overall standards for clarity and maintainability.

Formatting should stay straightforward and consistent. Use clear indentation, descriptive names, and small functions that do one thing well. Prefer early returns when they make control flow easier to read, and avoid deeply nested logic when a flatter structure is possible. Keep components, route handlers, and helpers easy to scan so future changes stay low risk.

Imports should be organized by purpose and kept tidy. Group external dependencies before local modules, avoid unused imports, and prefer direct imports from the smallest sensible module surface. When a file grows beyond a single responsibility, split the logic into smaller files or helpers rather than letting one module become a catch-all.

The project relies on the existing linting and test conventions from the React and Jest toolchains, so code should be written to pass those checks without special exceptions. Treat linter feedback as a guide to consistency and correctness, and resolve warnings before merging changes. If a rule feels noisy, prefer adjusting the implementation to match the established pattern rather than introducing ad hoc exceptions.

The DRY principle should be applied with judgment. Reuse shared logic when the same behavior appears in multiple places, but do not force abstraction too early if it makes the code harder to understand. Favor duplication over a premature helper when the repeated code is small and the abstraction would be speculative. When repetition becomes meaningful, extract the common behavior into a well-named utility, component, or module.

Quality matters as much as style. New code should be covered by appropriate tests, and changes should preserve the existing behavior unless the task explicitly calls for a change. Keep functions pure when practical, make side effects obvious, and prefer explicit data flow over hidden coupling. Error handling should be clear and user-facing messages should be specific enough to help debugging without exposing unnecessary internal detail.

For the frontend, keep React components presentational when possible and move reusable logic into helpers or hooks only when that improves clarity. For the backend, keep route handlers thin and push business logic into dedicated functions so API behavior stays easy to test. Across both packages, aim for code that is easy to read once and easy to modify later.
