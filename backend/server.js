import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import tripRoutes from './routes/trips.js'
import expenseRoutes from './routes/expenses.js'
import settlementRoutes from './routes/settlements.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://expense-tracker-nu-five-63.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/trips', tripRoutes)
app.use('/api/trips/:tripId/expenses', expenseRoutes)
app.use('/api/trips/:tripId/settlements', settlementRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TripSpend API is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })
