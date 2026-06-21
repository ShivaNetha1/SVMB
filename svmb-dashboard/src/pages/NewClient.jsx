import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../hooks/useClients';
import PhotoUpload from '../components/PhotoUpload';
import { ArrowLeft, Save } from 'lucide-react';

const initialForm = {
  first_name: '',
  last_name: '',
  gender: '',
  dob: '',
  birth_time: '',
  place_of_birth: '',
  rashi: '',
  height: '',
  education: '',
  religion: '',
  caste: '',
  address: '',
  phone: '',
  father_name: '',
  father_occupation: '',
  mother_name: '',
  mother_occupation: '',
  siblings: '',
  bureau_type: 'own',
  source_bureau: 'SVMB',
  notes: '',
};

export default function NewClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!form.first_name || !form.dob || !form.height || !form.education || !form.address) {
      setError('Please fill in all required fields (Name, DOB, Height, Education, Address).');
      return;
    }

    setSaving(true);
    try {
      const data = await createClient({
        ...form,
        gender: form.gender || null,
        photo_url: photoUrl,
        source_bureau: form.bureau_type === 'partner' ? form.source_bureau : 'SVMB',
      });
      navigate(`/clients/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, field, required, type = 'text', placeholder }) => (
    <div>
      <label className={`label ${required ? 'label-required' : ''}`}>{label}</label>
      <input
        className="input"
        type={type}
        value={form[field]}
        onChange={set(field)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex-gap">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/clients')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Add New Client</h1>
            <p className="page-subtitle">Fill in the client's biodata details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }}>
          {/* Left — Photo + Bureau */}
          <div>
            <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
              <PhotoUpload
                currentUrl={photoUrl}
                onUpdate={setPhotoUrl}
                size="lg"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Click to upload photo (optional)
              </p>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Bureau Type</label>
                <select
                  className="input select"
                  value={form.bureau_type}
                  onChange={(e) => {
                    const bt = e.target.value;
                    setForm({
                      ...form,
                      bureau_type: bt,
                      source_bureau: bt === 'own' ? 'SVMB' : form.source_bureau,
                    });
                  }}
                >
                  <option value="own">Own (SVMB)</option>
                  <option value="partner">Partner Bureau</option>
                </select>
              </div>

              {form.bureau_type === 'partner' && (
                <div>
                  <label className="label label-required">Partner MB Code</label>
                  <input
                    className="input"
                    value={form.source_bureau}
                    onChange={set('source_bureau')}
                    placeholder="e.g. XX23MB"
                    required
                  />
                </div>
              )}

              <div style={{ marginTop: '16px' }}>
                <label className="label">Gender</label>
                <select className="input select" value={form.gender} onChange={set('gender')}>
                  <option value="">— Select —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {!form.gender && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-warning)', marginTop: '4px' }}>
                    ID will be generated as PENDING until gender is set
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right — All Fields */}
          <div className="card" style={{ padding: '28px' }}>
            {/* Personal Details */}
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
              Personal Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <InputField label="First Name" field="first_name" required placeholder="e.g. M" />
              <InputField label="Last Name" field="last_name" placeholder="e.g. Aishwarya" />
              <InputField label="Date of Birth" field="dob" type="date" required />
              <InputField label="Birth Time" field="birth_time" placeholder="e.g. 1:13am" />
              <InputField label="Place of Birth" field="place_of_birth" placeholder="e.g. Hyderabad" />
              <InputField label="Rashi" field="rashi" placeholder="e.g. Aries" />
              <InputField label="Height" field="height" required placeholder="e.g. 5.1 or 5'4&quot;" />
              <InputField label="Education" field="education" required placeholder="e.g. M Pharmacy, MBA" />
              <InputField label="Religion" field="religion" placeholder="e.g. Hindu" />
              <InputField label="Caste" field="caste" placeholder="e.g. BC-b/Padmashali" />
            </div>

            {/* Contact */}
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
              Contact Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <InputField label="Phone" field="phone" placeholder="e.g. 9876543210" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label label-required">Address</label>
                <textarea
                  className="input"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Full address"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Family */}
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
              Family Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <InputField label="Father's Name" field="father_name" />
              <InputField label="Father's Occupation" field="father_occupation" />
              <InputField label="Mother's Name" field="mother_name" />
              <InputField label="Mother's Occupation" field="mother_occupation" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Siblings</label>
                <textarea
                  className="input"
                  value={form.siblings}
                  onChange={set('siblings')}
                  placeholder="e.g. Brother: M. Abhinav (student)"
                  rows={2}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '24px' }}>
              <label className="label">Notes</label>
              <textarea
                className="input"
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: '0.8125rem',
                  marginBottom: '20px',
                  border: '1px solid var(--color-danger-border)',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving}
              style={{ padding: '12px 32px', fontSize: '0.9375rem' }}
            >
              {saving ? (
                <div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                <>
                  <Save size={18} />
                  Save Client
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
