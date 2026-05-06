const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'due_today', label: 'Due Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'due_soon', label: 'Due Soon' },
  { key: 'no_followup', label: 'No Follow-up' },
];

export default function ContactsSearchBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onAddContact,
  resultCount,
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onAddContact}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
        >
          + Add Contact
        </button>
      </div>

      <div className="flex gap-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        {resultCount} contact{resultCount !== 1 ? 's' : ''}
      </p>
    </>
  );
}
