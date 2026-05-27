import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubAgency extends Document {
  name: string
  parentAgencyId: string
  agencyType: string
  location?: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const SubAgencySchema = new Schema<ISubAgency>(
  {
    name: { type: String, required: true },
    parentAgencyId: { type: String, required: true },
    agencyType: { type: String, default: 'Profit Center' },
    location: { type: String },
    status: { type: String, default: 'ACTIVE' },
  },
  { timestamps: true }
)

SubAgencySchema.index({ parentAgencyId: 1 })
SubAgencySchema.index({ status: 1 })

export const SubAgency: Model<ISubAgency> =
  mongoose.models.SubAgency ?? mongoose.model<ISubAgency>('SubAgency', SubAgencySchema)
