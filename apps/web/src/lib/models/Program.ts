import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProgram extends Document {
  agencyId: string
  portfolioId?: string
  name: string
  description?: string
  owner: string
  status: string
  healthScore?: number
  startDate?: Date
  endDate?: Date
  budget?: number
  spent: number
  projectIds: string[]
  createdAt: Date
  updatedAt: Date
}

const ProgramSchema = new Schema<IProgram>(
  {
    agencyId: { type: String, required: true },
    portfolioId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' },
    healthScore: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    spent: { type: Number, default: 0 },
    projectIds: { type: [String], default: [] },
  },
  { timestamps: true }
)

ProgramSchema.index({ agencyId: 1 })
ProgramSchema.index({ portfolioId: 1 })

export const Program: Model<IProgram> =
  mongoose.models.Program ?? mongoose.model<IProgram>('Program', ProgramSchema)
