import mongoose, { Schema, Document, Model } from 'mongoose'

// A licensed client company (the licensee). Sits ABOVE Agency in the hierarchy:
//   Company  ->  Agencies  ->  Users
// Created by a SUPER_ADMIN during onboarding.
export interface ICompany extends Document {
  name: string
  slug: string
  adminEmail: string
  adminName: string
  tier: 'PRIME' | 'ULTIMATE' | 'ENTERPRISE'
  status: 'ACTIVE' | 'SUSPENDED'
  createdBy: string                     // AdminUser (super admin) id
  createdAt: Date
  updatedAt: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    adminEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    adminName: { type: String, required: true },
    tier: { type: String, enum: ['PRIME', 'ULTIMATE', 'ENTERPRISE'], default: 'PRIME' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
)

CompanySchema.index({ status: 1 })

export const Company: Model<ICompany> =
  mongoose.models.Company ?? mongoose.model<ICompany>('Company', CompanySchema)
