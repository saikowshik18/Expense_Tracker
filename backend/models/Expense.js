import mongoose from 'mongoose'

const splitSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
)

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      enum: ['Food', 'Travel', 'Shopping', 'Hotel', 'Entertainment', 'Health', 'Other'],
      default: 'Other'
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    paidBy: {
      type: String,
      required: [true, 'Payer is required']
    },
    splitType: {
      type: String,
      enum: ['equal', 'manual', 'percentage'],
      default: 'equal'
    },
    splits: [splitSchema]
  },
  { timestamps: true }
)

export default mongoose.model('Expense', expenseSchema)
