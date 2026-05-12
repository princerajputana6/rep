import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IIntegration extends Document {
  type: string
  agencyId: string
  configuration: Record<string, unknown>
  active: boolean
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    type: { type: String, required: true },
    agencyId: { type: String, required: true },
    configuration: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
    lastSyncAt: { type: Date },
  },
  { timestamps: true }
)

IntegrationSchema.index({ agencyId: 1 })
IntegrationSchema.index({ type: 1, agencyId: 1 }, { unique: true })

export const Integration: Model<IIntegration> =
  mongoose.models.Integration ?? mongoose.model<IIntegration>('Integration', IntegrationSchema)
