# Functional Requirements

This document defines the core functional requirements for the TODO app.

1. The user can create a new task with a required title.
2. The user can add an optional description or notes to a task.
3. The user can assign a due date to a task.
4. The user can mark a task as complete or incomplete.
5. The user can edit an existing task, including its title, description, due date, and completion status.
6. The user can delete a task.
7. The app displays the full task list and updates it after create, edit, complete, and delete actions.
8. The app sorts tasks in a consistent order, such as incomplete tasks first, then by due date, then by most recently created or updated task.
9. The app shows tasks with their key details, including title, completion state, and due date when present.
10. The app validates task input and prevents saving invalid data, such as an empty title or an invalid due date.
11. The app persists tasks so they are available after the page reloads or the app restarts.
12. The app provides an empty state when there are no tasks.
13. The app surfaces a clear error message when task data cannot be loaded or saved.
