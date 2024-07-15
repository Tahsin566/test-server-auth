import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connect = mongoose.connect(process.env.MONGO_URL)
