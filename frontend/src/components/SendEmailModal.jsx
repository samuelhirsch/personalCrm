import { useState, useEffect } from 'react';
import ErrorAlert from './ErrorAlert';
import { api, parseJsonOrEmpty } from '../api/client';

function SendEmailModal({
  contactId,
  toEmail,
  defaultSubject = '',
  onClose,
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setSubject(defaultSubject);
    setBody('');
    setError('');
    setSending(false);
  }, [contactId, defaultSubject]);

  function handleBackdropClick() {
    if (sending) return;
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const res = await api('/api/sendemail', {
        method: 'POST',
        body: JSON.stringify({ contactId, subject, body }),
      });
      const data = await parseJsonOrEmpty(res);
      if (!res.ok) {
        setError(data?.message || 'Could not send email.');
        return;
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Could not send email.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={handleBackdropClick}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">Send email</h2>
        <p className="mt-1 text-sm text-gray-500">
          Message will be sent from your configured server mailbox to:
        </p>
        <p className="mt-1 break-all text-sm font-medium text-gray-800">{toEmail}</p>

        <ErrorAlert
          message={error}
          title="Could not send"
          onDismiss={() => setError('')}
          className="mt-4"
        />

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="send-email-subject" className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Subject
            </label>
            <input
              id="send-email-subject"
              value={subject}
              onChange={(e) => {
                setError('');
                setSubject(e.target.value);
              }}
              disabled={sending}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="send-email-body" className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Message
            </label>
            <textarea
              id="send-email-body"
              rows={10}
              value={body}
              onChange={(e) => {
                setError('');
                setBody(e.target.value);
              }}
              disabled={sending}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              disabled={sending}
              onClick={handleBackdropClick}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendEmailModal;
