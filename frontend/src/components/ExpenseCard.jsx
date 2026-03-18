import { format } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { MemberAvatar } from './MemberChip'

const CAT_CONFIG = {
  Food:          { icon: '🍽️', color: 'var(--green)',  dim: 'var(--green-dim)' },
  Travel:        { icon: '✈️', color: 'var(--blue)',   dim: 'var(--blue-dim)' },
  Shopping:      { icon: '🛍️', color: 'var(--accent)', dim: 'var(--accent-dim)' },
  Hotel:         { icon: '🏨', color: 'var(--coral)',  dim: 'var(--coral-dim)' },
  Entertainment: { icon: '🎭', color: 'var(--purple)', dim: 'var(--purple-dim)' },
  Health:        { icon: '💊', color: 'var(--red)',    dim: 'var(--red-dim)' },
  Other:         { icon: '📦', color: 'var(--text-2)', dim: 'var(--bg-elevated)' }
}

const SPLIT_LABEL = { equal: 'Equal', manual: 'Custom', percentage: '%split' }

export default function ExpenseCard({ expense, members, onEdit, onDelete }) {
  const cfg = CAT_CONFIG[expense.category] || CAT_CONFIG.Other
  const payer = members?.find(m => m._id === expense.paidBy)
  const splitCount = expense.splits?.length || 0

  return (
    <div className="card group flex items-center gap-3 px-4 py-3.5 transition-all duration-200"
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: cfg.dim }}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{expense.title}</p>
          {expense.splitType && splitCount > 0 && (
            <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-md"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)', fontSize: 10 }}>
              {SPLIT_LABEL[expense.splitType]} · {splitCount}p
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs" style={{ color: cfg.color }}>{expense.category}</span>
          <span style={{ color: 'var(--text-3)', fontSize: 10 }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {format(new Date(expense.date), 'MMM d, yyyy')}
          </span>
          {payer && (
            <>
              <span style={{ color: 'var(--text-3)', fontSize: 10 }}>·</span>
              <div className="flex items-center gap-1">
                <MemberAvatar name={payer.name} size={14} />
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>paid</span>
              </div>
            </>
          )}
          {expense.notes && (
            <>
              <span style={{ color: 'var(--text-3)', fontSize: 10 }}>·</span>
              <span className="text-xs truncate" style={{ color: 'var(--text-3)', maxWidth: 120 }}>{expense.notes}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 text-right mr-1">
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
          ₹{expense.amount.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        onClick={e => e.stopPropagation()}>
        <button className="btn-icon" onClick={() => onEdit?.(expense)}><Pencil size={13} /></button>
        <button className="btn-icon" onClick={() => onDelete?.(expense._id)}
          style={{ color: 'var(--red)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
