import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResourcePool extends Document {
  agencyId: string
  name: string
  description?: string
  managerId?: string
  memberIds: string[]              // user / resource ids
  sharedWithAgencyIds: string[]    // agencies allowed to borrow from this pool
  category?: string
  active: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const ResourcePoolSchema = new Schema<IResourcePool>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    managerId: { type: String },
    memberIds: { type: [String], default: [] },
    sharedWithAgencyIds: { type: [String], default: [] },
    category: { type: String },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

ResourcePoolSchema.index({ agencyId: 1 })

export const ResourcePool: Model<IResourcePool> =
  mongoose.models.ResourcePool ?? mongoose.model<IResourcePool>('ResourcePool', ResourcePoolSchema)
