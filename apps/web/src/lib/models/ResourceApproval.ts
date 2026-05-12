import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResourceApproval extends Document {
  agencyId: string
  resourceName: string
  projectName: string
  requestedBy: string
  requestedRole: string
  duration: string
  startDate: Date
  endDate?: Date
  allocationPct: number
  hourlyRate?: number
  billableRate?: number
  marginPct?: number
  status: string
  slaDeadline: Date
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ResourceApprovalSchema = new Schema<IResourceApproval>(
  {
    agencyId: { type: String, required: true },
    resourceName: { type: String, required: true },
    projectName: { type: String, required: true },
    requestedBy: { type: String, required: true },
    requestedRole: { type: String, required: true },
    duration: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    allocationPct: { type: Number, default: 100 },
    hourlyRate: { type: Number },
    billableRate: { type: Number },
    marginPct: { type: Number },
    status: { type: String, default: 'PENDING' },
    slaDeadline: { type: Date, required: true },
    rejectionReason: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
  },
  { timestamps: true }
)

ResourceApprovalSchema.index({ agencyId: 1 })
ResourceApprovalSchema.index({ status: 1 })

export const ResourceApproval: Model<IResourceApproval> =
  mongoose.models.ResourceApproval ??
  mongoose.model<IResourceApproval>('ResourceApproval', ResourceApprovalSchema)
