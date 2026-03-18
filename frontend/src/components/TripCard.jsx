import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import { MemberAvatarStack } from './MemberChip'
import { useApp } from '../context/AppContext'

export default function TripCard({ trip, onEdit }) {
  const navigate = useNavigate()
  const { deleteTrip } = useApp()

  const spent = trip.totalSpent || 0
  const budget = trip.budget || 0
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const remaining = budget - spent
  const isOver = remaining < 0
  const isWarn = !isOver && pct >= 80

  const progressColor = isOver
    ? 'linear-gradient(90deg,var(--coral),var(--red))'
    : isWarn
    ? 'linear-gradient(90deg,var(--accent),var(--coral))'
    : 'linear-gradient(90deg,var(--green),var(--accent))'

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${trip.name}" and all its data?`)) return
    await deleteTrip(trip._id)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(trip)
  }

  return (
    <div
      className="card group cursor-pointer p-5 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
      onClick={() => navigate(`/trips/${trip._id}`)}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
        style={{ background: progressColor }} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text)' }} className="truncate">
            {trip.name}
          </h3>
          {trip.description && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>{trip.description}</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button className="btn-icon" onClick={handleEdit} title="Edit"><Pencil size={13} /></button>
          <button className="btn-icon" onClick={handleDelete} title="Delete"
            style={{ color: 'var(--red)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {(trip.startDate || trip.endDate) && (
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={11} style={{ color: 'var(--text-3)' }} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            {trip.startDate && format(new Date(trip.startDate), 'MMM d')}
            {trip.startDate && trip.endDate && ' → '}
            {trip.endDate && format(new Date(trip.endDate), 'MMM d, yyyy')}
          </span>
        </div>
      )}

      <div className="progress-track mb-2">
        <div className="progress-fill" style={{ width: `${pct}%`, background: progressColor }} />
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <span style={{ color: 'var(--text-2)' }}>
          Spent: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>₹{spent.toLocaleString('en-IN')}</strong>
        </span>
        <span style={{ color: isOver ? 'var(--red)' : isWarn ? 'var(--accent)' : 'var(--text-3)', fontWeight: isOver || isWarn ? 600 : 400 }}>
          {isOver ? `Over ₹${Math.abs(remaining).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')} left`}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {trip.members?.length > 0
          ? <MemberAvatarStack members={trip.members} max={5} size={26} />
          : <div className="flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
              <Users size={12} /><span className="text-xs">No members</span>
            </div>
        }
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)' }}>
          {trip.expenseCount || 0} expense{trip.expenseCount !== 1 ? 's' : ''}
        </span>
      </div>

      {(isOver || isWarn) && (
        <div className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
          style={{ background: isOver ? 'var(--red-dim)' : 'var(--accent-dim)', color: isOver ? 'var(--red)' : 'var(--accent)' }}>
          {isOver ? '⚠ Budget exceeded' : `⚡ ${Math.round(100 - pct)}% budget remaining`}
        </div>
      )}
    </div>
  )
}
