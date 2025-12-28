import React, { useState, useEffect, useRef } from 'react';
import { generateUUID } from '../utils/uuid.js';

const STORAGE_KEY = 'ndax-quantum-todos';

/**
 * Helper function to get task status
 * Ensures backward compatibility with tasks that don't have a status field
 * @param {object} todo - Todo item
 * @returns {string} Task status (notStarted, inProgress, or completed)
 */
const getTaskStatus = (todo) => {
  return todo.status || (todo.completed ? 'completed' : 'notStarted');
};

const TodoApp = ({ onBack }) => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inProgress, completed
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  // Load todos from localStorage on mount
  useEffect(() => {
    loadTodos();
  }, []);

  // Auto-focus edit input when editing
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const loadTodos = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        } else {
          setTodos([]);
        }
      }
    } catch (err) {
      console.error('Error loading todos:', err);
      setError('Failed to load todos from storage');
      setTodos([]);
    }
  };

  const saveTodos = (updatedTodos) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setError('');
    } catch (err) {
      console.error('Error saving todos:', err);
      setError('Failed to save todos. Storage may be full.');
    }
  };

  const addTodo = (e) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      setError('Please enter a task');
      return;
    }

    if (trimmedValue.length > 500) {
      setError('Task is too long (max 500 characters)');
      return;
    }

    const newTodo = {
      id: generateUUID(),
      text: trimmedValue,
      status: 'notStarted', // notStarted, inProgress, completed
      completed: false, // Keep for backward compatibility
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTodos = [...todos, newTodo];
    saveTodos(updatedTodos);
    setInputValue('');
    setError('');
    
    // Focus back on input for quick task entry
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        const newCompleted = !todo.completed;
        return { 
          ...todo, 
          completed: newCompleted,
          status: newCompleted ? 'completed' : (todo.status || 'notStarted'),
          updatedAt: new Date().toISOString() 
        };
      }
      return todo;
    });
    saveTodos(updatedTodos);
  };

  const startTask = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, status: 'inProgress', updatedAt: new Date().toISOString() }
        : todo
    );
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = (id) => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      setError('Task cannot be empty');
      return;
    }

    if (trimmedValue.length > 500) {
      setError('Task is too long (max 500 characters)');
      return;
    }

    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, text: trimmedValue, updatedAt: new Date().toISOString() }
        : todo
    );
    saveTodos(updatedTodos);
    setEditingId(null);
    setEditValue('');
    setError('');
  };

  const clearCompleted = () => {
    const updatedTodos = todos.filter(todo => !todo.completed);
    saveTodos(updatedTodos);
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const filteredTodos = todos.filter(todo => {
    const taskStatus = getTaskStatus(todo);
    
    if (filter === 'active') return !todo.completed;
    if (filter === 'inProgress') return taskStatus === 'inProgress' && !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    inProgress: todos.filter(todo => {
      const taskStatus = getTaskStatus(todo);
      return taskStatus === 'inProgress' && !todo.completed;
    }).length,
    completed: todos.filter(todo => todo.completed).length
  };

  return (
    <div className="todo-app-container">
      <div className="todo-header">
        <button className="btn-back" onClick={onBack} aria-label="Back to dashboard">
          ← Back
        </button>
        <h1>📝 Task Manager</h1>
        <div className="header-spacer"></div>
      </div>

      {/* Stats Section */}
      <div className="todo-stats">
        <div className="todo-stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="todo-stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="todo-stat-card">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="todo-stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {error && (
        <div className="todo-error" role="alert">
          {error}
          <button 
            className="error-dismiss" 
            onClick={() => setError('')}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="todo-form">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
          maxLength={500}
          aria-label="New task input"
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          aria-label="Add task"
        >
          Add Task
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="todo-filters" role="tablist">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          role="tab"
          aria-selected={filter === 'all'}
          aria-label="Show all tasks"
        >
          All ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
          role="tab"
          aria-selected={filter === 'active'}
          aria-label="Show active tasks"
        >
          Active ({stats.active})
        </button>
        <button
          className={`filter-btn ${filter === 'inProgress' ? 'active' : ''}`}
          onClick={() => setFilter('inProgress')}
          role="tab"
          aria-selected={filter === 'inProgress'}
          aria-label="Show in progress tasks"
        >
          In Progress ({stats.inProgress})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
          role="tab"
          aria-selected={filter === 'completed'}
          aria-label="Show completed tasks"
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Todo List */}
      <div className="todo-list" role="list">
        {filteredTodos.length === 0 ? (
          <div className="todo-empty-state">
            {filter === 'all' && (
              <>
                <div className="empty-icon">📋</div>
                <h3>No tasks yet</h3>
                <p>Add your first task above to get started!</p>
              </>
            )}
            {filter === 'active' && (
              <>
                <div className="empty-icon">✨</div>
                <h3>All caught up!</h3>
                <p>No active tasks remaining.</p>
              </>
            )}
            {filter === 'inProgress' && (
              <>
                <div className="empty-icon">🚀</div>
                <h3>No tasks in progress</h3>
                <p>Click &apos;Start&apos; on a task to begin working on it.</p>
              </>
            )}
            {filter === 'completed' && (
              <>
                <div className="empty-icon">🎯</div>
                <h3>No completed tasks</h3>
                <p>Complete some tasks to see them here.</p>
              </>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const taskStatus = getTaskStatus(todo);
            return (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''} ${taskStatus === 'inProgress' ? 'in-progress' : ''}`}
              role="listitem"
            >
              <div className="todo-item-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="todo-checkbox"
                  id={`todo-${todo.id}`}
                  aria-label={`Mark task as ${todo.completed ? 'incomplete' : 'complete'}`}
                />
                
                {editingId === todo.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    className="todo-edit-input"
                    maxLength={500}
                    aria-label="Edit task"
                  />
                ) : (
                  <div className="todo-text-wrapper">
                    <label htmlFor={`todo-${todo.id}`} className="todo-text">
                      {todo.text}
                    </label>
                    {taskStatus === 'inProgress' && !todo.completed && (
                      <span className="status-badge in-progress-badge">🚀 In Progress</span>
                    )}
                  </div>
                )}
              </div>

              <div className="todo-actions">
                {editingId === todo.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="todo-btn save-btn"
                      aria-label="Save changes"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="todo-btn cancel-btn"
                      aria-label="Cancel editing"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    {taskStatus === 'notStarted' && !todo.completed && (
                      <button
                        onClick={() => startTask(todo.id)}
                        className="todo-btn start-btn"
                        aria-label="Start task"
                        title="Start working on this task"
                      >
                        ▶
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(todo)}
                      className="todo-btn edit-btn"
                      aria-label="Edit task"
                      disabled={todo.completed}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="todo-btn delete-btn"
                      aria-label="Delete task"
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* Footer Actions */}
      {stats.completed > 0 && (
        <div className="todo-footer">
          <button
            onClick={clearCompleted}
            className="btn btn-secondary clear-completed-btn"
            aria-label={`Clear ${stats.completed} completed tasks`}
          >
            Clear Completed ({stats.completed})
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="todo-help">
        <p><strong>Tip:</strong> Press Enter to save edits, Escape to cancel</p>
      </div>
    </div>
  );
};

export default TodoApp;
