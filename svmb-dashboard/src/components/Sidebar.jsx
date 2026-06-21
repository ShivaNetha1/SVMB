import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Heart,
  CreditCard,
  History,
  LogOut,
  UserPlus,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/clients/new', label: 'Add Client', icon: UserPlus },
  { path: '/matches', label: 'Matches', icon: Heart },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/log', label: 'Activity Log', icon: History },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            S
          </div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div
              style={{
                fontWeight: '800',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              SVMB
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: '500',
              }}
            >
              Marriage Bureau
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive =
              path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(path) &&
                  !(path === '/clients' && location.pathname === '/clients/new');

            return (
              <NavLink
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--color-accent-dark)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--color-accent-lighter)' : 'transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-light)' }}>
        <button
          onClick={signOut}
          className="btn btn-ghost"
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            gap: '12px',
            color: 'var(--color-danger)',
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
