import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAccessRule extends Document {
  agencyId: string
  roleCode: string
  objectCode: string
  canCreate: boolean
  canView: boolean
  canUpdate: boolean
  canDelete: boolean
  canShare: boolean
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const AccessRuleSchema = new Schema<IAccessRule>(
  {
    agencyId: { type: String, required: true },
    roleCode: { type: String, required: true },
    objectCode: { type: String, required: true },
    canCreate: { type: Boolean, default: false },
    canView: { type: Boolean, default: true },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canShare: { type: Boolean, default: false },
    updatedBy: { type: String },
  },
  { timestamps: true }
)

AccessRuleSchema.index({ agencyId: 1, roleCode: 1, objectCode: 1 }, { unique: true })

export const AccessRule: Model<IAccessRule> =
  mongoose.models.AccessRule ?? mongoose.model<IAccessRule>('AccessRule', AccessRuleSchema)
