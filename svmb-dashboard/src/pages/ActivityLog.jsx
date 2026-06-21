import { useState } from 'react';
import { useActivityLog } from '../hooks/useActivityLog';
import { History } from 'lucide-react';

const EVENT_TYPES = [
  'profile_created',
  'profile_updated',
  'photo_uploaded',
  'extraction_error',
  'correction_applied',
  'payment_recorded',
  'match_created',
];

const eventBadgeMap = {
  profile_created: 'badge-success',
  profile_updated: 'badge-info',
  photo_uploaded: 'badge-info',
  extraction_error: 'badge-danger',
  correction_applied: 'badge-warning',
  payment_recorded: 'badge-success',
  match_created: 'badge-accent',
};

export default function ActivityLog() {
  const [eventFilter, setEventFilter] = useState('');
  const { logs, loading } = useActivityLog({ eventType: eventFilter || undefined });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">All system events and changes</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div className="flex-gap" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Filter:</span>
          <select
            className="input select"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 32px 6px 10px', fontSize: '0.8125rem' }}
          >
            <option value="">All Events</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-page" style={{ minHeight: '30vh', marginLeft: 0 }}>
          <div className="spinner" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card empty-state">
          <History size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>No activity yet</h3>
          <p>Events will appear here as you use the system.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Timestamp</th>
                <th style={{ width: '150px' }}>Event Type</th>
                <th style={{ width: '130px' }}>Client</th>
                <th>Details</th>
                <th style={{ width: '200px' }}>Telegram Message</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className={`badge ${eventBadgeMap[log.event_type] || 'badge-neutral'}`}>
                      {log.event_type?.replace(/_/g, ' ') || '—'}
                    </span>
                  </td>
                  <td>
                    {log.client ? (
                      <span style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>
                        {log.client.unique_code}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {log.details || '—'}
                  </td>
                  <td
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={log.telegram_message || ''}
                  >
                    {log.telegram_message || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
