import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Luggage, TrendingUp, Wallet, Users, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import TripCard from '../components/TripCard'

export default function Dashboard({ onNewTrip, onEditTrip }) {
  const { trips, loading, fetchTrips } = useApp()

  useEffect(() => { fetchTrips() }, [])

  const totalBudget    = trips.reduce((s, t) => s + (t.budget || 0), 0)
  const totalSpent     = trips.reduce((s, t) => s + (t.totalSpent || 0), 0)
  const totalRemaining = totalBudget - totalSpent
  const totalMembers   = new Set(trips.flatMap(t => t.members?.map(m => m.name) || [])).size
  const recentTrips    = trips.slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 26, color: 'var(--text)' }}>
          Trip Overview
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Track expenses across all your trips</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        <StatCard icon={<Luggage size={17} />} label="Total Trips" value={trips.length} sub={`${trips.length} trips`} color="var(--blue)" />
        <StatCard icon={<TrendingUp size={17} />} label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} sub={`of ₹${totalBudget.toLocaleString('en-IN')}`} color="var(--coral)" />
        <StatCard icon={<Wallet size={17} />} label="Remaining" value={`₹${Math.abs(totalRemaining).toLocaleString('en-IN')}`} sub={totalRemaining < 0 ? 'over budget' : 'available'} color={totalRemaining < 0 ? 'var(--red)' : 'var(--green)'} valueColor={totalRemaining < 0 ? 'var(--red)' : 'var(--green)'} />
        <StatCard icon={<Users size={17} />} label="Members" value={totalMembers} sub="across all trips" color="var(--purple)" />
      </div>

      {/* Recent trips */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>Recent Trips</h2>
          <Link to="/trips" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none' }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="skeleton" style={{ height: 20, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
                <div className="skeleton" style={{ height: 6, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🧳</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>No trips yet</h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Create your first trip to start tracking expenses</p>
            <button className="btn-primary" onClick={onNewTrip}>+ Create First Trip</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {recentTrips.map(trip => <TripCard key={trip._id} trip={trip} onEdit={onEditTrip} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color, valueColor }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '18', color, flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: valueColor || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}
