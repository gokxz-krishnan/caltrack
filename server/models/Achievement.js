import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
      trim: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: prevents duplicate achievement unlocks per user
achievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
