import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWebhook extends Document {
  agencyId: string
  name: string
  url: string
  events: string[]
  secret?: string
  active: boolean
  lastTriggeredAt?: Date | null
  lastResponseCode?: number | null
  failureCount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const WebhookSchema = new Schema<IWebhook>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: { type: [String], default: [] },
    secret: { type: String },
    active: { type: Boolean, default: true },
    lastTriggeredAt: { type: Date, default: null },
    lastResponseCode: { type: Number, default: null },
    failureCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

WebhookSchema.index({ agencyId: 1 })

export const Webhook: Model<IWebhook> =
  mongoose.models.Webhook ?? mongoose.model<IWebhook>('Webhook', WebhookSchema)
