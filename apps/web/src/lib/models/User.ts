import mongoose, { Schema, Document, Model } from 'mongoose'

// Single principal table for the whole platform. Everyone — super admins,
// company admins and regular team members — logs in here with
// email-or-username + password. No external identity provider.
export const ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] as const
export type UserRole = (typeof ROLES)[number]

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  name: string
  role: UserRole
  companyId?: string | null       // null for SUPER_ADMIN
  agencyId?: string | null        // null for SUPER_ADMIN / COMPANY_ADMIN
  environmentId?: string | null
  status: 'ACTIVE' | 'INVITED' | 'DISABLED'
  mustResetPassword: boolean
  lastLogin?: Date | null
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'VIEWER' },
    companyId: { type: String, default: null },
    agencyId: { type: String, default: null },
    environmentId: { type: String, default: null },
    status: { type: String, enum: ['ACTIVE', 'INVITED', 'DISABLED'], default: 'ACTIVE' },
    mustResetPassword: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
)

UserSchema.index({ companyId: 1 })
UserSchema.index({ agencyId: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
