import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBorrowRequest extends Document {
  agencyId: mongoose.Types.ObjectId
  resourceId?: mongoose.Types.ObjectId
  resourceName: string
  requestingTeam: string
  owningTeam: string
  projectId?: mongoose.Types.ObjectId
  projectName?: string
  skillsNeeded: string[]
  priority: string
  startDate: Date
  endDate: Date
  durationWeeks: number
  allocationPct: number
  internalCost?: number
  partnerCost?: number
  routingScore?: number
  status: string
  slaDeadline: Date
  notes?: string
  createdBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const BorrowRequestSchema = new Schema<IBorrowRequest>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
    resourceName: { type: String, required: true },
    requestingTeam: { type: String, required: true },
    owningTeam: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    skillsNeeded: { type: [String], default: [] },
    priority: { type: String, default: 'MEDIUM' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationWeeks: { type: Number, required: true },
    allocationPct: { type: Number, default: 100 },
    internalCost: { type: Number },
    partnerCost: { type: Number },
    routingScore: { type: Number },
    status: { type: String, default: 'PENDING' },
    slaDeadline: { type: Date, required: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
)

BorrowRequestSchema.index({ agencyId: 1 })
BorrowRequestSchema.index({ status: 1 })

export const BorrowRequest: Model<IBorrowRequest> =
  mongoose.models.BorrowRequest ?? mongoose.model<IBorrowRequest>('BorrowRequest', BorrowRequestSchema)
