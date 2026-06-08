'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const API_URL = 'http://localhost:3500/api/admin/stats/overview';

interface OverviewStats {
  totalConversations: number;
  avgResponseTimeMs: number;
  successfulMatches: number;
  unresolvedQueries: number;
  intentRecognitionAccuracy?: string;
  chartData?: DailyMessage[];
}

interface DailyMessage {
  name: string;
  messages: number;
}

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

const MOCK_STATS: OverviewStats = {
  totalConversations: 1245,
  avgResponseTimeMs: 450,
  successfulMatches: 1102,
  unresolvedQueries: 143,
};

const MOCK_DAILY_MESSAGES: DailyMessage[] = [
  { name: 'Mon', messages: 120 },
  { name: 'Tue', messages: 200 },
  { name: 'Wed', messages: 165 },
  { name: 'Thu', messages: 240 },
  { name: 'Fri', messages: 310 },
  { name: 'Sat', messages: 145 },
  { name: 'Sun', messages: 65 },
];

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
}

function calcSuccessRate(stats: OverviewStats): number {
  if (!stats.totalConversations) return 0;
  return Math.round((stats.successfulMatches / stats.totalConversations) * 1000) / 10;
}

function buildPieData(stats: OverviewStats): PieSlice[] {
  return [
    { name: 'Successful Matches', value: stats.successfulMatches, color: '#10b981' },
    { name: 'Unresolved Queries', value: stats.unresolvedQueries, color: '#f59e0b' },
  ];
}

/** Skeleton placeholder shown while overview stats are loading. */
const AnalyticsSkeleton = () => (
  <div className="animate-pulse space-y-6 p-4 lg:p-6">
    <div className="space-y-2">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-2xl border border-slate-200 bg-white" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="h-96 rounded-2xl border border-slate-200 bg-white xl:col-span-2" />
      <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
    </div>
  </div>
);

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
}

const StatCard = ({ label, value, hint, icon: Icon, iconBg, iconColor }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

/** Custom legend for the donut chart. */
const DonutLegend = ({ data }: { data: PieSlice[] }) => (
  <ul className="mt-4 space-y-3">
    {data.map((item) => (
      <li key={item.name} className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-slate-600">{item.name}</span>
        </div>
        <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
      </li>
    ))}
  </ul>
);

const AdminAnalytics = () => {
  const [stats, setStats] = useState<OverviewStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, { headers: getAuthHeaders() });
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error('Invalid overview response');
        }

        const data = json.data as OverviewStats;
        if (
          data.totalConversations == null ||
          data.avgResponseTimeMs == null ||
          data.successfulMatches == null ||
          data.unresolvedQueries == null
        ) {
          throw new Error('Incomplete overview data');
        }

        setStats(data);
        setUsingFallback(false);
      } catch {
        setStats(MOCK_STATS);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const successRate = useMemo(() => calcSuccessRate(stats), [stats]);
  const pieData = useMemo(() => buildPieData(stats), [stats]);
  const pieTotal = pieData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of chatbot performance and system metrics
            </p>
          </div>
          {usingFallback && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Showing demo data — API unavailable
            </span>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Conversations"
            value={stats.totalConversations.toLocaleString()}
            hint="All chatbot sessions this period"
            icon={ChatBubbleLeftRightIcon}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            label="Avg Response Time"
            value={`${stats.avgResponseTimeMs} ms`}
            hint="Mean time to first reply"
            icon={ClockIcon}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            hint={`${stats.successfulMatches.toLocaleString()} successful matches`}
            icon={CheckCircleIcon}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Intent Accuracy"
            value={stats.intentRecognitionAccuracy ?? `${successRate}%`}
            hint="Intent recognition accuracy"
            icon={ArrowPathIcon}
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Area chart — messages over 7 days */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Messages Processed over the last 7 days
              </h2>
              <p className="text-sm text-slate-500">Daily volume of chatbot interactions</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData || MOCK_DAILY_MESSAGES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#messagesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut chart — match ratio */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Query Resolution</h2>
              <p className="text-sm text-slate-500">Successful matches vs unresolved queries</p>
            </div>
            <div className="relative h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      typeof value === 'number' ? value.toLocaleString() : String(value ?? ''),
                      'Count',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-slate-900">{pieTotal.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Total queries</p>
              </div>
            </div>
            <DonutLegend data={pieData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
