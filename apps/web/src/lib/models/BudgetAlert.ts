import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBudgetAlert extends Document {
  agencyId: string
  name: string
  scope: 'PROJECT' | 'CLIENT' | 'PORTFOLIO' | 'AGENCY'
  scopeId?: string
  thresholdPct: number
  status: 'ACTIVE' | 'TRIGGERED' | 'MUTED'
  channels: string[]
  lastTriggeredAt?: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const BudgetAlertSchema = new Schema<IBudgetAlert>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    scope: { type: String, enum: ['PROJECT', 'CLIENT', 'PORTFOLIO', 'AGENCY'], default: 'PROJECT' },
    scopeId: { type: String },
    thresholdPct: { type: Number, default: 80 },
    status: { type: String, enum: ['ACTIVE', 'TRIGGERED', 'MUTED'], default: 'ACTIVE' },
    channels: { type: [String], default: ['email'] },
    lastTriggeredAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

BudgetAlertSchema.index({ agencyId: 1 })

export const BudgetAlert: Model<IBudgetAlert> =
  mongoose.models.BudgetAlert ?? mongoose.model<IBudgetAlert>('BudgetAlert', BudgetAlertSchema)
