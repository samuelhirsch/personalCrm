import { useEffect, useState } from 'react';
import { api, parseJsonOrEmpty } from '../api/client';
import ErrorAlert from './ErrorAlert';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showDone, setShowDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api('/api/tasks');
        const data = await parseJsonOrEmpty(res);
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load tasks.');
        }
        if (!cancelled) {
          setTasks(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load tasks.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = tasks.filter((t) => showDone ? t.done : !t.done);
  console.log(filtered);
  async function handleToggle(id) {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;

    setError('');
    try {
      const res = await api(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !current.done }),
      });
      const updated = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(updated?.message || 'Could not update task.');
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setError(e.message || 'Could not update task.');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      const res = await api(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await parseJsonOrEmpty(res);
        throw new Error(data?.message || 'Could not delete task.');
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message || 'Could not delete task.');
    }
  }

  async function handleAdd() {
    if (!newTitle.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setError('');
    try {
      const res = await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim(), due_date: newDate || null }),
      });
      const created = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(created?.message || 'Could not create task.');
      }
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDate('');
    } catch (e) {
      setError(e.message || 'Could not create task.');
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditTitle(task.title || '');
    setEditDate(task.due_date || '');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle('');
    setEditDate('');
  }

  async function handleSaveEdit(id) {
    const nextTitle = editTitle.trim();
    if (!nextTitle) {
      setError('Task title cannot be empty.');
      return;
    }

    setError('');
    try {
      const res = await api(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: nextTitle,
          due_date: editDate || null,
        }),
      });
      const updated = await parseJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(updated?.message || 'Could not update task.');
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEditing();
    } catch (e) {
      setError(e.message || 'Could not update task.');
    }
  }

  const today = new Date().toLocaleDateString('en-CA'); // "2026-04-26"

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-sm text-gray-500">
        Loading tasks…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <ErrorAlert
        message={error}
        title={error === 'Task title cannot be empty.' ? '' : 'Something went wrong'}
        onDismiss={() => setError('')}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Tasks</h1>
        <div className="flex gap-1">
          <button
            onClick={() => setShowDone(false)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${!showDone ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            Open
          </button>
          <button
            onClick={() => setShowDone(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${showDone ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <input
          placeholder="New task..."
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          + Add
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-8">
            {showDone ? 'No completed tasks.' : 'No open tasks.'}
          </p>
        ) : (
          filtered.map((task) => {
            const overdue = !task.done && task.due_date && task.due_date < today;
            return (
              <div key={task.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggle(task.id)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                {editingId === task.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <>
                    <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                    {task.due_date && (
                      <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {overdue ? 'Overdue · ' : ''}{task.due_date}
                      </span>
                    )}
                  </>
                )}
                {editingId === task.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEditing(task)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default Tasks;
