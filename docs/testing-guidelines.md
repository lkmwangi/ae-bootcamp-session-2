# Testing Guidelines

This document defines the core testing principles for the TODO app.

## General Principles

- Every new feature should include appropriate automated tests.
- Tests should be maintainable, readable, and focused on behavior rather than implementation details.
- Tests should be isolated and independent so they can run repeatedly without relying on shared state.
- Use setup and teardown hooks when needed to keep test runs deterministic.

## Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Use the naming convention `*.test.js` or `*.test.ts`.
- Place backend unit tests in `packages/backend/__tests__/`.
- Place frontend unit tests in `packages/frontend/src/__tests__/`.
- Name unit test files to match what they are testing, such as `app.test.js` for `app.js`.

## Integration Tests

- Use Jest plus Supertest to test backend API endpoints with real HTTP requests.
- Place integration tests in `packages/backend/__tests__/integration/`.
- Use the naming convention `*.test.js` or `*.test.ts`.
- Name integration test files based on the feature they cover, such as `todos-api.test.js` for TODO endpoints.

## End-to-End Tests

- Use Playwright for complete UI workflows through browser automation.
- Playwright is the required E2E framework for this project.
- Place E2E tests in `tests/e2e/`.
- Use the naming convention `*.spec.js` or `*.spec.ts`.
- Name E2E test files based on the user journey they test, such as `todo-workflow.spec.js`.
- Use only one browser for Playwright tests.
- Use the Page Object Model (POM) pattern to keep UI tests maintainable.
- Limit E2E coverage to 5 to 8 critical user journeys, focusing on happy paths and important edge cases rather than exhaustive coverage.

## Port Configuration

- Use environment variables with sensible defaults for port configuration.
- Backend services should follow `const PORT = process.env.PORT || 3030;`.
- Frontend services should support the default React port of 3000 and allow override through the `PORT` environment variable.
- Prefer port configuration that allows CI/CD workflows to detect and use the correct port dynamically.

## Best Practices

- Cover new behavior with the smallest test set that proves it works.
- Prefer clear assertions that describe observable outcomes.
- Keep test data local to each test file or test case when possible.
- Update tests alongside implementation changes so the suite remains aligned with the app.
