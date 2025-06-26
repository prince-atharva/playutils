import mongoose, { Document, Model, Schema } from 'mongoose'

export enum Provider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

export interface IUser extends Document {
  name: string
  email: string
  image: string
  createdAt: Date
  updatedAt: Date
  provider: Provider
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  provider: { type: String, enum: Object.values(Provider), required: true },
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
export default User