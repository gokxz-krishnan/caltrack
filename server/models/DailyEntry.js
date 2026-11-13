import mongoose from 'mongoose';

const dailyEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    // Canonical date formatted as YYYY-MM-DD
    date: {
      type: String,
      required: [true, 'Entry date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      index: true,
    },
    minCalories: {
      type: Number,
      required: [true, 'Minimum estimated calories is required'],
      min: [0, 'Calories cannot be negative'],
    },
    maxCalories: {
      type: Number,
      required: [true, 'Maximum estimated calories is required'],
      min: [0, 'Calories cannot be negative'],
    },
    midpointCalories: {
      type: Number,
      default: function () {
        return Math.round((this.minCalories + this.maxCalories) / 2);
      },
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Always ensure midpoint is updated before saving
dailyEntrySchema.pre('save', function (next) {
  if (this.minCalories > this.maxCalories) {
    return next(new Error('Minimum calories cannot exceed maximum calories'));
  }
  this.midpointCalories = Math.round((this.minCalories + this.maxCalories) / 2);
  next();
});

// Ensure compound unique index: one entry per user per calendar day
dailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyEntry = mongoose.model('DailyEntry', dailyEntrySchema);
export default DailyEntry;
