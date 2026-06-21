import { useState } from 'react';
import { usePayments } from '../hooks/usePayments';
import { useClients } from '../hooks/useClients';
import { CreditCard, X } from 'lucide-react';

export default function Payments() {
  const { payments, loading, recordPayment } = usePayments();
  const { clients, refetch: refetchClients } = useClients();
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null); // { clientId, clientName }
  const [form, setForm] = useState({ amount: '', paidDate: '', paymentMode: 'Cash', receiptNote: '', newStatus: 'Paid' });
  const [saving, setSaving] = useState(false);

  const filteredClients = clients.filter((c) =>
    filter ? c.payment_status === filter : true
  );

  const handlePay = async () => {
    setSaving(true);
    try {
      await recordPayment({
        clientId: modal.clientId,
        amount: parseFloat(form.amount),
        paidDate: form.paidDate || new Date().toISOString().split('T')[0],
        paymentMode: form.paymentMode,
        receiptNote: form.receiptNote,
        newStatus: form.newStatus,
      });
      refetchClients();
      setModal(null);
      setForm({ amount: '', paidDate: '', paymentMode: 'Cash', receiptNote: '', newStatus: 'Paid' });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const map = { Paid: 'badge-success', 'Not Paid': 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track and manage client payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div className="flex-gap">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Filter:</span>
          {['', 'Not Paid', 'Paid'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Payment Table */}
      {loading ? (
        <div className="loading-page" style={{ minHeight: '30vh', marginLeft: 0 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Bureau</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No clients match this filter
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{client.unique_code}</td>
                    <td>{client.first_name} {client.last_name || ''}</td>
                    <td>{client.source_bureau}</td>
                    <td>{statusBadge(client.payment_status)}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          setModal({
                            clientId: client.id,
                            clientName: `${client.first_name} ${client.last_name || ''}`.trim(),
                            clientCode: client.unique_code,
                            currentStatus: client.payment_status,
                          })
                        }
                      >
                        <CreditCard size={14} />
                        Record Payment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Recent Payments
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 20).map((p) => (
                  <tr key={p.id}>
                    <td>{p.paid_date ? new Date(p.paid_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <span style={{ fontWeight: '600' }}>
                        {p.client ? `${p.client.first_name} ${p.client.last_name || ''}`.trim() : '—'}
                      </span>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.client?.unique_code}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--color-success)' }}>₹{p.amount}</td>
                    <td>{p.payment_mode || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.receipt_note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Record Payment</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Client: <strong>{modal.clientName}</strong> ({modal.clientCode})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label label-required">Amount (₹)</label>
                <input
                  className="input"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  className="input"
                  type="date"
                  value={form.paidDate}
                  onChange={(e) => setForm({ ...form, paidDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Payment Mode</label>
                <select
                  className="input select"
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="label">New Payment Status</label>
                <select
                  className="input select"
                  value={form.newStatus}
                  onChange={(e) => setForm({ ...form, newStatus: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Not Paid">Not Paid</option>
                </select>
              </div>
              <div>
                <label className="label">Receipt Note</label>
                <input
                  className="input"
                  value={form.receiptNote}
                  onChange={(e) => setForm({ ...form, receiptNote: e.target.value })}
                  placeholder="Optional note"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="btn btn-success"
                onClick={handlePay}
                disabled={saving || !form.amount}
              >
                {saving ? (
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  'Save Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
