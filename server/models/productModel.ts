

import mongoose from 'mongoose'
import { IProduct } from '../utils/interface'

const productSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: 'user' },
  name: {
    type: String,
    require: true,
    trim: true,
    minLength: 10,
    maxLength: 50
  },
  image: {
    type: String,
    required: true,
  },
  
  description: {
    type: String,
    require: true,
    trim: true,
    minLength: 50,
    maxLength: 200
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0,
  },
  thumbnail:{
    type: String,
    require: true
  },
  category: { type: mongoose.Types.ObjectId, ref: 'category' }
}, {
  timestamps: true
})


export default mongoose.model<IProduct>('product', productSchema)