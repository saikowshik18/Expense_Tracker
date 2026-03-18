import Settlement from '../models/Settlement.js'
import Trip from '../models/Trip.js'

// GET /api/trips/:tripId/settlements
export const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ tripId: req.params.tripId }).sort({ date: -1 })
    res.json(settlements)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/trips/:tripId/settlements
export const createSettlement = async (req, res) => {
  try {
    const { tripId } = req.params
    const { from, to, amount, date, note } = req.body

    const trip = await Trip.findById(tripId)
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    if (!from || !to || !amount || !date) {
      return res.status(400).json({ message: 'from, to, amount and date are required' })
    }

    if (from === to) {
      return res.status(400).json({ message: 'Cannot settle with yourself' })
    }

    const settlement = new Settlement({
      tripId,
      from,
      to,
      amount: Number(amount),
      date,
      note: note || ''
    })

    const saved = await settlement.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/trips/:tripId/settlements/:id
export const deleteSettlement = async (req, res) => {
  try {
    const { tripId, id } = req.params
    const settlement = await Settlement.findOneAndDelete({ _id: id, tripId })
    if (!settlement) return res.status(404).json({ message: 'Settlement not found' })
    res.json({ message: 'Settlement deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
