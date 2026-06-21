export default function MetricCard({ icon: Icon, label, value, color, variant, subtitle }) {
  const colorMap = {
    success: { border: 'var(--color-success)', bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
    danger: { border: 'var(--color-danger)', bg: 'var(--color-danger-bg)', text: 'var(--color-danger)' },
    warning: { border: 'var(--color-warning)', bg: 'var(--color-warning-bg)', text: 'var(--color-warning)' },
    info: { border: 'var(--color-info)', bg: 'var(--color-info-bg)', text: 'var(--color-info)' },
    primary: { border: 'var(--color-primary)', bg: '#eef2ff', text: 'var(--color-primary)' },
    accent: { border: 'var(--color-accent)', bg: 'var(--color-accent-lighter)', text: 'var(--color-accent-dark)' },
    neutral: { border: 'var(--border-medium)', bg: 'var(--bg-input)', text: 'var(--text-secondary)' },
  };

  const colors = colorMap[variant || color] || colorMap.neutral;

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '20px',
        borderLeft: `4px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          background: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text,
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            fontWeight: '500',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: '800',
            color: colors.text,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
