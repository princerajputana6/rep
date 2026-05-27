import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomFormField {
  key: string
  label: string
  type: string             // 'text' | 'number' | 'date' | 'select' | 'checkbox' | ...
  required?: boolean
  options?: string[]
  defaultValue?: unknown
}

export interface ICustomForm extends Document {
  agencyId: string
  name: string
  description?: string
  scope: string            // e.g. 'project', 'task', 'borrow-request'
  fields: ICustomFormField[]
  active: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const CustomFormFieldSchema = new Schema<ICustomFormField>({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  options: { type: [String], default: undefined },
  defaultValue: { type: Schema.Types.Mixed },
})

const CustomFormSchema = new Schema<ICustomForm>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    scope: { type: String, default: 'project' },
    fields: { type: [CustomFormFieldSchema], default: [] },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

CustomFormSchema.index({ agencyId: 1 })

export const CustomForm: Model<ICustomForm> =
  mongoose.models.CustomForm ?? mongoose.model<ICustomForm>('CustomForm', CustomFormSchema)
