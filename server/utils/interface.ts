import { Document } from 'mongoose'
import { Request } from 'express'

export interface IUsers extends Document{
  name: string
  email: string
  phone: string
  password: string
  avatar: string
  role: string
  type: string
  rf_token?: string
  _doc: object
}
export interface INewUser {
  name: string
  email: string
  password: string
}

export interface IDecodedToken {
  id?: string
  newUser?: INewUser
  iat: number
  exp: number
}

export interface IGgPayload {
  email: string
  email_verified: boolean
  name: string
  picture: string
}

export interface IUserParams {
  name: string 
  email: string 
  password: string
  avatar?: string
  type: string
}

export interface IReqAuth extends Request {
  user?: IUsers
}

export interface IProduct extends Document{
  user: string
  name: string
  image: string
  description: string
  price:Number
  countInStock:Number
  thumbnail: string
  category: string
  _doc: object
}