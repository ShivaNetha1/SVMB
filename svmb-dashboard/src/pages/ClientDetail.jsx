import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient, updateClientField } from '../hooks/useClients';
import { useActivityLog } from '../hooks/useActivityLog';
import { usePayments } from '../hooks/usePayments';
import InlineEditField from '../components/InlineEditField';
import PhotoUpload from '../components/PhotoUpload';
import { ArrowLeft, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { client, loading, error, refetch } = useClient(id);
  const { logs } = useActivityLog({ clientId: id });
  const { payments } = usePayments();
  const [lastSaved, setLastSaved] = useState(null);

  const clientPayments = payments.filter((p) => p.client_id === id);

  const handleSave = async (field, value) => {
    await updateClientField(id, field, value);

    // Log the update
    await supabase.from('activity_log').insert({
      event_type: 'profile_updated',
      client_id: id,
      details: `Updated ${field} to: ${value}`,
    });

    setLastSaved(new Date().toLocaleTimeString());
    refetch();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this profile? This cannot be undone.')) return;
    await supabase.from('clients').delete().eq('id', id);
    navigate('/clients');
  };

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '50vh', marginLeft: 0 }}>
        <div className="spinner" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="empty-state">
        <h3>Client not found</h3>
        <button className="btn btn-secondary" onClick={() => navigate('/clients')}>
          Back to Clients
        </button>
      </div>
    );
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '28px' }}>
      <h3
        style={{
          fontSize: '0.8125rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, field, value, type, options, displayValue }) => (
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>
        {label}
      </div>
      <InlineEditField
        value={value}
        field={field}
        type={type}
        options={options}
        onSave={handleSave}
        displayValue={displayValue}
      />
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex-gap">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/clients')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
              {client.first_name} {client.last_name || ''}
            </h1>
            <p className="page-subtitle">
              {client.unique_code}
              {lastSaved && (
                <span style={{ marginLeft: '12px', color: 'var(--color-success)', fontSize: '0.75rem' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Saved at {lastSaved}
                </span>
              )}
            </p>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }}>
        {/* Left — Photo + Status Cards */}
        <div>
          <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
            <PhotoUpload
              currentUrl={client.photo_url}
              clientId={client.id}
              onUpdate={() => refetch()}
              size="lg"
            />
            <div style={{ marginTop: '16px', fontWeight: '700', fontSize: '1.1rem' }}>
              {client.first_name} {client.last_name || ''}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {client.unique_code}
            </div>
            {!client.gender && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  color: 'var(--color-danger)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                ⚠ Gender not set — ID pending
              </div>
            )}
          </div>

          {/* Status Cards */}
          <div className="card" style={{ padding: '16px' }}>
            <Field
              label="Payment Status"
              field="payment_status"
              value={client.payment_status}
              type="select"
              options={['Not Paid', 'Paid']}
            />
            <div style={{ marginTop: '12px' }}>
              <Field
                label="Profile Status"
                field="profile_status"
                value={client.profile_status}
                type="select"
                options={['Active', 'Inactive', 'Married']}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              <Field
                label="Match Status"
                field="match_status"
                value={client.match_status}
                type="select"
                options={['Unmatched', 'Profiles Sent', 'Meeting Scheduled', 'Married']}
              />
            </div>
          </div>
        </div>

        {/* Right — All Details */}
        <div className="card" style={{ padding: '28px' }}>
          <Section title="Personal Details">
            <Field label="First Name" field="first_name" value={client.first_name} />
            <Field label="Last Name" field="last_name" value={client.last_name} />
            <Field
              label="Gender"
              field="gender"
              value={client.gender}
              type="select"
              options={['Male', 'Female']}
            />
            <Field label="Date of Birth" field="dob" value={client.dob} type="date" />
            <Field label="Birth Time" field="birth_time" value={client.birth_time} />
            <Field label="Place of Birth" field="place_of_birth" value={client.place_of_birth} />
            <Field label="Rashi" field="rashi" value={client.rashi} />
            <Field label="Height" field="height" value={client.height} />
            <Field label="Education" field="education" value={client.education} />
            <Field label="Religion" field="religion" value={client.religion} />
            <Field label="Caste" field="caste" value={client.caste} />
          </Section>

          <Section title="Contact Details">
            <Field label="Phone" field="phone" value={client.phone} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Address" field="address" value={client.address} type="textarea" />
            </div>
          </Section>

          <Section title="Family Details">
            <Field label="Father's Name" field="father_name" value={client.father_name} />
            <Field label="Father's Occupation" field="father_occupation" value={client.father_occupation} />
            <Field label="Mother's Name" field="mother_name" value={client.mother_name} />
            <Field label="Mother's Occupation" field="mother_occupation" value={client.mother_occupation} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Siblings" field="siblings" value={client.siblings} type="textarea" />
            </div>
          </Section>

          <Section title="Bureau Details">
            <Field
              label="Bureau Type"
              field="bureau_type"
              value={client.bureau_type}
              type="select"
              options={['own', 'partner']}
            />
            <Field label="Source Bureau" field="source_bureau" value={client.source_bureau} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Notes" field="notes" value={client.notes} type="textarea" />
            </div>
          </Section>
        </div>
      </div>

      {/* Payment History */}
      {clientPayments.length > 0 && (
        <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text-primary)',
            }}
          >
            Payment History
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {clientPayments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.paid_date ? new Date(p.paid_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ fontWeight: '600' }}>₹{p.amount}</td>
                    <td>{p.payment_mode || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.receipt_note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-primary)',
          }}
        >
          Activity Log
        </h3>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity recorded yet.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.8125rem',
                }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    minWidth: '140px',
                  }}
                >
                  {new Date(log.created_at).toLocaleString('en-IN')}
                </span>
                <span className={`badge ${getEventBadge(log.event_type)}`} style={{ flexShrink: 0 }}>
                  {log.event_type}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.details}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getEventBadge(type) {
  switch (type) {
    case 'profile_created': return 'badge-success';
    case 'profile_updated': return 'badge-info';
    case 'photo_uploaded': return 'badge-info';
    case 'correction_applied': return 'badge-warning';
    case 'extraction_error': return 'badge-danger';
    case 'payment_recorded': return 'badge-success';
    default: return 'badge-neutral';
  }
}
