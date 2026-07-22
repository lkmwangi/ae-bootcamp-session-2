const { expect } = require('@playwright/test');

class TodoPage {
  constructor(page) {
    this.page = page;
    this.createTaskForm = page.getByTestId('create-task-form');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByText('To Do App')).toBeVisible();
  }

  taskCard(title) {
    return this.page.getByTestId('task-card').filter({ hasText: title });
  }

  async createTask({ title, description = '', dueDate = '' }) {
    await this.createTaskForm.getByLabel('Task title').fill(title);
    await this.createTaskForm.getByLabel('Description').fill(description);
    if (dueDate) {
      await this.createTaskForm.getByLabel('Due date').fill(dueDate);
    }
    await this.createTaskForm.getByRole('button', { name: 'Add task' }).click();
    await expect(this.taskCard(title)).toBeVisible();
  }

  async editTask(title, updates) {
    const card = this.taskCard(title);
    await card.getByRole('button', { name: 'Edit' }).click();
    const editForm = this.page.locator('form.task-edit-form');

    if (updates.title !== undefined) {
      await editForm.locator('input[name="title"]').fill(updates.title);
    }
    if (updates.description !== undefined) {
      await editForm.locator('textarea[name="description"]').fill(updates.description);
    }
    if (updates.dueDate !== undefined) {
      await editForm.locator('input[name="dueDate"]').fill(updates.dueDate);
    }

    await editForm.getByRole('button', { name: 'Save' }).click();
    const nextTitle = updates.title || title;
    await expect(this.taskCard(nextTitle)).toBeVisible();
  }

  async toggleComplete(title) {
    const card = this.taskCard(title);
    await card.getByLabel(`Mark ${title} complete`).click();
  }

  async deleteTask(title) {
    const card = this.taskCard(title);
    await card.getByRole('button', { name: 'Delete' }).click();
    await expect(card).not.toBeVisible();
  }
}

module.exports = { TodoPage };