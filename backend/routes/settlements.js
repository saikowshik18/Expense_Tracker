import express from 'express'
import {
  getSettlements,
  createSettlement,
  deleteSettlement
} from '../controllers/settlementController.js'

const router = express.Router({ mergeParams: true })

router.get('/', getSettlements)
router.post('/', createSettlement)
router.delete('/:id', deleteSettlement)

export default router
