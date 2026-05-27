import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INotification extends Document {
  agencyId: string
  userId?: string                  // null = broadcast to whole agency
  type: 'success' | 'warning' | 'error' | 'info'
  priority: 'high' | 'medium' | 'low'
  category: string                 // e.g. 'approval', 'budget', 'integration'
  title: string
  message: string
  read: boolean
  link?: string                    // optional deep link
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    agencyId: { type: String, required: true },
    userId: { type: String },
    type: { type: String, enum: ['success', 'warning', 'error', 'info'], default: 'info' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    category: { type: String, default: 'general' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
)

NotificationSchema.index({ agencyId: 1, userId: 1, read: 1 })
NotificationSchema.index({ createdAt: -1 })

export const Notification: Model<INotification> =
  mongoose.models.Notification ?? mongoose.model<INotification>('Notification', NotificationSchema)
