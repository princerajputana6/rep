import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITimesheet extends Document {
  agencyId: string
  userId: string
  projectId?: mongoose.Types.ObjectId
  projectName?: string
  taskName?: string
  billingCode?: string
  weekKey: string                  // e.g. '2026-W15'
  hours: Record<string, number>    // ISO date -> hours
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  isLocked: boolean
  rejectedReason?: string
  submittedAt?: Date
  approvedAt?: Date
  approverId?: string
  createdAt: Date
  updatedAt: Date
}

const TimesheetSchema = new Schema<ITimesheet>(
  {
    agencyId: { type: String, required: true },
    userId: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    taskName: { type: String },
    billingCode: { type: String },
    weekKey: { type: String, required: true },
    hours: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
    isLocked: { type: Boolean, default: false },
    rejectedReason: { type: String },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approverId: { type: String },
  },
  { timestamps: true }
)

TimesheetSchema.index({ agencyId: 1, userId: 1, weekKey: 1 })
TimesheetSchema.index({ status: 1 })

export const Timesheet: Model<ITimesheet> =
  mongoose.models.Timesheet ?? mongoose.model<ITimesheet>('Timesheet', TimesheetSchema)
