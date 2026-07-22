import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let tasks = [];

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(tasks));
  }),

  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json();

    if (!body.title || body.title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Title is required' }));
    }

    const newTask = {
      id: tasks.length + 1,
      title: body.title,
      description: body.description || '',
      dueDate: body.dueDate || null,
      completed: Boolean(body.completed),
      createdAt: new Date('2026-07-22T10:00:00.000Z').toISOString(),
      updatedAt: new Date('2026-07-22T10:00:00.000Z').toISOString(),
    };

    tasks = [...tasks, newTask];

    return res(ctx.status(201), ctx.json(newTask));
  }),

  rest.patch('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();
    const index = tasks.findIndex((task) => String(task.id) === String(id));

    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    const updatedTask = {
      ...tasks[index],
      ...body,
      updatedAt: new Date('2026-07-22T11:00:00.000Z').toISOString(),
    };

    tasks[index] = updatedTask;

    return res(ctx.status(200), ctx.json(updatedTask));
  }),

  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    tasks = tasks.filter((task) => String(task.id) !== String(id));

    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id: Number(id) }));
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  tasks = [];
});
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header and empty state', async () => {
    tasks = [];

    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('To Do App')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });

  test('loads and displays items', async () => {
    tasks = [
      {
        id: 1,
        title: 'Test Task 1',
        description: 'First task',
        dueDate: '2026-07-29',
        completed: false,
        createdAt: '2026-07-22T00:00:00.000Z',
        updatedAt: '2026-07-22T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Test Task 2',
        description: 'Second task',
        dueDate: null,
        completed: true,
        createdAt: '2026-07-22T00:00:00.000Z',
        updatedAt: '2026-07-22T00:00:00.000Z',
      },
    ];

    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const input = screen.getByLabelText('Task title');
    await act(async () => {
      await user.type(input, 'New Test Task');
    });
    
    const submitButton = screen.getByRole('button', { name: 'Add task' });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new item appears
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
    });
  });

  test('edits and completes a task', async () => {
    tasks = [
      {
        id: 1,
        title: 'Task to edit',
        description: 'Edit me',
        dueDate: '2026-07-28',
        completed: false,
        createdAt: '2026-07-22T00:00:00.000Z',
        updatedAt: '2026-07-22T00:00:00.000Z',
      },
    ];

    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Task to edit')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    const editTitle = screen.getByDisplayValue('Task to edit');
    await act(async () => {
      await user.clear(editTitle);
      await user.type(editTitle, 'Updated task title');
      await user.click(screen.getByRole('button', { name: 'Save' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Updated task title')).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByLabelText('Mark Updated task title complete'));
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Mark Updated task title complete')).toBeChecked();
    });
  });

  test('handles API error', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load tasks/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });
});