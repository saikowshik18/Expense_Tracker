const AVATAR_COLORS = [
  { bg: '#1a2a4a', text: '#5b9cf6' },
  { bg: '#2a1a1a', text: '#e8855a' },
  { bg: '#1a2a1e', text: '#4ecb8d' },
  { bg: '#2a1f0a', text: '#f5a623' },
  { bg: '#261a2a', text: '#a579f6' },
  { bg: '#2a1a22', text: '#e25c7a' },
  { bg: '#1a2626', text: '#5bc8cb' },
  { bg: '#2a2318', text: '#d4a853' }
]

export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function MemberAvatar({ name, size = 32, className = '' }) {
  const colors = getAvatarColor(name)
  return (
    <div
      className={`member-avatar ${className}`}
      style={{
        width: size, height: size,
        fontSize: size < 28 ? 9 : size < 36 ? 11 : 13,
        background: colors.bg,
        color: colors.text,
        border: `1.5px solid ${colors.text}30`,
        fontWeight: 700,
        fontFamily: 'Syne, sans-serif',
        flexShrink: 0
      }}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}

export function MemberAvatarStack({ members, max = 4, size = 28 }) {
  const shown = members.slice(0, max)
  const rest = members.length - max
  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div key={m._id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }}>
          <MemberAvatar name={m.name} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div
          className="member-avatar"
          style={{
            width: size, height: size, fontSize: 10,
            background: 'var(--bg-hover)', color: 'var(--text-2)',
            border: '1.5px solid var(--border-strong)',
            marginLeft: -8, fontWeight: 600
          }}
        >
          +{rest}
        </div>
      )}
    </div>
  )
}

export function MemberChip({ name, onRemove }) {
  const colors = getAvatarColor(name)
  return (
    <div className="flex items-center gap-1.5 rounded-full px-2 py-1"
      style={{ background: colors.bg, border: `1px solid ${colors.text}25` }}>
      <MemberAvatar name={name} size={18} />
      <span style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ width: 15, height: 15, color: colors.text, opacity: 0.6, fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
        >×</button>
      )}
    </div>
  )
}

export function MemberSelectRow({ member, selected, onToggle, showAmount, amount, onAmountChange, pct, onPctChange, splitType }) {
  const colors = getAvatarColor(member.name)
  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
      style={{
        background: selected ? colors.bg : 'transparent',
        border: `1px solid ${selected ? colors.text + '30' : 'var(--border)'}`
      }}
      onClick={() => onToggle(member._id)}
    >
      <div
        className="flex items-center justify-center rounded-md transition-all duration-150"
        style={{
          width: 18, height: 18, flexShrink: 0,
          background: selected ? colors.text : 'transparent',
          border: `1.5px solid ${selected ? colors.text : 'var(--text-3)'}`,
          borderRadius: 5
        }}
      >
        {selected && <span style={{ color: '#000', fontSize: 11, lineHeight: 1 }}>✓</span>}
      </div>
      <MemberAvatar name={member.name} size={28} />
      <span className="text-sm font-medium flex-1 truncate" style={{ color: selected ? 'var(--text)' : 'var(--text-2)' }}>
        {member.name}
      </span>

      {selected && showAmount && splitType === 'manual' && (
        <input
          type="number"
          className="input-base text-right"
          style={{ width: 90, padding: '4px 10px', fontSize: 13 }}
          placeholder="0"
          value={amount || ''}
          onChange={e => { e.stopPropagation(); onAmountChange(member._id, e.target.value) }}
          onClick={e => e.stopPropagation()}
        />
      )}
      {selected && showAmount && splitType === 'percentage' && (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            className="input-base text-right"
            style={{ width: 65, padding: '4px 8px', fontSize: 13 }}
            placeholder="0"
            value={pct || ''}
            onChange={e => onPctChange(member._id, e.target.value)}
          />
          <span style={{ color: 'var(--text-3)', fontSize: 12 }}>%</span>
        </div>
      )}
    </div>
  )
}
