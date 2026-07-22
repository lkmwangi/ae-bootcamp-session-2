const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertTaskStmt = db.prepare(`
  INSERT INTO tasks (title, description, due_date, completed)
  VALUES (@title, @description, @dueDate, @completed)
`);
const selectTaskByIdStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
const deleteTaskStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
const taskSortClause = "ORDER BY completed ASC, CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END, due_date ASC, datetime(updated_at) DESC, datetime(created_at) DESC";

const initialTasks = [
  {
    title: 'Draft project outline',
    description: 'Capture the first implementation slice',
    dueDate: '2026-08-01',
    completed: 0,
  },
  {
    title: 'Review UI direction',
    description: 'Align on Material styling and accessibility',
    dueDate: '2026-07-30',
    completed: 1,
  },
  {
    title: 'Write integration tests',
    description: 'Cover the task API happy path and validation',
    dueDate: null,
    completed: 0,
  },
];

initialTasks.forEach((task) => {
  insertTaskStmt.run(task);
});

const toTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description ?? '',
  dueDate: task.due_date ?? null,
  completed: Boolean(task.completed),
  createdAt: task.created_at,
  updatedAt: task.updated_at,
});

const toItem = (task) => ({
  id: task.id,
  name: task.title,
  created_at: task.created_at,
});

const isValidDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

const validateTaskInput = (input, { allowPartial = false } = {}) => {
  const errors = [];

  if (!allowPartial || Object.prototype.hasOwnProperty.call(input, 'title')) {
    if (typeof input.title !== 'string' || input.title.trim() === '') {
      errors.push('Title is required');
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'description') && typeof input.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'dueDate') && !isValidDate(input.dueDate)) {
    errors.push('Due date must be a valid YYYY-MM-DD date');
  }

  if (Object.prototype.hasOwnProperty.call(input, 'completed') && typeof input.completed !== 'boolean') {
    errors.push('Completed must be a boolean');
  }

  return errors;
};

const listTasks = () => db.prepare(`SELECT * FROM tasks ${taskSortClause}`).all().map(toTask);

const updateTaskById = (taskId, updates) => {
  const existingTask = selectTaskByIdStmt.get(taskId);

  if (!existingTask) {
    return null;
  }

  const nextTask = {
    title: Object.prototype.hasOwnProperty.call(updates, 'title') ? updates.title.trim() : existingTask.title,
    description: Object.prototype.hasOwnProperty.call(updates, 'description')
      ? updates.description
      : existingTask.description,
    dueDate: Object.prototype.hasOwnProperty.call(updates, 'dueDate') ? updates.dueDate : existingTask.due_date,
    completed: Object.prototype.hasOwnProperty.call(updates, 'completed')
      ? Number(updates.completed)
      : existingTask.completed,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, due_date = ?, completed = ?, updated_at = ?
    WHERE id = ?
  `).run(
    nextTask.title,
    nextTask.description ?? '',
    nextTask.dueDate ?? null,
    nextTask.completed ? 1 : 0,
    nextTask.updatedAt,
    taskId,
  );

  return selectTaskByIdStmt.get(taskId);
};

const createTaskFromInput = (input) => {
  const result = insertTaskStmt.run({
    title: input.title.trim(),
    description: input.description ?? '',
    dueDate: input.dueDate ?? null,
    completed: input.completed ? 1 : 0,
  });

  return selectTaskByIdStmt.get(result.lastInsertRowid);
};

console.log('In-memory database initialized with sample task data');

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/tasks', (req, res) => {
  try {
    res.json(listTasks());
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const errors = validateTaskInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    const newTask = createTaskFromInput(req.body);
    res.status(201).json(toTask(newTask));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number.parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const updates = req.body ?? {};
    const errors = validateTaskInput(updates, { allowPartial: true });

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'At least one field is required to update a task' });
    }

    const updatedTask = updateTaskById(Number.parseInt(id, 10), updates);

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(toTask(updatedTask));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number.parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existingTask = selectTaskByIdStmt.get(Number.parseInt(id, 10));
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const result = deleteTaskStmt.run(Number.parseInt(id, 10));

    if (result.changes > 0) {
      res.json({ message: 'Task deleted successfully', id: Number.parseInt(id, 10) });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Compatibility routes for the starter app and existing tests
app.get('/api/items', (req, res) => {
  try {
    res.json(listTasks().map((task) => ({
      id: task.id,
      name: task.title,
      created_at: task.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const name = req.body?.name;

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const createdTask = createTaskFromInput({ title: name, description: '', dueDate: null, completed: false });
    res.status(201).json({
      id: createdTask.id,
      name: createdTask.title,
      created_at: createdTask.created_at,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number.parseInt(id, 10))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingTask = selectTaskByIdStmt.get(Number.parseInt(id, 10));
    if (!existingTask) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = deleteTaskStmt.run(Number.parseInt(id, 10));

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: Number.parseInt(id, 10) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertTaskStmt };