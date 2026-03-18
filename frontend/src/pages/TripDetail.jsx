import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '../context/AppContext'
import ExpenseCard from '../components/ExpenseCard'
import ExpenseModal from '../components/modals/ExpenseModal'
import SettleModal from '../components/modals/SettleModal'
import Settlements from './Settlements'
import { MemberAvatar, MemberAvatarStack } from '../components/MemberChip'
import { getMemberStats } from '../utils/splitCalculator'

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Hotel', 'Entertainment', 'Health', 'Other']

export default function TripDetail({ onEditTrip }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentTrip, fetchTrip, expenses, fetchExpenses, deleteExpense, expensesLoading, settlements, fetchSettlements } = useApp()

  const [tab, setTab]                 = useState('expenses')
  const [expenseModal, setExpModal]   = useState({ open: false, expense: null })
  const [settleModal, setSettleModal] = useState({ open: false, suggestion: null })
  const [search, setSearch]           = useState('')
  const [catFilter, setCatFilter]     = useState('All')
  const [dateFilter, setDateFilter]   = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTrip(id)
    fetchExpenses(id)
    fetchSettlements(id)
  }, [id])

  const trip    = currentTrip
  const members = trip?.members || []

  const filtered = useMemo(() => {
    let exps = [...expenses]
    if (search) exps = exps.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.notes?.toLowerCase().includes(search.toLowerCase()))
    if (catFilter !== 'All') exps = exps.filter(e => e.category === catFilter)
    if (dateFilter) exps = exps.filter(e => e.date?.slice(0, 10) === dateFilter)
    return exps.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, search, catFilter, dateFilter])

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const budget     = trip?.budget || 0
  const remaining  = budget - totalSpent
  const pct        = budget > 0 ? Math.min(100, (totalSpent / budget) * 100) : 0
  const isOver     = remaining < 0
  const isWarn     = !isOver && pct >= 80

  const progressColor = isOver
    ? 'linear-gradient(90deg,var(--coral),var(--red))'
    : isWarn
    ? 'linear-gradient(90deg,var(--accent),var(--coral))'
    : 'linear-gradient(90deg,var(--green),var(--accent))'

  const handleDelete = async (expId) => {
    if (!confirm('Delete this expense?')) return
    await deleteExpense(id, expId)
  }

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 140, borderRadius: 6 }} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Back */}
      <button onClick={() => navigate('/trips')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
        <ArrowLeft size={14} /> Back to trips
      </button>

      {/* Trip header */}
      <div className="card" style={{ padding: 20, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: progressColor }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>{trip.name}</h1>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => onEditTrip(trip)}>Edit</button>
            </div>
            {trip.description && <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>{trip.description}</p>}
            {(trip.startDate || trip.endDate) && (
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {trip.startDate && format(new Date(trip.startDate), 'MMM d, yyyy')}
                {trip.startDate && trip.endDate && ' → '}
                {trip.endDate && format(new Date(trip.endDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>
          {members.length > 0 && <MemberAvatarStack members={members} max={6} size={30} />}
        </div>

        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-2)' }}>
              Spent: <strong style={{ color: 'var(--text)' }}>₹{totalSpent.toLocaleString('en-IN')}</strong>
              <span style={{ color: 'var(--text-3)' }}> of ₹{budget.toLocaleString('en-IN')}</span>
            </span>
            <span style={{ color: isOver ? 'var(--red)' : isWarn ? 'var(--accent)' : 'var(--green)', fontWeight: 600 }}>
              {isOver ? `Over by ₹${Math.abs(remaining).toLocaleString('en-IN')}` : `₹${remaining.toLocaleString('en-IN')} left`}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%`, background: progressColor }} />
          </div>
        </div>

        {(isOver || isWarn) && (
          <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: isOver ? 'var(--red-dim)' : 'var(--accent-dim)', color: isOver ? 'var(--red)' : 'var(--accent)' }}>
            {isOver ? '⚠ Budget exceeded! Consider reviewing your spending.' : `⚡ Only ${Math.round(100 - pct)}% of budget remains.`}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[
          { id: 'expenses',    label: `Expenses (${expenses.length})` },
          { id: 'members',     label: `Members (${members.length})` },
          { id: 'settlements', label: 'Settlements' }
        ].map(t => (
          <button key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EXPENSES ──────────────────────── */}
      {tab === 'expenses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input className="input-base" style={{ paddingLeft: 32, fontSize: 13 }} placeholder="Search expenses..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: showFilters ? 'var(--accent)' : undefined }}
              onClick={() => setShowFilters(f => !f)}>
              <Filter size={13} /> Filters
            </button>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
              onClick={() => setExpModal({ open: true, expense: null })}>
              <Plus size={13} /> Add
            </button>
          </div>

          {showFilters && (
            <div className="card" style={{ padding: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${catFilter === cat ? 'var(--accent)' : 'var(--border)'}`, background: catFilter === cat ? 'var(--accent-dim)' : 'var(--bg-elevated)', color: catFilter === cat ? 'var(--accent)' : 'var(--text-3)', transition: 'all .15s' }}
                    onClick={() => setCatFilter(cat)}>{cat}
                  </button>
                ))}
              </div>
              <input className="input-base" type="date" style={{ width: 160, fontSize: 13 }}
                value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
              {(catFilter !== 'All' || dateFilter) && (
                <button style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, color: 'var(--text-3)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
                  onClick={() => { setCatFilter('All'); setDateFilter('') }}>Clear</button>
              )}
            </div>
          )}

          {expensesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => (
                <div key={i} className="card" style={{ padding: 16, display: 'flex', gap: 12 }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 14, width: '50%' }} />
                    <div className="skeleton" style={{ height: 11, width: '35%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💸</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No expenses</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
                {search || catFilter !== 'All' || dateFilter ? 'No expenses match your filters' : 'Add your first expense to this trip'}
              </p>
              {!search && catFilter === 'All' && !dateFilter && (
                <button className="btn-primary" onClick={() => setExpModal({ open: true, expense: null })}>+ Add Expense</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(exp => (
                <ExpenseCard key={exp._id} expense={exp} members={members}
                  onEdit={expense => setExpModal({ open: true, expense })}
                  onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS ──────────────────────── */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.length === 0 ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No members</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>Edit the trip to add members</p>
              <button className="btn-secondary" onClick={() => onEditTrip(trip)}>Edit Trip</button>
            </div>
          ) : (
            <>
              {members.map(member => {
                const stats = getMemberStats(member._id, expenses, settlements)
                return (
                  <div key={member._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                    <MemberAvatar name={member.name} size={42} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{member.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        Paid ₹{stats.paid.toLocaleString('en-IN')} · Share ₹{stats.share.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: stats.net >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {stats.net >= 0 ? '+' : ''}₹{stats.net.toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{stats.net >= 0 ? 'is owed' : 'owes'}</p>
                    </div>
                  </div>
                )
              })}
              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', paddingTop: 4 }}>
                + = owed money · − = owes money · Go to Settlements tab to resolve
              </p>
            </>
          )}
        </div>
      )}

      {/* ── SETTLEMENTS ──────────────────── */}
      {tab === 'settlements' && (
        <Settlements
          trip={trip} members={members}
          expenses={expenses} settlements={settlements}
          tripId={id}
          onSettle={(suggestion) => setSettleModal({ open: true, suggestion })}
        />
      )}

      {/* Modals */}
      <ExpenseModal
        open={expenseModal.open} expense={expenseModal.expense}
        tripId={id} members={members}
        onClose={() => setExpModal({ open: false, expense: null })}
      />
      <SettleModal
        open={settleModal.open} tripId={id}
        members={members} suggestion={settleModal.suggestion}
        onClose={() => setSettleModal({ open: false, suggestion: null })}
      />
    </div>
  )
}
