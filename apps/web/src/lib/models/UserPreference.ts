import mongoose, { Schema, Document, Model } from 'mongoose'

// One per user. Stores UI personalization (theme, layout, dashboard widget config).
export interface IUserPreference extends Document {
  userId: string
  agencyId: string
  branding: Record<string, unknown>
  layout: Record<string, unknown>
  widgets: Record<string, unknown>
  custom: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const UserPreferenceSchema = new Schema<IUserPreference>(
  {
    userId: { type: String, required: true, unique: true },
    agencyId: { type: String, required: true },
    branding: { type: Schema.Types.Mixed, default: {} },
    layout: { type: Schema.Types.Mixed, default: {} },
    widgets: { type: Schema.Types.Mixed, default: {} },
    custom: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const UserPreference: Model<IUserPreference> =
  mongoose.models.UserPreference ?? mongoose.model<IUserPreference>('UserPreference', UserPreferenceSchema)
