# UI Guidelines

This document defines the core UI guidelines for the TODO app.

## Design Direction

- Use Material Design components and interaction patterns for all new UI work.
- Prefer a clean, task-focused layout with clear hierarchy and minimal visual noise.
- Keep the interface consistent across the app so forms, lists, dialogs, and status messages feel like one system.

## Color Palette

- Use a primary color for the main actions, such as adding or saving a task.
- Use a neutral background and surface palette so task content remains easy to scan.
- Use a warning or destructive color only for delete and other irreversible actions.
- Ensure all text and interactive elements meet accessible contrast requirements.
- Do not rely on color alone to communicate status; pair color with labels, icons, or text.

## Components and Layout

- Use Material-style text fields, buttons, checkboxes, chips, dialogs, and snackbars where appropriate.
- Present tasks in card or list-item surfaces with consistent spacing and alignment.
- Keep task actions in predictable locations, with primary actions visually separated from destructive actions.
- Use clear section headings for create, list, empty, loading, and error states.
- Keep layouts responsive so the app works well on mobile, tablet, and desktop widths.

## Button Styles

- Use a filled primary button for the main call to action.
- Use outlined or text buttons for secondary actions.
- Use a destructive variant for delete actions, and make it visually distinct from primary actions.
- Keep button labels short, direct, and action-oriented.
- Maintain a minimum touch target size that is comfortable for mouse and touch input.

## Typography and Spacing

- Use a clear typographic scale with a strong title, readable section headings, and legible body text.
- Limit the number of font weights and sizes to keep the interface consistent.
- Use a spacing system with repeated increments so forms and lists feel orderly.
- Preserve enough whitespace between task rows, action buttons, and form controls to prevent accidental clicks.

## Accessibility Requirements

- Support full keyboard navigation for every interactive control.
- Show visible focus states on buttons, inputs, links, and other actionable elements.
- Use semantic HTML elements before adding ARIA attributes.
- Associate all form fields with labels and provide helpful validation messages.
- Announce loading, success, and error states in a way that assistive technology can perceive.
- Make sure dialogs and menus trap focus appropriately and can be dismissed with the keyboard.

## Task List Behavior

- Show task completion state clearly, such as with a checkbox or completed styling.
- Make due dates easy to identify without overwhelming the task title.
- Group empty, loading, and error states into their own dedicated UI patterns.
- Keep task sorting and filtering controls visible and understandable if they are added.
- Surface success feedback for create, edit, and delete actions when it improves clarity.

## Suggested Improvements

- Add a persistent app bar or header so the app identity and main action remain visible.
- Use subtle motion for state changes, such as adding a task or opening a dialog, but keep animations lightweight.
- Include icons sparingly to reinforce meaning, not replace labels.
- Add inline validation for task forms so users can correct mistakes before submission.
- Make the empty state helpful by suggesting the first task the user might create.
