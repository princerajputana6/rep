import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJobRole extends Document {
  name: string
  description?: string
  agencyId: string
  category?: string
  defaultHourlyRate?: number
  skills: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const JobRoleSchema = new Schema<IJobRole>(
  {
    name: { type: String, required: true },
    description: { type: String },
    agencyId: { type: String, required: true },
    category: { type: String },
    defaultHourlyRate: { type: Number },
    skills: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

JobRoleSchema.index({ agencyId: 1 })

export const JobRole: Model<IJobRole> =
  mongoose.models.JobRole ?? mongoose.model<IJobRole>('JobRole', JobRoleSchema)
