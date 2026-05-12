import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProject extends Document {
  name: string
  description?: string
  clientId?: mongoose.Types.ObjectId
  agencyId: mongoose.Types.ObjectId
  status: string
  type: string
  startDate?: Date
  endDate?: Date
  budget?: number
  allocated: number
  healthScore?: number
  deliveryConfidence?: number
  budgetBurnPct?: number
  riskLevel?: string
  ownerId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    status: { type: String, default: 'ACTIVE' },
    type: { type: String, default: 'fixed' },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    allocated: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 },
    deliveryConfidence: { type: Number, default: 0 },
    budgetBurnPct: { type: Number, default: 0 },
    riskLevel: { type: String, default: 'low' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

ProjectSchema.index({ agencyId: 1 })
ProjectSchema.index({ status: 1 })

export const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>('Project', ProjectSchema)
