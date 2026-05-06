import { useEffect, useState } from 'react';
import { api, parseJsonOrEmpty } from '../api/client';
import ErrorAlert from './ErrorAlert';

const DEAL_STAGE_ORDER = ['Lead', 'Qualified', 'Proposal', 'Won', 'Lost'];

const DEAL_STAGE_META = {
  Lead: {
    title: 'Lead',
    color: 'bg-slate-50 text-slate-800 border-slate-200',
  },
  Qualified: {
    title: 'Qualified',
    color: 'bg-indigo-50 text-indigo-900 border-indigo-100',
  },
  Proposal: {
    title: 'Proposal',
    color: 'bg-amber-50 text-amber-900 border-amber-100',
  },
  Won: {
    title: 'Won',
    color: 'bg-green-50 text-green-800 border-green-100',
  },
  Lost: {
    title: 'Lost',
    color: 'bg-rose-50 text-rose-800 border-rose-100',
  },
};

const DUE_DATE_BUCKET_KEYS = ['due_today', 'due_soon', 'overdue', 'no_due'];

const DUE_DATE_BUCKET_META = {
  due_today: {
    title: 'Due today',
    color: 'bg-amber-50 text-amber-900 border-amber-100',
  },
  due_soon: {
    title: 'Due soon',
    color: 'bg-sky-50 text-sky-800 border-sky-100',
  },
  overdue: {
    title: 'Overdue',
    color: 'bg-red-50 text-red-800 border-red-100',
  },
  no_due: {
    title: 'No due date',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
  },
};

function FollowUpsAndTasksBucketSection({ heading, buckets }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {heading}
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {DUE_DATE_BUCKET_KEYS.map((key) => {
          const meta = DUE_DATE_BUCKET_META[key];
          return (
            <div
              key={`${heading}-${key}`}
              className={`rounded-xl border px-4 py-3 ${meta.color}`}
            >
              <p className="text-2xl font-bold tabular-nums">{buckets[key]}</p>
              <p className="text-xs font-semibold mt-1">{meta.title}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api('/api/dashboard');
        const data = await parseJsonOrEmpty(res);
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load dashboard.');
        }
        if (!cancelled && data) {
          setDashboardData(data);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-sm text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  const defaultDueDateBuckets = {
    due_today: 0,
    due_soon: 0,
    overdue: 0,
    no_due: 0,
  };
  const emptyDealStages = {
    Lead: 0,
    Qualified: 0,
    Proposal: 0,
    Won: 0,
    Lost: 0,
  };

  const defaultOverviewTotals = {
    contacts: 0,
    notes: 0,
    tasks: 0,
    deals: 0,
  };

  const followUps = dashboardData?.follow_ups ?? defaultDueDateBuckets;
  const tasks = dashboardData?.tasks ?? defaultDueDateBuckets;
  const totals = dashboardData?.totals ?? defaultOverviewTotals;
  const dealsByStage = dashboardData?.deals_by_stage ?? emptyDealStages;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>

      <ErrorAlert
        message={error}
        title="Something went wrong"
        onDismiss={() => setError('')}
      />

      <FollowUpsAndTasksBucketSection
        heading="Follow-ups"
        buckets={followUps}
      />

      <FollowUpsAndTasksBucketSection
        heading="Tasks"
        buckets={tasks}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Deals
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {DEAL_STAGE_ORDER.map((stage) => {
            const meta = DEAL_STAGE_META[stage];
            return (
              <div
                key={stage}
                className={`rounded-xl border px-4 py-3 ${meta.color}`}
              >
                <p className="text-2xl font-bold tabular-nums">{dealsByStage[stage]}</p>
                <p className="text-xs font-semibold mt-1">{meta.title}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          General overview
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
            <p className="text-2xl font-bold tabular-nums">{totals.contacts}</p>
            <p className="text-xs font-semibold mt-1">Contacts</p>
          </div>
          <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-violet-900">
            <p className="text-2xl font-bold tabular-nums">{totals.notes}</p>
            <p className="text-xs font-semibold mt-1">Notes</p>
          </div>
          <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-teal-900">
            <p className="text-2xl font-bold tabular-nums">{totals.tasks}</p>
            <p className="text-xs font-semibold mt-1">Tasks</p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-orange-900">
            <p className="text-2xl font-bold tabular-nums">{totals.deals}</p>
            <p className="text-xs font-semibold mt-1">Deals</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
