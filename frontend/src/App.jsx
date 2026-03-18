import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import TripModal from './components/modals/TripModal'

export default function App() {
  const [tripModal, setTripModal] = useState({ open: false, trip: null })

  const openNewTrip = () => setTripModal({ open: true, trip: null })
  const openEditTrip = (trip) => setTripModal({ open: true, trip })
  const closeTripModal = () => setTripModal({ open: false, trip: null })

  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <Navbar onNewTrip={openNewTrip} />
          <Routes>
            <Route path="/" element={<Dashboard onNewTrip={openNewTrip} onEditTrip={openEditTrip} />} />
            <Route path="/trips" element={<Trips onNewTrip={openNewTrip} onEditTrip={openEditTrip} />} />
            <Route path="/trips/:id" element={<TripDetail onEditTrip={openEditTrip} />} />
          </Routes>
          <TripModal open={tripModal.open} trip={tripModal.trip} onClose={closeTripModal} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border-strong)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px'
              },
              success: { iconTheme: { primary: '#4ecb8d', secondary: '#0e0e11' } },
              error: { iconTheme: { primary: '#e25c7a', secondary: '#0e0e11' } }
            }}
          />
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}
