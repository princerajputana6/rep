import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAgency extends Document {
  name: string
  companyId?: string                   // owning licensed company
  environmentId?: string | null        // production or a sandbox
  owner: string
  ownerEmail?: string
  totalResources: number
  participationLevel: string
  status: string
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
}

const AgencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true },
    companyId: { type: String },
    environmentId: { type: String, default: null },
    owner: { type: String, required: true },
    // sparse unique: an agency created by a company admin may not carry an owner email
    ownerEmail: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    totalResources: { type: Number, default: 0 },
    participationLevel: { type: String, default: 'full' },
    status: { type: String, default: 'ACTIVE' },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
)

AgencySchema.index({ status: 1 })
AgencySchema.index({ companyId: 1 })

export const Agency: Model<IAgency> =
  mongoose.models.Agency ?? mongoose.model<IAgency>('Agency', AgencySchema)
