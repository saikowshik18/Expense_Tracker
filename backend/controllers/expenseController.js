import Expense from '../models/Expense.js'
import Trip from '../models/Trip.js'

// GET /api/trips/:tripId/expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId }).sort({ date: -1 })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/trips/:tripId/expenses
export const createExpense = async (req, res) => {
  try {
    const { tripId } = req.params
    const { title, amount, category, date, notes, paidBy, splitType, splits } = req.body

    // Verify trip exists
    const trip = await Trip.findById(tripId)
    if (!trip) return res.status(404).json({ message: 'Trip not found' })

    if (!title || !amount || !date || !paidBy) {
      return res.status(400).json({ message: 'Title, amount, date and paidBy are required' })
    }

    const expense = new Expense({
      tripId,
      title,
      amount: Number(amount),
      category: category || 'Other',
      date,
      notes: notes || '',
      paidBy,
      splitType: splitType || 'equal',
      splits: splits || []
    })

    const saved = await expense.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/trips/:tripId/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const { tripId, id } = req.params
    const { title, amount, category, date, notes, paidBy, splitType, splits } = req.body

    const expense = await Expense.findOne({ _id: id, tripId })
    if (!expense) return res.status(404).json({ message: 'Expense not found' })

    expense.title = title || expense.title
    expense.amount = amount !== undefined ? Number(amount) : expense.amount
    expense.category = category || expense.category
    expense.date = date || expense.date
    expense.notes = notes !== undefined ? notes : expense.notes
    expense.paidBy = paidBy || expense.paidBy
    expense.splitType = splitType || expense.splitType
    expense.splits = splits || expense.splits

    const saved = await expense.save()
    res.json(saved)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/trips/:tripId/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const { tripId, id } = req.params
    const expense = await Expense.findOneAndDelete({ _id: id, tripId })
    if (!expense) return res.status(404).json({ message: 'Expense not found' })
    res.json({ message: 'Expense deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
