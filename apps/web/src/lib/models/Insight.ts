import mongoose, { Schema, Document, Model } from 'mongoose'

// Generic store for aspirational / AI-generated items: copilot suggestions,
// resource matches, predictive alerts, gamification badges, campaign matches.
// `data` is free-form so each page can store its own shape without a migration.
export interface IInsight extends Document {
  agencyId: string
  type: string                   // e.g. 'copilot', 'match', 'prediction', 'gamification', 'campaign-match'
  scope?: string                 // optional sub-bucket
  title: string
  data: Record<string, unknown>
  score?: number
  status: 'NEW' | 'ACCEPTED' | 'DISMISSED' | 'APPLIED'
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

const InsightSchema = new Schema<IInsight>(
  {
    agencyId: { type: String, required: true },
    type: { type: String, required: true },
    scope: { type: String },
    title: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    score: { type: Number },
    status: { type: String, enum: ['NEW', 'ACCEPTED', 'DISMISSED', 'APPLIED'], default: 'NEW' },
    createdBy: { type: String },
  },
  { timestamps: true }
)

InsightSchema.index({ agencyId: 1, type: 1 })
InsightSchema.index({ status: 1 })

export const Insight: Model<IInsight> =
  mongoose.models.Insight ?? mongoose.model<IInsight>('Insight', InsightSchema)
