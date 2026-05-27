import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubscription extends Document {
  agencyId: string
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  enabledModules: string[]
  maxUsers?: number | null
  maxProjects?: number | null
  trialEndsAt?: Date | null
  currentPeriodEnd?: Date | null
  notes?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    agencyId: { type: String, required: true, unique: true },
    plan: { type: String, enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE', 'CUSTOM'], default: 'FREE' },
    status: { type: String, enum: ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED'], default: 'TRIAL' },
    enabledModules: { type: [String], default: [] },
    maxUsers: { type: Number, default: null },
    maxProjects: { type: Number, default: null },
    trialEndsAt: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    notes: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
)

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ?? mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
