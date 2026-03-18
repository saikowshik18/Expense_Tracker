import express from 'express'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js'

const router = express.Router({ mergeParams: true })

router.get('/', getExpenses)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router
