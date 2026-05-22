import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWorkfrontObjectConfig {
  _id?: mongoose.Types.ObjectId
  objectCode: string
  enabled: boolean
  fieldList?: string[] | null
  filters?: Record<string, string> | null
  syncCursor?: string | null
  lastSyncCount: number
}

export interface IWorkfrontConnector extends Document {
  agencyId: string
  name: string
  baseUrl: string
  domain: string
  apiVersion: string
  authType: 'API_KEY' | 'OAUTH2'
  apiKeyEnc?: string | null
  oauthClientIdEnc?: string | null
  oauthClientSecretEnc?: string | null
  status: 'DRAFT' | 'ACTIVE' | 'ERROR' | 'DISABLED'
  lastSyncAt?: Date | null
  lastSyncError?: string | null
  syncFrequencyMinutes?: number | null
  lastSyncProjectCount: number
  lastSyncResourceCount: number
  createdBy: string
  objectConfigs: mongoose.Types.DocumentArray<IWorkfrontObjectConfig>
  createdAt: Date
  updatedAt: Date
}

const ObjectConfigSchema = new Schema<IWorkfrontObjectConfig>({
  objectCode: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  fieldList: { type: [String], default: null },
  filters: { type: Schema.Types.Mixed, default: null },
  syncCursor: { type: String, default: null },
  lastSyncCount: { type: Number, default: 0 },
})

const WorkfrontConnectorSchema = new Schema<IWorkfrontConnector>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    baseUrl: { type: String, required: true },
    domain: { type: String, required: true },
    apiVersion: { type: String, default: 'v14.0' },
    authType: { type: String, enum: ['API_KEY', 'OAUTH2'], default: 'API_KEY' },
    apiKeyEnc: { type: String, default: null },
    oauthClientIdEnc: { type: String, default: null },
    oauthClientSecretEnc: { type: String, default: null },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ERROR', 'DISABLED'], default: 'DRAFT' },
    lastSyncAt: { type: Date, default: null },
    lastSyncError: { type: String, default: null },
    syncFrequencyMinutes: { type: Number, default: 15 },
    lastSyncProjectCount: { type: Number, default: 0 },
    lastSyncResourceCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    objectConfigs: { type: [ObjectConfigSchema], default: [] },
  },
  { timestamps: true }
)

WorkfrontConnectorSchema.index({ agencyId: 1 })

export const WorkfrontConnector: Model<IWorkfrontConnector> =
  mongoose.models.WorkfrontConnector ??
  mongoose.model<IWorkfrontConnector>('WorkfrontConnector', WorkfrontConnectorSchema)
