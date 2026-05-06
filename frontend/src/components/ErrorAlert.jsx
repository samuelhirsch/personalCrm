function ErrorAlert({
  message,
  title,
  onDismiss,
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) {
  if (!message?.trim()) return null;

  const showActions = Boolean(onRetry || onDismiss);

  return (
    <div
      role="alert"
      className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 ${className}`}
    >
      <div className={`flex items-start gap-3 ${showActions ? 'justify-between' : ''}`}>
        <div className="min-w-0 flex-1">
          {title ? (
            <p className="font-medium text-red-900">{title}</p>
          ) : null}
          <p className={title ? 'mt-0.5 text-red-800' : ''}>{message}</p>
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-2">
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="text-xs font-medium text-red-700 underline decoration-red-300 underline-offset-2 hover:text-red-900"
              >
                {retryLabel}
              </button>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded p-0.5 text-red-600 hover:bg-red-100 hover:text-red-900"
                aria-label="Dismiss"
              >
                ✕
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ErrorAlert;
