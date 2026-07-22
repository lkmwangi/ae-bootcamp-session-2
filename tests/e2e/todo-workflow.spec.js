const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo-page');

test.describe('Todo workflow', () => {
  test('creates, completes, and deletes a task', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();

    const title = `E2E task ${Date.now()}`;
    await todoPage.createTask({
      title,
      description: 'Created through Playwright',
      dueDate: '2026-08-01',
    });

    await todoPage.toggleComplete(title);
    await expect(todoPage.taskCard(title)).toContainText('Complete');

    await todoPage.deleteTask(title);
  });

  test('edits a task title and due date', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();

    const title = `Editable task ${Date.now()}`;
    await todoPage.createTask({
      title,
      description: 'Needs a small rewrite',
      dueDate: '2026-08-02',
    });

    const updatedTitle = `${title} updated`;
    await todoPage.editTask(title, {
      title: updatedTitle,
      dueDate: '2026-08-05',
    });

    await expect(todoPage.taskCard(updatedTitle)).toContainText('Due Aug 5, 2026');
    await todoPage.deleteTask(updatedTitle);
  });
});