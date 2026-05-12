import mongoose, { Schema, Document, Model } from 'mongoose'

interface IStaffingPlanRow {
  resourceName: string
  role: string
  col1Hours: number
  col2Hours: number
  col3Hours: number
  col4Hours: number
}

export interface IStaffingPlan extends Document {
  agencyId: string
  name: string
  periodType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  year: number
  month?: number
  quarter?: number
  projectIds: string[]
  status: string
  createdBy: string
  rows: IStaffingPlanRow[]
  createdAt: Date
  updatedAt: Date
}

const StaffingPlanRowSchema = new Schema<IStaffingPlanRow>(
  {
    resourceName: { type: String, required: true },
    role: { type: String, required: true },
    col1Hours: { type: Number, default: 0 },
    col2Hours: { type: Number, default: 0 },
    col3Hours: { type: Number, default: 0 },
    col4Hours: { type: Number, default: 0 },
  },
  { _id: true }
)

const StaffingPlanSchema = new Schema<IStaffingPlan>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    periodType: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'], required: true },
    year: { type: Number, required: true },
    month: { type: Number },
    quarter: { type: Number },
    projectIds: { type: [String], default: [] },
    status: { type: String, default: 'DRAFT' },
    createdBy: { type: String, required: true },
    rows: { type: [StaffingPlanRowSchema], default: [] },
  },
  { timestamps: true }
)

StaffingPlanSchema.index({ agencyId: 1 })

export const StaffingPlan: Model<IStaffingPlan> =
  mongoose.models.StaffingPlan ?? mongoose.model<IStaffingPlan>('StaffingPlan', StaffingPlanSchema)
