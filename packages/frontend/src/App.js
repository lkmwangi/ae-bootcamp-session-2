import React, { useEffect, useState } from 'react';
import './App.css';

const emptyTaskForm = {
  title: '',
  description: '',
  dueDate: '',
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskForm, setEditingTaskForm] = useState(emptyTaskForm);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;

    setTaskForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEditingTaskFormChange = (event) => {
    const { name, value } = event.target;

    setEditingTaskForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const clearEditingState = () => {
    setEditingTaskId(null);
    setEditingTaskForm(emptyTaskForm);
  };

  const refreshTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          dueDate: taskForm.dueDate || null,
          completed: false,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to add task');
      }

      setTaskForm(emptyTaskForm);
      await refreshTasks();
    } catch (err) {
      setError('Error adding task: ' + err.message);
      console.error('Error adding task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to delete task');
      }

      if (editingTaskId === taskId) {
        clearEditingState();
      }

      await refreshTasks();
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleCompletion = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to update task');
      }

      await refreshTasks();
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
    });
  };

  const handleUpdateTask = async (event) => {
    event.preventDefault();

    if (!editingTaskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingTaskForm.title,
          description: editingTaskForm.description,
          dueDate: editingTaskForm.dueDate || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to update task');
      }

      clearEditingState();
      await refreshTasks();
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const totalTasks = tasks.length;
  const remainingTasks = tasks.filter((task) => !task.completed).length;

  const formatDueDate = (dueDate) => {
    if (!dueDate) {
      return null;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dueDate));
  };

  return (
    <div className="App shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Task manager</p>
          <h1>To Do App</h1>
          <p className="hero-copy">Track work, organize due dates, and keep the next action obvious.</p>
        </div>
        <div className="hero-stats" aria-label="Task summary">
          <div>
            <span className="stat-value">{remainingTasks}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div>
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </header>

      <main>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Capture work</p>
              <h2>Add a new task</h2>
            </div>
          </div>
          <form className="task-form" data-testid="create-task-form" onSubmit={handleCreateTask}>
            <label htmlFor="title">Task title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={taskForm.title}
              onChange={handleTaskFormChange}
              placeholder="Enter a clear task title"
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={taskForm.description}
              onChange={handleTaskFormChange}
              placeholder="Add notes or context"
              rows="3"
            />

            <label htmlFor="dueDate">Due date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={taskForm.dueDate}
              onChange={handleTaskFormChange}
            />

            <button className="primary-button" type="submit">Add task</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Task list</p>
              <h2>Tasks from the database</h2>
            </div>
          </div>
          {loading && <p>Loading data...</p>}
          {error && <p className="error" role="alert">{error}</p>}
          {!loading && !error && (
            tasks.length > 0 ? (
              <div className="task-list">
                {tasks.map((task) => {
                  const isEditing = editingTaskId === task.id;
                  const dueDateLabel = formatDueDate(task.dueDate);

                  return (
                    <article
                      className={`task-card ${task.completed ? 'task-card--completed' : ''}`}
                      data-testid="task-card"
                      key={task.id}
                    >
                      {!isEditing ? (
                        <>
                          <div className="task-card__content">
                            <label className="task-checkbox">
                              <input
                                aria-label={`Mark ${task.title} complete`}
                                checked={task.completed}
                                onChange={() => handleToggleCompletion(task)}
                                type="checkbox"
                              />
                              <span>
                                <strong>{task.title}</strong>
                                {task.description ? <span className="task-description">{task.description}</span> : null}
                              </span>
                            </label>
                            <div className="task-meta">
                              <span className={`status-chip ${task.completed ? 'status-chip--done' : 'status-chip--todo'}`}>
                                {task.completed ? 'Complete' : 'In progress'}
                              </span>
                              {dueDateLabel ? <span className="due-date">Due {dueDateLabel}</span> : <span className="due-date due-date--muted">No due date</span>}
                            </div>
                          </div>

                          <div className="task-actions">
                            <button type="button" onClick={() => handleEditTask(task)}>Edit</button>
                            <button className="delete-button" type="button" onClick={() => handleDeleteTask(task.id)}>
                              Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        <form className="task-edit-form" onSubmit={handleUpdateTask}>
                          <label htmlFor={`edit-title-${task.id}`}>Task title</label>
                          <input
                            id={`edit-title-${task.id}`}
                            name="title"
                            type="text"
                            value={editingTaskForm.title}
                            onChange={handleEditingTaskFormChange}
                          />

                          <label htmlFor={`edit-description-${task.id}`}>Description</label>
                          <textarea
                            id={`edit-description-${task.id}`}
                            name="description"
                            rows="3"
                            value={editingTaskForm.description}
                            onChange={handleEditingTaskFormChange}
                          />

                          <label htmlFor={`edit-dueDate-${task.id}`}>Due date</label>
                          <input
                            id={`edit-dueDate-${task.id}`}
                            name="dueDate"
                            type="date"
                            value={editingTaskForm.dueDate}
                            onChange={handleEditingTaskFormChange}
                          />

                          <div className="task-actions task-actions--editing">
                            <button className="primary-button" type="submit">Save</button>
                            <button type="button" onClick={clearEditingState}>Cancel</button>
                          </div>
                        </form>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No tasks yet</h3>
                <p>Add a first task to start tracking work.</p>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}

export default App;