import mongoose, { Schema, Document, Model } from 'mongoose'

// One document per agency. Treats settings as a free-form key-value bag
// so EnhancedSettings can add new toggles without a schema migration.
export interface IAppSetting extends Document {
  agencyId: string
  values: Record<string, unknown>
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const AppSettingSchema = new Schema<IAppSetting>(
  {
    agencyId: { type: String, required: true, unique: true },
    values: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: String },
  },
  { timestamps: true }
)

export const AppSetting: Model<IAppSetting> =
  mongoose.models.AppSetting ?? mongoose.model<IAppSetting>('AppSetting', AppSettingSchema)
