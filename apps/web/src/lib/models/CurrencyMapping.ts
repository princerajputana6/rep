import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICurrencyMapping extends Document {
  agencyId: string
  fromCurrency: string
  toCurrency: string
  rate: number
  effectiveDate: Date
  source?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const CurrencyMappingSchema = new Schema<ICurrencyMapping>(
  {
    agencyId: { type: String, required: true },
    fromCurrency: { type: String, required: true },
    toCurrency: { type: String, required: true },
    rate: { type: Number, required: true },
    effectiveDate: { type: Date, default: () => new Date() },
    source: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

CurrencyMappingSchema.index({ agencyId: 1, fromCurrency: 1, toCurrency: 1 })

export const CurrencyMapping: Model<ICurrencyMapping> =
  mongoose.models.CurrencyMapping ?? mongoose.model<ICurrencyMapping>('CurrencyMapping', CurrencyMappingSchema)
