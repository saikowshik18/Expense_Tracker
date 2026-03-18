import mongoose from 'mongoose'

const settlementSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    from: {
      type: String,
      required: [true, 'Payer member ID is required']
    },
    to: {
      type: String,
      required: [true, 'Receiver member ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    note: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
)

export default mongoose.model('Settlement', settlementSchema)
