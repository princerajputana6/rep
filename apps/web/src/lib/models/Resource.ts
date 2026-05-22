import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResource extends Document {
  name: string
  email: string
  agencyId: mongoose.Types.ObjectId
  role: string
  skills: string[]
  availability: number
  hourlyRate?: number
  active: boolean
  externalSource?: string
  externalId?: string
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema = new Schema<IResource>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    role: { type: String, required: true },
    skills: { type: [String], default: [] },
    availability: { type: Number, default: 100 },
    hourlyRate: { type: Number },
    active: { type: Boolean, default: true },
    externalSource: { type: String },
    externalId: { type: String },
  },
  { timestamps: true }
)

ResourceSchema.index({ agencyId: 1 })
ResourceSchema.index({ active: 1 })
ResourceSchema.index({ role: 1 })
ResourceSchema.index({ externalSource: 1, externalId: 1 })

export const Resource: Model<IResource> =
  mongoose.models.Resource ?? mongoose.model<IResource>('Resource', ResourceSchema)
