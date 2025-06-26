import mongoose from 'mongoose'
import { env } from './env'

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    mongoose.set('strictQuery', true)

    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })

    isConnected = true
    console.info(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    if (env.NODE_ENV === 'production') {
      process.exit(1)
    }
    throw error
  }
}

export default connectDB