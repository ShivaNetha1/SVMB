export default function MatchCard({ match, onUpdate, onDelete }) {
  const { male_client, female_client } = match;

  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case 'Success': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  const getResponseBadge = (response) => {
    switch (response) {
      case 'Interested': return 'badge-success';
      case 'Not Interested': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  const ClientMini = ({ client, label }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          margin: '0 auto 8px',
          background: 'var(--bg-input)',
          border: '2px solid var(--border-light)',
        }}
      >
        {client?.photo_url ? (
          <img src={client.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
            {client?.first_name?.[0] || '?'}
          </div>
        )}
      </div>
      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
        {client ? `${client.first_name} ${client.last_name || ''}`.trim() : 'Deleted'}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {client?.unique_code || '—'}
      </div>
    </div>
  );

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        <ClientMini client={male_client} label="Groom" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 8px', gap: '8px' }}>
          <div style={{ fontSize: '1.2rem' }}>💑</div>
          <span className={`badge ${getOutcomeBadge(match.outcome)}`}>{match.outcome}</span>
        </div>

        <ClientMini client={female_client} label="Bride" />
      </div>

      {/* Responses */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>His Response</div>
          <select
            className="input select"
            value={match.male_response || 'Pending'}
            onChange={(e) => onUpdate(match.id, { male_response: e.target.value })}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="Pending">Pending</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Her Response</div>
          <select
            className="input select"
            value={match.female_response || 'Pending'}
            onChange={(e) => onUpdate(match.id, { female_response: e.target.value })}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="Pending">Pending</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Outcome</div>
          <select
            className="input select"
            value={match.outcome || 'Pending'}
            onChange={(e) => onUpdate(match.id, { outcome: e.target.value })}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Meeting Date + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meeting:</span>
          <input
            type="date"
            className="input"
            value={match.meeting_date || ''}
            onChange={(e) => onUpdate(match.id, { meeting_date: e.target.value || null })}
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8125rem' }}
          />
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}
          onClick={() => {
            if (confirm('Delete this match?')) onDelete(match.id);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
