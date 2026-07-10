import mongoose, { Schema, Document, Model } from 'mongoose'

// Password-authenticated administrators. These accounts DO NOT use Clerk.
//   SUPER_ADMIN   – platform operator; issues licenses & onboards companies. companyId is null.
//   COMPANY_ADMIN – the client company's administrator; manages agencies & users.
export type AdminRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN'

export interface IAdminUser extends Document {
  username: string
  email: string
  passwordHash: string
  name: string
  role: AdminRole
  companyId?: string | null            // null for SUPER_ADMIN
  status: 'ACTIVE' | 'SUSPENDED'
  mustResetPassword: boolean           // forces the reset screen on first login
  lastLogin?: Date | null
  createdBy?: string | null
  createdAt: Date
  updatedAt: Date
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'COMPANY_ADMIN'], required: true },
    companyId: { type: String, default: null },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    mustResetPassword: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
)

AdminUserSchema.index({ companyId: 1 })
AdminUserSchema.index({ role: 1 })

export const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ?? mongoose.model<IAdminUser>('AdminUser', AdminUserSchema)
