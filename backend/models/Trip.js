import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
})

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    members: [memberSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual: total spent (populated manually in controllers)
tripSchema.virtual('totalSpent').get(function () {
  return this._totalSpent || 0
})

tripSchema.virtual('expenseCount').get(function () {
  return this._expenseCount || 0
})

export default mongoose.model('Trip', tripSchema)
