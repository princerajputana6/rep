import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAllocation extends Document {
  agencyId: string
  resourceId?: mongoose.Types.ObjectId
  projectId?: mongoose.Types.ObjectId
  taskId?: mongoose.Types.ObjectId
  jobRoleId?: mongoose.Types.ObjectId
  assignmentType: 'JOB_ROLE' | 'USER'
  allocatedHours: number
  utilizationPct: number
  startDate?: Date
  endDate?: Date
  status: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const AllocationSchema = new Schema<IAllocation>(
  {
    agencyId: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    jobRoleId: { type: Schema.Types.ObjectId, ref: 'JobRole' },
    assignmentType: { type: String, enum: ['JOB_ROLE', 'USER'], default: 'USER' },
    allocatedHours: { type: Number, default: 0 },
    utilizationPct: { type: Number, default: 100 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, default: 'ACTIVE' },
    notes: { type: String },
  },
  { timestamps: true }
)

AllocationSchema.index({ agencyId: 1 })
AllocationSchema.index({ projectId: 1 })
AllocationSchema.index({ resourceId: 1 })

export const Allocation: Model<IAllocation> =
  mongoose.models.Allocation ?? mongoose.model<IAllocation>('Allocation', AllocationSchema)
