const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

const createTask = async (task = {}) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({
      title: task.title ?? 'New task',
      description: task.description ?? '',
      dueDate: task.dueDate ?? null,
      completed: task.completed ?? false,
    })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('Task API', () => {
  it('returns tasks in the expected order', async () => {
    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('completed');
  });

  it('creates a task with validation', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Write milestone plan',
        description: 'Break the work into smaller slices',
        dueDate: '2026-08-05',
        completed: false,
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Write milestone plan');
    expect(response.body.description).toBe('Break the work into smaller slices');
    expect(response.body.dueDate).toBe('2026-08-05');
    expect(response.body.completed).toBe(false);
  });

  it('rejects invalid task payloads', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: '',
        dueDate: 'not-a-date',
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('updates and deletes a task', async () => {
    const task = await createTask({ title: 'Update me' });

    const updateResponse = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({
        title: 'Updated title',
        completed: true,
      })
      .set('Accept', 'application/json');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.title).toBe('Updated title');
    expect(updateResponse.body.completed).toBe(true);

    const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Task deleted successfully', id: task.id });
  });
});