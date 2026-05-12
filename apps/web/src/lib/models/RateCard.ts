import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRateCard extends Document {
  name: string
  agencyId: string
  currency: string
  rates: Record<string, unknown>
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const RateCardSchema = new Schema<IRateCard>(
  {
    name: { type: String, required: true },
    agencyId: { type: String, required: true },
    currency: { type: String, default: 'USD' },
    rates: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

RateCardSchema.index({ agencyId: 1 })

export const RateCard: Model<IRateCard> =
  mongoose.models.RateCard ?? mongoose.model<IRateCard>('RateCard', RateCardSchema)
