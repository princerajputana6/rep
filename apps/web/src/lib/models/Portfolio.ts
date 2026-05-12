import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPortfolio extends Document {
  agencyId: string
  name: string
  description?: string
  owner: string
  strategicTheme: string
  status: string
  startDate?: Date
  endDate?: Date
  budget?: number
  spent: number
  createdAt: Date
  updatedAt: Date
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    agencyId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true },
    strategicTheme: { type: String, default: '' },
    status: { type: String, default: 'ACTIVE' },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number },
    spent: { type: Number, default: 0 },
  },
  { timestamps: true }
)

PortfolioSchema.index({ agencyId: 1 })
PortfolioSchema.index({ status: 1 })

export const Portfolio: Model<IPortfolio> =
  mongoose.models.Portfolio ?? mongoose.model<IPortfolio>('Portfolio', PortfolioSchema)
