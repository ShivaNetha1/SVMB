import { useState } from 'react';
import { useMatches } from '../hooks/useMatches';
import { useClients } from '../hooks/useClients';
import MatchCard from '../components/MatchCard';
import { Heart, Search, Plus } from 'lucide-react';

export default function Matches() {
  const { matches, loading, createMatch, updateMatch, deleteMatch } = useMatches();
  const { clients } = useClients();
  const [maleSearch, setMaleSearch] = useState('');
  const [femaleSearch, setFemaleSearch] = useState('');
  const [selectedMale, setSelectedMale] = useState(null);
  const [selectedFemale, setSelectedFemale] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const maleClients = clients.filter(
    (c) =>
      c.gender === 'Male' &&
      (maleSearch
        ? `${c.first_name} ${c.last_name || ''} ${c.unique_code}`.toLowerCase().includes(maleSearch.toLowerCase())
        : true)
  );

  const femaleClients = clients.filter(
    (c) =>
      c.gender === 'Female' &&
      (femaleSearch
        ? `${c.first_name} ${c.last_name || ''} ${c.unique_code}`.toLowerCase().includes(femaleSearch.toLowerCase())
        : true)
  );

  const handleCreate = async () => {
    if (!selectedMale || !selectedFemale) {
      setError('Please select both a male and female client.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await createMatch(selectedMale.id, selectedFemale.id);
      setSelectedMale(null);
      setSelectedFemale(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const ClientSelector = ({ title, search, setSearch, clients, selected, setSelected }) => (
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
        {title}
      </h3>
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '32px', fontSize: '0.8125rem' }}
        />
      </div>
      <div
        style={{
          maxHeight: '240px',
          overflowY: 'auto',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {clients.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            No clients found
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              onClick={() => setSelected(client)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-light)',
                background: selected?.id === client.id ? 'var(--color-accent-lighter)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== client.id) e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== client.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-light)',
                  flexShrink: 0,
                }}
              >
                {client.photo_url ? (
                  <img src={client.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '600' }}>
                    {client.first_name?.[0]}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.first_name} {client.last_name || ''}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {client.unique_code} · {client.education}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Match Management</h1>
          <p className="page-subtitle">Create and manage matches between clients</p>
        </div>
      </div>

      {/* Create Match */}
      <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
          Create New Match
        </h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
          <ClientSelector
            title="👤 Select Groom (Male)"
            search={maleSearch}
            setSearch={setMaleSearch}
            clients={maleClients}
            selected={selectedMale}
            setSelected={setSelectedMale}
          />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            <Heart size={24} style={{ color: 'var(--color-accent)' }} />
          </div>
          <ClientSelector
            title="👤 Select Bride (Female)"
            search={femaleSearch}
            setSearch={setFemaleSearch}
            clients={femaleClients}
            selected={selectedFemale}
            setSelected={setSelectedFemale}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.8125rem',
              marginBottom: '12px',
              border: '1px solid var(--color-danger-border)',
            }}
          >
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={creating || !selectedMale || !selectedFemale}
        >
          {creating ? (
            <div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <>
              <Plus size={16} />
              Create Match
            </>
          )}
        </button>
      </div>

      {/* Existing Matches */}
      <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
        Existing Matches ({matches.length})
      </h3>

      {loading ? (
        <div className="loading-page" style={{ minHeight: '20vh', marginLeft: 0 }}>
          <div className="spinner" />
        </div>
      ) : matches.length === 0 ? (
        <div className="card empty-state">
          <Heart size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>No matches yet</h3>
          <p>Select a male and female client above to create the first match.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onUpdate={updateMatch}
              onDelete={deleteMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
