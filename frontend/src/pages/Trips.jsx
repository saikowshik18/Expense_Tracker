import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import TripCard from '../components/TripCard'

export default function Trips({ onNewTrip, onEditTrip }) {
  const { trips, loading, fetchTrips } = useApp()
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTrips() }, [])

  const filtered = trips.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--text)' }}>All Trips</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn-primary" onClick={onNewTrip}>+ New Trip</button>
      </div>

      {trips.length > 3 && (
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input-base" style={{ paddingLeft: 36 }} placeholder="Search trips..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {[1,2,3].map(i => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton" style={{ height: 20, width: '60%' }} />
              <div className="skeleton" style={{ height: 6, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 12, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🧳</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
            {search ? 'No matching trips' : 'No trips yet'}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>
            {search ? 'Try a different search term' : 'Create your first trip to get started'}
          </p>
          {!search && <button className="btn-primary" onClick={onNewTrip}>+ Create Trip</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
          {filtered.map(trip => <TripCard key={trip._id} trip={trip} onEdit={onEditTrip} />)}
        </div>
      )}
    </div>
  )
}
