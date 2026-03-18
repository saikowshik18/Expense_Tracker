import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { MemberAvatar } from '../MemberChip'
import { useApp } from '../../context/AppContext'

export default function SettleModal({ open, tripId, members, suggestion, onClose }) {
  const { createSettlement } = useApp()
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate]     = useState('')
  const [note, setNote]     = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setFrom(suggestion?.from || '')
    setTo(suggestion?.to || '')
    setAmount(suggestion?.amount || '')
    setDate(new Date().toISOString().slice(0, 10))
    setNote('')
    setErrors({})
  }, [open, suggestion])

  const fromMember = members.find(m => m._id === from)
  const toMember   = members.find(m => m._id === to)

  const validate = () => {
    const errs = {}
    if (!from) errs.from = 'Select who paid'
    if (!to) errs.to = 'Select who received'
    if (from === to) errs.to = 'Cannot settle with yourself'
    if (!amount || Number(amount) <= 0) errs.amount = 'Enter a valid amount'
    if (!date) errs.date = 'Date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    await createSettlement(tripId, { from, to, amount: Number(amount), date, note: note.trim() })
    setSaving(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Record Settlement</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Visual */}
          {fromMember && toMember && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '16px 0', borderRadius: 12, background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <MemberAvatar name={fromMember.name} size={42} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{fromMember.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>pays</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--green)' }}>
                  ₹{Number(amount || 0).toLocaleString('en-IN')}
                </span>
                <ArrowRight size={18} style={{ color: 'var(--green)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <MemberAvatar name={toMember.name} size={42} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{toMember.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>receives</span>
              </div>
            </div>
          )}

          {/* From / To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="section-label">Who Paid *</label>
              <select className="input-base" value={from} onChange={e => setFrom(e.target.value)}>
                <option value="">Select member</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              {errors.from && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.from}</p>}
            </div>
            <div>
              <label className="section-label">Who Received *</label>
              <select className="input-base" value={to} onChange={e => setTo(e.target.value)}>
                <option value="">Select member</option>
                {members.filter(m => m._id !== from).map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
              {errors.to && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.to}</p>}
            </div>
          </div>

          {/* Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="section-label">Amount (₹) *</label>
              <input className="input-base" type="number" placeholder="0" min="1"
                value={amount} onChange={e => setAmount(e.target.value)} />
              {errors.amount && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.amount}</p>}
            </div>
            <div>
              <label className="section-label">Date *</label>
              <input className="input-base" type="date"
                value={date} onChange={e => setDate(e.target.value)} />
              {errors.date && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.date}</p>}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="section-label">Note</label>
            <input className="input-base" placeholder="e.g. UPI transfer, Cash"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Recording...' : 'Record Settlement'}
          </button>
        </div>
      </div>
    </div>
  )
}
