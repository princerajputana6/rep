import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  clerkId?: string | null              // null until the invited user activates via Clerk
  email: string
  name: string
  role: string
  companyId?: string                   // owning licensed company
  agencyId: string
  environmentId?: string | null        // which environment this user belongs to
  // 'invited'  -> pre-created by an admin, has NOT yet signed in via Clerk
  // 'active'   -> claimed a Clerk account
  // 'disabled' -> access revoked
  status: string
  invitedBy?: string | null
  invitedAt?: Date | null
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    // sparse unique: many invited users can share `null` before activation
    clerkId: { type: String, default: null, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    role: { type: String, default: 'VIEWER' },
    companyId: { type: String },
    agencyId: { type: String, required: true },
    environmentId: { type: String, default: null },
    status: { type: String, default: 'invited' },
    invitedBy: { type: String, default: null },
    invitedAt: { type: Date, default: null },
    lastLogin: { type: Date },
  },
  { timestamps: true }
)

UserSchema.index({ agencyId: 1 })
UserSchema.index({ companyId: 1 })
UserSchema.index({ status: 1 })

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
