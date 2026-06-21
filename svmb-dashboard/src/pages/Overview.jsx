import { useClients, getClientStats } from '../hooks/useClients';
import MetricCard from '../components/MetricCard';
import {
  Users, UserCheck, UserX, Building2, Handshake,
  CreditCard, CheckCircle, XCircle, Clock,
  Heart, ImageOff, AlertTriangle, TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = {
  male: '#2563eb',
  female: '#ec4899',
  paid: '#059669',
  notPaid: '#dc2626',
  unmatched: '#94a3b8',
  profilesSent: '#2563eb',
  meetingScheduled: '#d97706',
  married: '#059669',
};

export default function Overview() {
  const { clients, loading } = useClients();
  const stats = getClientStats(clients);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '50vh', marginLeft: 0 }}>
        <div className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // Chart data
  const genderData = [
    { name: 'Male', value: stats.male, color: COLORS.male },
    { name: 'Female', value: stats.female, color: COLORS.female },
  ].filter(d => d.value > 0);

  const paymentData = [
    { name: 'Paid', value: stats.paid, color: COLORS.paid },
    { name: 'Not Paid', value: stats.notPaid, color: COLORS.notPaid },
  ].filter(d => d.value > 0);

  const matchData = [
    { name: 'Unmatched', value: stats.unmatched, fill: COLORS.unmatched },
    { name: 'Profiles Sent', value: stats.profilesSent, fill: COLORS.profilesSent },
    { name: 'Meeting Scheduled', value: stats.meetingScheduled, fill: COLORS.meetingScheduled },
    { name: 'Married', value: stats.matchMarried, fill: COLORS.married },
  ];

  // Monthly registration data
  const monthlyData = getMonthlyData(clients);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of Sri Venkateshwara Marriage Bureau</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-metrics stagger-children">
        <MetricCard icon={Users} label="Total Clients" value={stats.total} variant="primary" />
        <MetricCard icon={UserCheck} label="Male Clients" value={stats.male} variant="info" />
        <MetricCard icon={UserCheck} label="Female Clients" value={stats.female} variant="accent" />
        <MetricCard icon={Building2} label="Own Bureau" value={stats.own} variant="primary" />
        <MetricCard icon={Handshake} label="Partner Bureau" value={stats.partner} variant="neutral" />
        <MetricCard icon={CheckCircle} label="Paid" value={stats.paid} variant="success" />
        <MetricCard icon={XCircle} label="Not Paid" value={stats.notPaid} variant="danger" />
        <MetricCard icon={TrendingUp} label="Active Profiles" value={stats.active} variant="success" />
        <MetricCard icon={Heart} label="Married" value={stats.married} variant="accent" />
        <MetricCard
          icon={ImageOff}
          label="Missing Photo"
          value={stats.missingPhoto}
          variant={stats.missingPhoto > 0 ? 'warning' : 'neutral'}
          subtitle={stats.missingPhoto > 0 ? 'Upload from profile page' : 'All photos present'}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Missing Gender"
          value={stats.missingGender}
          variant={stats.missingGender > 0 ? 'danger' : 'neutral'}
          subtitle={stats.missingGender > 0 ? '⚠ Assign gender to generate ID' : 'All genders assigned'}
        />
      </div>

      {/* Charts */}
      <div className="grid-charts">
        {/* Gender Donut */}
        <div className="card-elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Gender Distribution
          </h3>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.8125rem',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.8125rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>No client data yet</p>
            </div>
          )}
        </div>

        {/* Payment Donut */}
        <div className="card-elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Payment Status
          </h3>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.8125rem',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.8125rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>No payment data yet</p>
            </div>
          )}
        </div>

        {/* Match Status Bar */}
        <div className="card-elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Match Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={matchData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border-light)' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '0.8125rem',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {matchData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Registrations */}
        <div className="card-elevated" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Profiles Added per Month
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={{ stroke: 'var(--border-light)' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '0.8125rem',
                }}
              />
              <Bar dataKey="count" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function getMonthlyData(clients) {
  const months = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  clients.forEach((c) => {
    if (c.created_at) {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!months[key]) months[key] = { month: label, count: 0, sortKey: key };
      months[key].count++;
    }
  });

  return Object.values(months)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-12);
}
