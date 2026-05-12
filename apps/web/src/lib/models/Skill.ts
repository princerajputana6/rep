import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISkill extends Document {
  name: string
  category?: string
  agencyId: string
  description?: string
  demandLevel?: string
  createdAt: Date
  updatedAt: Date
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    category: { type: String },
    agencyId: { type: String, required: true },
    description: { type: String },
    demandLevel: { type: String, default: 'MEDIUM' },
  },
  { timestamps: true }
)

SkillSchema.index({ agencyId: 1 })
SkillSchema.index({ name: 1, agencyId: 1 }, { unique: true })

export const Skill: Model<ISkill> =
  mongoose.models.Skill ?? mongoose.model<ISkill>('Skill', SkillSchema)
