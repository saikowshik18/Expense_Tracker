import { useMemo } from 'react'
import { format } from 'date-fns'
import { ArrowRight, CheckCircle2, Trash2, Plus } from 'lucide-react'
import { MemberAvatar } from '../components/MemberChip'
import { calculateNetBalances, simplifyDebts } from '../utils/splitCalculator'
import { useApp } from '../context/AppContext'

export default function Settlements({ trip, members, expenses, settlements, tripId, onSettle }) {
  const { deleteSettlement } = useApp()

  const netBalances    = useMemo(() => calculateNetBalances(expenses, settlements, members), [expenses, settlements, members])
  const simplifiedDebts = useMemo(() => simplifyDebts(netBalances), [netBalances])

  const getMember = (id) => members.find(m => m._id === id)
  const isAllSettled = simplifiedDebts.length === 0

  const handleDelete = async (sId) => {
    if (!confirm('Remove this settlement? Balances will be recalculated.')) return
    await deleteSettlement(tripId, sId)
  }

  if (members.length < 2) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Need at least 2 members</p>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Add members to the trip to track settlements</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Outstanding balances */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Outstanding Balances</h3>
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => onSettle(null)}>
            <Plus size={13} /> Record Payment
          </button>
        </div>

        {isAllSettled ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <CheckCircle2 size={22} style={{ color: 'var(--green)' }} />
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>All Settled Up!</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {expenses.length === 0 ? 'No expenses yet to settle' : 'Everyone is even — no outstanding balances'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {simplifiedDebts.map((debt, i) => {
              const fromM = getMember(debt.from)
              const toM   = getMember(debt.to)
              if (!fromM || !toM) return null
              return (
                <div key={i} className="card group"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', transition: 'transform .2s' }}
                  onClick={() => onSettle(debt)}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 56 }}>
                    <MemberAvatar name={fromM.name} size={36} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>{fromM.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>pays</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--red)', opacity: 0.4 }} />
                      <ArrowRight size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 1, background: 'var(--red)', opacity: 0.4 }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>owes</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 56 }}>
                    <MemberAvatar name={toM.name} size={36} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>{toM.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>receives</span>
                  </div>

                  <div className="btn-primary" style={{ fontSize: 11, padding: '5px 10px', opacity: 0, transition: '.2s', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.parentElement.querySelector('.settle-btn') && null}>
                    Settle ↗
                  </div>
                </div>
              )
            })}
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', paddingTop: 4 }}>Click any card to record a payment</p>
          </div>
        )}
      </div>

      {/* Net balances */}
      <div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Member Net Balances</h3>
        <div className="card" style={{ overflow: 'hidden' }}>
          {members.map((member, i) => {
            const balance   = netBalances[member._id] || 0
            const isPositive = balance >= 0
            const isZero    = Math.abs(balance) < 0.01
            return (
              <div key={member._id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border)'
              }}>
                <MemberAvatar name={member.name} size={32} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{member.name}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: isZero ? 'var(--text-3)' : isPositive ? 'var(--green)' : 'var(--red)' }}>
                    {isZero ? 'Settled' : `${isPositive ? '+' : ''}₹${balance.toLocaleString('en-IN')}`}
                  </p>
                  {!isZero && <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{isPositive ? 'is owed' : 'owes'}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settlement history */}
      {settlements.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Settlement History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...settlements].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => {
              const fromM = getMember(s.from)
              const toM   = getMember(s.to)
              if (!fromM || !toM) return null
              return (
                <div key={s._id} className="card group" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <MemberAvatar name={fromM.name} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>{fromM.name}</span>
                    <ArrowRight size={13} style={{ color: 'var(--green)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>{toM.name}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--green)' }}>
                      ₹{s.amount.toLocaleString('en-IN')}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {format(new Date(s.date), 'MMM d, yyyy')}{s.note ? ` · ${s.note}` : ''}
                    </p>
                  </div>
                  <button className="btn-icon" style={{ opacity: 0, flexShrink: 0, color: 'var(--red)' }}
                    onClick={() => handleDelete(s._id)}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'var(--red-dim)' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.background = 'transparent' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
