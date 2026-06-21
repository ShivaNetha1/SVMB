import { useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';

export default function InlineEditField({
  value,
  field,
  type = 'text',
  options = [],
  onSave,
  displayValue,
  placeholder,
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(field, editValue || null);
      setEditing(false);
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (!editing) {
    return (
      <div
        onClick={() => {
          setEditValue(value || '');
          setEditing(true);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          transition: 'background 0.15s',
          minHeight: '32px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {displayValue || value || placeholder || 'Click to edit'}
        </span>
        <Pencil size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {type === 'select' ? (
        <select
          className="input select"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          autoFocus
          style={{ width: 'auto', minWidth: '140px' }}
        >
          <option value="">— Select —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          className="input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={3}
          style={{ minWidth: '250px' }}
        />
      ) : (
        <input
          className="input"
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{ width: 'auto', minWidth: '180px' }}
          placeholder={placeholder}
        />
      )}
      <button
        className="btn btn-icon btn-success btn-sm"
        onClick={handleSave}
        disabled={saving}
        title="Save"
      >
        {saving ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Check size={14} />}
      </button>
      <button
        className="btn btn-icon btn-secondary btn-sm"
        onClick={handleCancel}
        disabled={saving}
        title="Cancel"
      >
        <X size={14} />
      </button>
    </div>
  );
}
