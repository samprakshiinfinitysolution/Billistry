import mongoose, { Schema, models } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      default: "Free Trial",
    },
    planType: {
      type: String,
      enum: ["trial", "monthly", "yearly"],
      default: "trial",
    },
    price: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    isTrial: {
      type: Boolean,
      default: true,
    },
    trialEndsAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["trial", "pending", "paid", "failed"],
      default: "trial",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

SubscriptionSchema.pre("save", function (next) {
  if (this.isTrial && !this.trialEndsAt) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 15);
    this.trialEndsAt = trialEnd;
    this.endDate = trialEnd;
  }
  next();
});

const Subscription =
  models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
