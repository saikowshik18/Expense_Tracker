import Trip from '../models/Trip.js'
import Expense from '../models/Expense.js'
import Settlement from '../models/Settlement.js'

// GET /api/trips
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 })

    // Attach totalSpent and expenseCount for each trip
    const tripsWithStats = await Promise.all(
      trips.map(async (trip) => {
        const expenses = await Expense.find({ tripId: trip._id })
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
        const expenseCount = expenses.length

        const obj = trip.toObject()
        obj.totalSpent = totalSpent
        obj.expenseCount = expenseCount
        return obj
      })
    )

    res.json(tripsWithStats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/trips/:id
export const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    const expenses = await Expense.find({ tripId: trip._id })
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

    const obj = trip.toObject()
    obj.totalSpent = totalSpent
    obj.expenseCount = expenses.length

    res.json(obj)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/trips
export const createTrip = async (req, res) => {
  try {
    const { name, budget, startDate, endDate, description, members } = req.body

    if (!name || !budget) {
      return res.status(400).json({ message: 'Name and budget are required' })
    }

    const trip = new Trip({
      name,
      budget,
      startDate: startDate || null,
      endDate: endDate || null,
      description: description || '',
      members: members || []
    })

    const saved = await trip.save()
    const obj = saved.toObject()
    obj.totalSpent = 0
    obj.expenseCount = 0

    res.status(201).json(obj)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/trips/:id
export const updateTrip = async (req, res) => {
  try {
    const { name, budget, startDate, endDate, description, members } = req.body

    const trip = await Trip.findById(req.params.id)
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    trip.name = name || trip.name
    trip.budget = budget !== undefined ? budget : trip.budget
    trip.startDate = startDate !== undefined ? startDate : trip.startDate
    trip.endDate = endDate !== undefined ? endDate : trip.endDate
    trip.description = description !== undefined ? description : trip.description

    // Handle members: preserve _ids for existing, assign new ones to new members
    if (members) {
      trip.members = members.map((m) => {
        if (m._id) {
          // existing member — find and keep
          const existing = trip.members.id(m._id)
          if (existing) {
            existing.name = m.name
            return existing
          }
        }
        return { name: m.name }
      })
    }

    const saved = await trip.save()

    const expenses = await Expense.find({ tripId: trip._id })
    const obj = saved.toObject()
    obj.totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
    obj.expenseCount = expenses.length

    res.json(obj)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/trips/:id
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    // Cascade delete expenses and settlements
    await Expense.deleteMany({ tripId: trip._id })
    await Settlement.deleteMany({ tripId: trip._id })
    await trip.deleteOne()

    res.json({ message: 'Trip deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
