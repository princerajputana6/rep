import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAgency extends Document {
  name: string
  owner: string
  ownerEmail: string
  totalResources: number
  participationLevel: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const AgencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    ownerEmail: { type: String, required: true, unique: true },
    totalResources: { type: Number, default: 0 },
    participationLevel: { type: String, default: 'full' },
    status: { type: String, default: 'ACTIVE' },
  },
  { timestamps: true }
)

AgencySchema.index({ status: 1 })
AgencySchema.index({ ownerEmail: 1 })

export const Agency: Model<IAgency> =
  mongoose.models.Agency ?? mongoose.model<IAgency>('Agency', AgencySchema)
