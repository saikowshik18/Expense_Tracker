import { useState, useEffect } from 'react'
import { X, UserPlus, Users } from 'lucide-react'
import { MemberChip } from '../MemberChip'
import { useApp } from '../../context/AppContext'

export default function TripModal({ open, trip, onClose }) {
  const { createTrip, updateTrip } = useApp()
  const isEdit = !!trip

  const [form, setForm] = useState({ name: '', budget: '', startDate: '', endDate: '', description: '' })
  const [members, setMembers] = useState([])
  const [newMember, setNewMember] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    if (trip) {
      setForm({
        name: trip.name || '',
        budget: trip.budget || '',
        startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
        endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
        description: trip.description || ''
      })
      setMembers(trip.members?.map(m => ({ name: m.name, _id: m._id })) || [])
    } else {
      setForm({ name: '', budget: '', startDate: '', endDate: '', description: '' })
      setMembers([])
    }
    setNewMember('')
    setErrors({})
  }, [open, trip])

  const addMember = () => {
    const name = newMember.trim()
    if (!name) return
    if (members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      setErrors(e => ({ ...e, member: 'Member already added' }))
      return
    }
    setMembers(prev => [...prev, { name }])
    setNewMember('')
    setErrors(e => ({ ...e, member: '' }))
  }

  const removeMember = (name) => setMembers(prev => prev.filter(m => m.name !== name))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Trip name is required'
    if (!form.budget || isNaN(form.budget) || Number(form.budget) <= 0) errs.budget = 'Valid budget required'
    if (form.startDate && form.endDate && form.startDate > form.endDate) errs.endDate = 'End must be after start'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      budget: Number(form.budget),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      description: form.description.trim(),
      members: members.map(m => ({ name: m.name, ...(m._id ? { _id: m._id } : {}) }))
    }
    if (isEdit) await updateTrip(trip._id, payload)
    else await createTrip(payload)
    setSaving(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Trip' : 'New Trip'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="section-label">Trip Name *</label>
            <input className="input-base" placeholder="e.g. Goa Vacation 2025"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {errors.name && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div>
            <label className="section-label">Budget (₹) *</label>
            <input className="input-base" type="number" placeholder="50000" min="1"
              value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            {errors.budget && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.budget}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="section-label">Start Date</label>
              <input className="input-base" type="date"
                value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="section-label">End Date</label>
              <input className="input-base" type="date"
                value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              {errors.endDate && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="section-label">Description</label>
            <input className="input-base" placeholder="Short description (optional)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="section-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={11} /> Trip Members
              </label>
              {members.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{members.length} added</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-base" placeholder="Enter member name" value={newMember}
                onChange={e => { setNewMember(e.target.value); setErrors(er => ({ ...er, member: '' })) }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMember())} />
              <button className="btn-secondary" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }} onClick={addMember}>
                <UserPlus size={14} /> Add
              </button>
            </div>
            {errors.member && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.member}</p>}
            {members.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {members.map(m => <MemberChip key={m.name} name={m.name} onRemove={() => removeMember(m.name)} />)}
              </div>
            )}
            {members.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                Add members to enable expense splitting and settlements
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Trip'}
          </button>
        </div>
      </div>
    </div>
  )
}
