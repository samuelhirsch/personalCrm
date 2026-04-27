import { useState } from 'react';

const fakeTasks = [
  { id: 1, title: 'Call John back', due_date: '2026-04-28', done: false },
  { id: 2, title: 'Send proposal to Jane', due_date: '2026-04-30', done: false },
  { id: 3, title: 'Follow up on contract', due_date: '2026-04-20', done: true },
];

function Tasks() {
  const [tasks, setTasks] = useState(fakeTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showDone, setShowDone] = useState(false);

  const filtered = tasks.filter((t) => showDone ? t.done : !t.done);

  function handleToggle(id) {
    setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function handleDelete(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    setTasks([
      { id: Date.now(), title: newTitle, due_date: newDate, done: false },
      ...tasks,
    ]);
    setNewTitle('');
    setNewDate('');
  }

  const today = new Date().toLocaleDateString('en-CA'); // "2026-04-26"

  return (
    <div className="max-w-2xl mx-auto space-y-4">

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
          onChange={(e) => setNewTitle(e.target.value)}
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
                <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.title}
                </span>
                {task.due_date && (
                  <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {overdue ? 'Overdue · ' : ''}{task.due_date}
                  </span>
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