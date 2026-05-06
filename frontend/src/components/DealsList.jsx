import { useState, useEffect } from 'react';
import ErrorAlert from './ErrorAlert';

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

const STAGE_COLORS = {
  Lead:      'bg-gray-100 text-gray-600',
  Qualified: 'bg-blue-100 text-blue-700',
  Proposal:  'bg-yellow-100 text-yellow-700',
  Won:       'bg-green-100 text-green-700',
  Lost:      'bg-red-100 text-red-600',
};

function StagePicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
        }}
        className={`text-xs font-medium rounded px-2 py-1 select-none ${STAGE_COLORS[value]} ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
      >
        {value} ▾
      </div>
      {open && !disabled && (
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

function DealsList({
  contactId,
  deals,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  onDraftDirtyChange,
  onRegisterSaveDraft,
  disabled = false,
  /** When true, row keys and callbacks use array index (e.g. unsaved contact modal). */
  identifyRowsByIndex = false,
}) {
  const [newDeal, setNewDeal] = useState({ title: '', stage: 'Lead', value: '' });
  const [dealError, setDealError] = useState('');
  const isComposingDeal = Boolean(newDeal.title.trim());
  const draftIsDirty = Boolean(
    newDeal.title.trim() || newDeal.value.trim() || newDeal.stage !== 'Lead',
  );

  useEffect(() => {
    onDraftDirtyChange?.(draftIsDirty);
  }, [draftIsDirty, onDraftDirtyChange]);

  async function saveDraftDeal() {
    if (!newDeal.title.trim()) {
      setDealError('Enter a deal name before adding.');
      return false;
    }
    if (identifyRowsByIndex) {
          onAddDeal(newDeal);
    } else {
      await onAddDeal(contactId, newDeal);
    }
    setNewDeal({ title: '', stage: 'Lead', value: '' });
    return true;
  }

  useEffect(() => {
    onRegisterSaveDraft?.(saveDraftDeal);
  }, [onRegisterSaveDraft, saveDraftDeal]);

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
        Deals
      </p>

      <ErrorAlert
        message={dealError}
        onDismiss={() => setDealError('')}
        className="mb-2"
      />

      <div className="space-y-2 mb-3">
        {deals && deals.length > 0 ? (
          deals.map((deal, index) => (
              <div
                key={identifyRowsByIndex ? `deal-row-${index}` : deal.id}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">{deal.title}</p>
                  <p className="text-xs text-gray-400">{deal.value ? `$${deal.value}` : ''}</p>
                </div>
                <StagePicker
                  value={deal.stage}
                  disabled={disabled}
                  onChange={(stage) => {
                    if (identifyRowsByIndex) {
                      onUpdateDeal(index, { ...deal, stage });
                    } else {
                      onUpdateDeal(contactId, deal.id, { ...deal, stage });
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (identifyRowsByIndex) {
                      onDeleteDeal(index);
                    } else {
                      onDeleteDeal(contactId, deal.id);
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
                >
                  ✕
                </button>
              </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic">No deals yet</p>
        )}
      </div>

      <div className="space-y-2">
        <input
          placeholder="Start typing(name of deal... etc.) to add a deal"
          disabled={disabled}
          value={newDeal.title}
          onChange={(e) => {
            setDealError('');
            const title = e.target.value;
            setNewDeal((prev) => {
              if (!title.trim()) {
                return { title, stage: 'Lead', value: '' };
              }
              return { ...prev, title };
            });
          }}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
        />
        {isComposingDeal ? (
          <div className="flex gap-2 flex-wrap items-center">
            <input
              placeholder="Value ($)"
              disabled={disabled}
              value={newDeal.value}
              onChange={(e) =>
                setNewDeal((prev) => ({ ...prev, value: e.target.value }))
              }
              className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
            <StagePicker
              value={newDeal.stage}
              disabled={disabled}
              onChange={(stage) =>
                setNewDeal((prev) => ({ ...prev, stage }))
              }
            />
            <button
              type="button"
              disabled={disabled}
              onClick={saveDraftDeal}
              className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-900 disabled:opacity-50"
              title="Add deal"
            >
              Add deal
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DealsList;
