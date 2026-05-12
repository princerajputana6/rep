import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  agencyId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  action: string
  entity: string
  entityId: string
  changes?: Record<string, unknown>
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

AuditLogSchema.index({ agencyId: 1 })
AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ userId: 1 })

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
