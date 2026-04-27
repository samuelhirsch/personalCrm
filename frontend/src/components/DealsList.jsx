import { useState } from 'react';

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

const STAGE_COLORS = {
  Lead:      'bg-gray-100 text-gray-600',
  Qualified: 'bg-blue-100 text-blue-700',
  Proposal:  'bg-yellow-100 text-yellow-700',
  Won:       'bg-green-100 text-green-700',
  Lost:      'bg-red-100 text-red-600',
};

function StagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className={`text-xs font-medium rounded px-2 py-1 cursor-pointer select-none ${STAGE_COLORS[value]}`}
      >
        {value} ▾
      </div>
      {open && (
        <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-28">
          {STAGES.map((s) => (
            <div
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer hover:opacity-80 ${STAGE_COLORS[s]}`}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DealsList({ contactId, deals, onAddDeal, onUpdateDeal, onDeleteDeal }) {
  const [newDeal, setNewDeal] = useState({ title: '', stage: 'Lead', value: '' });

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Deals
      </p>

      <div className="space-y-2 mb-3">
        {deals && deals.length > 0 ? (
          deals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">{deal.title}</p>
                <p className="text-xs text-gray-400">{deal.value ? `$${deal.value}` : ''}</p>
              </div>
              <StagePicker
                value={deal.stage}
                onChange={(stage) => onUpdateDeal(contactId, deal.id, { ...deal, stage })}
              />
              <button
                onClick={() => onDeleteDeal(contactId, deal.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">No deals yet</p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          placeholder="Deal name"
          value={newDeal.title}
          onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
          className="flex-1 min-w-32 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Value ($)"
          value={newDeal.value}
          onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
          className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <StagePicker
          value={newDeal.stage}
          onChange={(stage) => setNewDeal({ ...newDeal, stage })}
        />
        <button
          onClick={() => {
            if (!newDeal.title.trim()) return;
            onAddDeal(contactId, newDeal);
            setNewDeal({ title: '', stage: 'Lead', value: '' });
          }}
          className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default DealsList;
