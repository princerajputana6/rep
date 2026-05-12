import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  email: string
  name: string
  role: string
  agencyId: string
  status: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: 'VIEWER' },
    agencyId: { type: String, required: true },
    status: { type: String, default: 'active' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
)

UserSchema.index({ agencyId: 1 })
UserSchema.index({ status: 1 })

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
