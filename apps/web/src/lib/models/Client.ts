import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClient extends Document {
  name: string
  industry?: string
  agencyId: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  status: string
  revenue?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    industry: { type: String },
    agencyId: { type: String, required: true },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    status: { type: String, default: 'ACTIVE' },
    revenue: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
)

ClientSchema.index({ agencyId: 1 })
ClientSchema.index({ status: 1 })

export const Client: Model<IClient> =
  mongoose.models.Client ?? mongoose.model<IClient>('Client', ClientSchema)
