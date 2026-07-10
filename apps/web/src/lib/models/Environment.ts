import mongoose, { Schema, Document, Model } from 'mongoose'

// Isolated data environments per company. Every company gets one PRODUCTION
// environment on onboarding. Company admins may create SANDBOX environments up
// to their license sandboxLimit; beyond that they must upgrade / purchase more.
export interface IEnvironment extends Document {
  companyId: string
  name: string
  type: 'PRODUCTION' | 'SANDBOX'
  status: 'ACTIVE' | 'ARCHIVED'
  isDefault: boolean
  createdBy: string                     // AdminUser id
  createdAt: Date
  updatedAt: Date
}

const EnvironmentSchema = new Schema<IEnvironment>(
  {
    companyId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['PRODUCTION', 'SANDBOX'], required: true },
    status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

EnvironmentSchema.index({ companyId: 1, type: 1 })

export const Environment: Model<IEnvironment> =
  mongoose.models.Environment ?? mongoose.model<IEnvironment>('Environment', EnvironmentSchema)
