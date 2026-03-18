import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { MemberSelectRow, MemberAvatar } from '../MemberChip'
import { calculateSplits } from '../../utils/splitCalculator'
import { useApp } from '../../context/AppContext'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Hotel', 'Entertainment', 'Health', 'Other']
const CAT_ICONS  = { Food: '🍽️', Travel: '✈️', Shopping: '🛍️', Hotel: '🏨', Entertainment: '🎭', Health: '💊', Other: '📦' }

const SPLIT_TYPES = [
  { id: 'equal',      label: 'Equal',    icon: '⚖️' },
  { id: 'manual',     label: 'Custom',   icon: '✏️' },
  { id: 'percentage', label: 'Percent',  icon: '﹪' }
]

export default function ExpenseModal({ open, expense, tripId, members, onClose }) {
  const { createExpense, updateExpense } = useApp()
  const isEdit = !!expense

  const [form, setForm]               = useState({ title: '', amount: '', category: 'Food', date: '', notes: '', paidBy: '' })
  const [splitType, setSplitType]     = useState('equal')
  const [selected, setSelected]       = useState([])
  const [manualSplits, setManual]     = useState({})
  const [pctSplits, setPct]           = useState({})
  const [saving, setSaving]           = useState(false)
  const [errors, setErrors]           = useState({})

  useEffect(() => {
    if (!open) return
    if (expense) {
      setForm({
        title: expense.title || '', amount: expense.amount || '',
        category: expense.category || 'Food', date: expense.date?.slice(0, 10) || '',
        notes: expense.notes || '', paidBy: expense.paidBy || ''
      })
      setSplitType(expense.splitType || 'equal')
      setSelected(expense.splits?.map(s => s.memberId) || [])
      const man = {}, pct = {}
      expense.splits?.forEach(s => {
        man[s.memberId] = s.amount
        if (expense.amount) pct[s.memberId] = Math.round((s.amount / expense.amount) * 100)
      })
      setManual(man); setPct(pct)
    } else {
      const allIds = members.map(m => m._id)
      setForm({ title: '', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), notes: '', paidBy: members[0]?._id || '' })
      setSplitType('equal'); setSelected(allIds); setManual({}); setPct({})
    }
    setErrors({})
  }, [open, expense, members])

  const toggleMember = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const amount = Number(form.amount) || 0

  const preview = useMemo(() => {
    if (!amount || selected.length === 0) return []
    return calculateSplits(amount, splitType, selected, manualSplits, pctSplits)
  }, [amount, splitType, selected, manualSplits, pctSplits])

  const splitSum = preview.reduce((s, x) => s + x.amount, 0)
  const splitValid = amount > 0 && Math.abs(splitSum - amount) < 0.02
  const pctTotal = selected.reduce((s, id) => s + (Number(pctSplits[id]) || 0), 0)

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Valid amount required'
    if (!form.date) errs.date = 'Date is required'
    if (!form.paidBy) errs.paidBy = 'Select who paid'
    if (selected.length === 0) errs.members = 'Select at least one member'
    if (splitType === 'manual' && !splitValid) errs.split = `Total ₹${splitSum.toFixed(0)} must equal ₹${amount}`
    if (splitType === 'percentage' && Math.abs(pctTotal - 100) > 0.5) errs.split = `Percentages must total 100% (now ${pctTotal}%)`
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    const splits = calculateSplits(amount, splitType, selected, manualSplits, pctSplits)
    const payload = { title: form.title.trim(), amount, category: form.category, date: form.date, notes: form.notes.trim(), paidBy: form.paidBy, splitType, splits }
    if (isEdit) await updateExpense(tripId, expense._id, payload)
    else await createExpense(tripId, payload)
    setSaving(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label className="section-label">Title *</label>
            <input className="input-base" placeholder="e.g. Dinner at Beach Shack"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            {errors.title && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="section-label">Amount (₹) *</label>
              <input className="input-base" type="number" placeholder="1200" min="1"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              {errors.amount && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.amount}</p>}
            </div>
            <div>
              <label className="section-label">Date *</label>
              <input className="input-base" type="date"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              {errors.date && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.date}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="section-label">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button key={cat}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 4px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                    cursor: 'pointer', border: `1px solid ${form.category === cat ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.category === cat ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: form.category === cat ? 'var(--accent)' : 'var(--text-2)',
                    transition: 'all .15s'
                  }}
                  onClick={() => setForm(f => ({ ...f, category: cat }))}>
                  <span>{CAT_ICONS[cat]}</span><span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paid By */}
          {members.length > 0 && (
            <div>
              <label className="section-label">Paid By *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {members.map(m => (
                  <button key={m._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                      borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: `1px solid ${form.paidBy === m._id ? 'var(--blue)' : 'var(--border)'}`,
                      background: form.paidBy === m._id ? 'var(--blue-dim)' : 'var(--bg-elevated)',
                      color: form.paidBy === m._id ? 'var(--blue)' : 'var(--text-2)',
                      transition: 'all .15s'
                    }}
                    onClick={() => setForm(f => ({ ...f, paidBy: m._id }))}>
                    <MemberAvatar name={m.name} size={20} />{m.name}
                  </button>
                ))}
              </div>
              {errors.paidBy && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.paidBy}</p>}
            </div>
          )}

          {/* Split */}
          {members.length > 0 && (
            <div>
              <label className="section-label">Split Bill</label>

              {/* Split type selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {SPLIT_TYPES.map(st => (
                  <button key={st.id} className={`split-option ${splitType === st.id ? 'active' : ''}`}
                    onClick={() => setSplitType(st.id)}>
                    <span className="split-icon">{st.icon}</span>
                    <span className="split-label">{st.label}</span>
                  </button>
                ))}
              </div>

              {/* Member rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {members.map(member => (
                  <MemberSelectRow
                    key={member._id} member={member}
                    selected={selected.includes(member._id)}
                    onToggle={toggleMember}
                    showAmount splitType={splitType}
                    amount={manualSplits[member._id]}
                    onAmountChange={(id, val) => setManual(s => ({ ...s, [id]: val }))}
                    pct={pctSplits[member._id]}
                    onPctChange={(id, val) => setPct(s => ({ ...s, [id]: val }))}
                  />
                ))}
              </div>
              {errors.members && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{errors.members}</p>}

              {/* Preview */}
              {amount > 0 && selected.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, marginBottom: 10 }}>Split Preview</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {preview.map(sp => {
                      const m = members.find(x => x._id === sp.memberId)
                      if (!m) return null
                      return (
                        <div key={sp.memberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MemberAvatar name={m.name} size={18} />
                            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                            ₹{sp.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Total</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: splitValid ? 'var(--green)' : 'var(--red)' }}>
                      ₹{splitSum.toFixed(0)} {splitValid ? '✓' : `≠ ₹${amount}`}
                    </span>
                  </div>
                  {splitType === 'percentage' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Percentage total</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: Math.abs(pctTotal - 100) < 0.5 ? 'var(--green)' : 'var(--red)' }}>
                        {pctTotal}%
                      </span>
                    </div>
                  )}
                </div>
              )}
              {errors.split && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{errors.split}</p>}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="section-label">Notes</label>
            <input className="input-base" placeholder="Optional notes..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
