import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITask extends Document {
  title: string
  description?: string
  agencyId: string
  projectId?: mongoose.Types.ObjectId
  status: string
  priority: string
  assigneeId?: mongoose.Types.ObjectId
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  externalSource?: string
  externalId?: string
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    agencyId: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    status: { type: String, default: 'TODO' },
    priority: { type: String, default: 'MEDIUM' },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'Resource' },
    dueDate: { type: Date },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
    externalSource: { type: String },
    externalId: { type: String },
  },
  { timestamps: true }
)

TaskSchema.index({ agencyId: 1 })
TaskSchema.index({ projectId: 1 })
TaskSchema.index({ status: 1 })
TaskSchema.index({ externalSource: 1, externalId: 1 })

export const Task: Model<ITask> =
  mongoose.models.Task ?? mongoose.model<ITask>('Task', TaskSchema)
