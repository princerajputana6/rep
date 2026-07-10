import mongoose, { Schema, Document, Model } from 'mongoose'

// The license issued to a Company by a SUPER_ADMIN. Drives which feature modules
// are unlocked and the account limits. One license per company.
export interface ILicense extends Document {
  companyId: string
  tier: 'PRIME' | 'ULTIMATE' | 'ENTERPRISE'
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED'
  enabledModules: string[]
  maxUsers?: number | null
  maxAgencies?: number | null
  sandboxLimit: number                  // number of sandbox environments allowed
  seats?: number | null
  validFrom: Date
  validTo?: Date | null
  issuedBy: string                      // AdminUser (super admin) id
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const LicenseSchema = new Schema<ILicense>(
  {
    companyId: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['PRIME', 'ULTIMATE', 'ENTERPRISE'], default: 'PRIME' },
    status: {
      type: String,
      enum: ['TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    enabledModules: { type: [String], default: [] },
    maxUsers: { type: Number, default: null },
    maxAgencies: { type: Number, default: null },
    sandboxLimit: { type: Number, default: 1 },
    seats: { type: Number, default: null },
    validFrom: { type: Date, default: () => new Date() },
    validTo: { type: Date, default: null },
    issuedBy: { type: String, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export const License: Model<ILicense> =
  mongoose.models.License ?? mongoose.model<ILicense>('License', LicenseSchema)
