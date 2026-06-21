import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients, exportClientsCSV } from '../hooks/useClients';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, Plus, Download, ChevronUp, ChevronDown, Filter, Users } from 'lucide-react';

const statusBadge = (value) => {
  const map = {
    Paid: 'badge-success',
    'Not Paid': 'badge-danger',
    Active: 'badge-success',
    Inactive: 'badge-neutral',
    Married: 'badge-info',
    Unmatched: 'badge-neutral',
    'Profiles Sent': 'badge-info',
    'Meeting Scheduled': 'badge-warning',
  };
  return <span className={`badge ${map[value] || 'badge-neutral'}`}>{value || '—'}</span>;
};

export default function Clients() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [matchFilter, setMatchFilter] = useState('');
  const [bureauFilter, setBureauFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { clients, loading } = useClients({
    gender: genderFilter || undefined,
    payment_status: paymentFilter || undefined,
    profile_status: profileFilter || undefined,
    match_status: matchFilter || undefined,
    bureau_type: bureauFilter || undefined,
    search: search || undefined,
  });

  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'photo_url',
        header: '',
        size: 50,
        enableSorting: false,
        cell: ({ row }) => (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-light)',
              flexShrink: 0,
            }}
          >
            {row.original.photo_url ? (
              <img
                src={row.original.photo_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                }}
              >
                {row.original.first_name?.[0] || '?'}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'unique_code',
        header: 'Code',
        size: 140,
        cell: ({ getValue }) => (
          <span style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.8125rem' }}>
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (row) => `${row.first_name} ${row.last_name || ''}`.trim(),
        id: 'name',
        header: 'Name',
        size: 180,
        cell: ({ getValue }) => (
          <span style={{ fontWeight: '600' }}>{getValue()}</span>
        ),
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        size: 90,
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return <span className="badge badge-danger">⚠ Unset</span>;
          return <span style={{ fontSize: '0.8125rem' }}>{val}</span>;
        },
      },
      {
        accessorKey: 'dob',
        header: 'DOB',
        size: 110,
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return '—';
          return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        },
      },
      {
        accessorKey: 'education',
        header: 'Education',
        size: 160,
        cell: ({ getValue }) => (
          <span style={{ fontSize: '0.8125rem' }}>{getValue() || '—'}</span>
        ),
      },
      {
        accessorFn: (row) => row.place_of_birth || (row.address ? row.address.split(',')[0]?.trim() : ''),
        id: 'location',
        header: 'Location',
        size: 140,
        cell: ({ getValue }) => (
          <span style={{ fontSize: '0.8125rem' }}>{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'source_bureau',
        header: 'Bureau',
        size: 100,
        cell: ({ getValue }) => (
          <span style={{ fontSize: '0.8125rem' }}>{getValue()}</span>
        ),
      },
      {
        accessorKey: 'payment_status',
        header: 'Payment',
        size: 110,
        cell: ({ getValue }) => statusBadge(getValue()),
      },
      {
        accessorKey: 'profile_status',
        header: 'Status',
        size: 100,
        cell: ({ getValue }) => statusBadge(getValue()),
      },
      {
        accessorKey: 'match_status',
        header: 'Match',
        size: 140,
        cell: ({ getValue }) => statusBadge(getValue()),
      },
      {
        accessorKey: 'created_at',
        header: 'Added',
        size: 100,
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return '—';
          return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} total profiles</p>
        </div>
        <div className="flex-gap">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportClientsCSV(clients)}
            disabled={clients.length === 0}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/clients/new')}
          >
            <Plus size={16} />
            Add Client
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div
        className="card"
        style={{ padding: '16px 20px', marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              className="input"
              placeholder="Search by name, code, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px solid var(--border-light)',
              flexWrap: 'wrap',
            }}
          >
            <FilterSelect label="Gender" value={genderFilter} onChange={setGenderFilter} options={['Male', 'Female']} />
            <FilterSelect label="Payment" value={paymentFilter} onChange={setPaymentFilter} options={['Paid', 'Not Paid']} />
            <FilterSelect label="Profile" value={profileFilter} onChange={setProfileFilter} options={['Active', 'Inactive', 'Married']} />
            <FilterSelect label="Match" value={matchFilter} onChange={setMatchFilter} options={['Unmatched', 'Profiles Sent', 'Meeting Scheduled', 'Married']} />
            <FilterSelect label="Bureau" value={bureauFilter} onChange={setBureauFilter} options={['own', 'partner']} />
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setGenderFilter('');
                setPaymentFilter('');
                setProfileFilter('');
                setMatchFilter('');
                setBureauFilter('');
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-page" style={{ minHeight: '30vh', marginLeft: 0 }}>
          <div className="spinner" />
          <span>Loading clients...</span>
        </div>
      ) : clients.length === 0 ? (
        <div className="card empty-state">
          <Users size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>No clients found</h3>
          <p>Add your first client or adjust your filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp size={14} />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown size={14} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="clickable"
                  onClick={() => navigate(`/clients/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              {' · '}{clients.length} records
            </span>
            <div className="pagination-buttons">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <select
        className="input select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '6px 32px 6px 10px',
          fontSize: '0.8125rem',
          minWidth: '130px',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

