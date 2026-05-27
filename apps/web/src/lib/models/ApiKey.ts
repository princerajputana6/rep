import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IApiKey extends Document {
  agencyId: string
  name: string
  prefix: string           // first 8 chars shown in UI; full key only returned on create
  hashedKey: string        // store hash, never plain text
  scopes: string[]
  active: boolean
  lastUsedAt?: Date | null
  expiresAt?: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    prefix: { type: String, required: true },
    hashedKey: { type: String, required: true },
    scopes: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

ApiKeySchema.index({ agencyId: 1 })

export const ApiKey: Model<IApiKey> =
  mongoose.models.ApiKey ?? mongoose.model<IApiKey>('ApiKey', ApiKeySchema)
