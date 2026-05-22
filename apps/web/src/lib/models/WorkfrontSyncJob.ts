import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWorkfrontSyncJob extends Document {
  agencyId: string
  connectorId: string
  mode: 'FULL' | 'INCREMENTAL'
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'
  triggeredBy: string
  startedAt: Date
  completedAt?: Date | null
  totalRecords: number
  errorMessage?: string | null
  createdAt: Date
  updatedAt: Date
}

const WorkfrontSyncJobSchema = new Schema<IWorkfrontSyncJob>(
  {
    agencyId: { type: String, required: true },
    connectorId: { type: String, required: true },
    mode: { type: String, enum: ['FULL', 'INCREMENTAL'], default: 'INCREMENTAL' },
    status: {
      type: String,
      enum: ['RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL'],
      default: 'RUNNING',
    },
    triggeredBy: { type: String, required: true },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date, default: null },
    totalRecords: { type: Number, default: 0 },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
)

WorkfrontSyncJobSchema.index({ connectorId: 1, startedAt: -1 })

export const WorkfrontSyncJob: Model<IWorkfrontSyncJob> =
  mongoose.models.WorkfrontSyncJob ??
  mongoose.model<IWorkfrontSyncJob>('WorkfrontSyncJob', WorkfrontSyncJobSchema)
