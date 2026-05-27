import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITieUp extends Document {
  code: string
  fromAgencyId: string
  toAgencyId: string
  permittedRoles: string[]
  rateCardId?: string
  validFrom?: Date
  validTo?: Date
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'INACTIVE'
  activeAllocations: number
  totalValue: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TieUpSchema = new Schema<ITieUp>(
  {
    code: { type: String, required: true, unique: true },
    fromAgencyId: { type: String, required: true },
    toAgencyId: { type: String, required: true },
    permittedRoles: { type: [String], default: [] },
    rateCardId: { type: String },
    validFrom: { type: Date },
    validTo: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'INACTIVE'],
      default: 'ACTIVE',
    },
    activeAllocations: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
)

TieUpSchema.index({ fromAgencyId: 1 })
TieUpSchema.index({ toAgencyId: 1 })
TieUpSchema.index({ status: 1 })

export const TieUp: Model<ITieUp> =
  mongoose.models.TieUp ?? mongoose.model<ITieUp>('TieUp', TieUpSchema)
