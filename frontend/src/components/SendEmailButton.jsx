import { useState } from 'react';
import SendEmailModal from './SendEmailModal';

function SendEmailButton({
  contactId,
  toEmail,
  defaultSubject = '',
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const trimmed = typeof toEmail === 'string' ? toEmail.trim() : '';

  const baseClass =
    'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

  if (!trimmed) {
    return (
      <button
        type="button"
        disabled
        title="Save an email address on this contact first"
        className={`${baseClass} cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400`}
      >
        Send email
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        className={`${baseClass} border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm hover:bg-emerald-100 focus:ring-emerald-500`}
      >
        Send email
      </button>
      {modalOpen ? (
        <SendEmailModal
          contactId={contactId}
          toEmail={trimmed}
          defaultSubject={defaultSubject}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}

export default SendEmailButton;
