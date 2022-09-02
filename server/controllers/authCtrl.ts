import { Request, Response } from 'express'
import Users from '../models/userModel'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateActiveToken, generateAccessToken, generateRefreshToken } from '../config/generateToken'
import sendMail from '../config/sendMail'
import { validateEmail, validPhone } from '../middleware/valid'
import { sendSms, smsOTP, smsVerify } from '../config/sendSMS'
import { IDecodedToken, IUsers, IGgPayload, IUserParams, IReqAuth } from '../utils/interface'

import { OAuth2Client } from 'google-auth-library'
import userModel from '../models/userModel'
//import fetch from 'node-fetch'


const client = new OAuth2Client(`${process.env.MAIL_CLIENT_ID}`)
const CLIENT_URL = `${process.env.BASE_URL}`

const authCtrl = {
  register: async(req: Request, res: Response) => {
    try {
      const { name, email, password ,phone} = req.body

      const user = await Users.findOne({email})
      if(user) return res.status(400).json({msg: 'Email or Phone number already exists.'})

      const passwordHash = await bcrypt.hash(password, 12)

      const newUser = { name, email,phone, password: passwordHash }

      const newUserModel = new userModel (newUser)
      await newUserModel.save()

      const active_token = generateActiveToken({newUser})

      res.status(201).json({message: 'success user ', newUserModel})

      

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  activeAccount: async(req: Request, res: Response) => {
    try {
      const { active_token } = req.body

      const decoded = <IDecodedToken>jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)

      const { newUser } = decoded 

      if(!newUser) return res.status(400).json({msg: "Invalid authentication."})
      
      const user = await Users.findOne({email: newUser.email})
      if(user) return res.status(400).json({msg: "Account already exists."})

      const new_user = new Users(newUser)

      await new_user.save()

      res.json({msg: "Account has been activated!"})

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  login: async(req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      const user = await Users.findOne({email})
      if(!user) return res.status(400).json({msg: 'This email does not exits.'})

      // if user exists
      loginUser(user, password, res)

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  logout: async(req: IReqAuth, res: Response) => {
    if(!req.user)
      return res.status(400).json({msg: "Invalid Authentication."})

    try {
      res.clearCookie('refreshtoken', { path: `/api/refresh_token` })

      await Users.findOneAndUpdate({_id: req.user._id}, {
        rf_token: ''
      })

      return res.json({msg: "Logged out!"})

    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  refreshToken: async(req: Request, res: Response) => {
    try {
      const rf_token = req.cookies.refreshtoken
      if(!rf_token) return res.status(400).json({msg: "Please login now!"})

      const decoded = <IDecodedToken>jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`)
      if(!decoded.id) return res.status(400).json({msg: "Please login now!"})

      const user = await Users.findById(decoded.id).select("-password +rf_token")
      if(!user) return res.status(400).json({msg: "This email does not exist."})

      if(rf_token !== user.rf_token)
        return res.status(400).json({msg: "Please login now!"})

      const access_token = generateAccessToken({id: user._id})
      const refresh_token = generateRefreshToken({id: user._id}, res)

      await Users.findOneAndUpdate({_id: user._id}, {
        rf_token: refresh_token
      })

      res.json({ access_token, user })
      
    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  googleLogin: async(req: Request, res: Response) => {
    try {
      const { id_token } = req.body
      const verify = await client.verifyIdToken({
        idToken: id_token, audience: `${process.env.MAIL_CLIENT_ID}`
      })

      const {
        email, email_verified, name, picture
      } = <IGgPayload>verify.getPayload()

      if(!email_verified)
        return res.status(500).json({msg: "Email verification failed."})

      const password = email + 'your google secrect password'
      const passwordHash = await bcrypt.hash(password, 12)

      const user = await Users.findOne({email: email})

      if(user){
        loginUser(user, password, res)
      }else{
        const user = {
          name, 
          email: email, 
          password: passwordHash, 
          avatar: picture,
          type: 'google'
        }
        registerUser(user, res)
      }
      
    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
  facebookLogin: async(req: Request, res: Response) => {
    try {
      const { accessToken, userID } = req.body

      const URL = `
        https://graph.facebook.com/v3.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}
      `

      const data = await fetch(URL)
      .then(res => res.json())
      .then(res => { return res })

      const { email, name, picture } = data

      const password = email + 'your facebook secrect password'
      const passwordHash = await bcrypt.hash(password, 12)

      const user = await Users.findOne({email: email})

      if(user){
        loginUser(user, password, res)
      }else{
        const user = {
          name, 
          email: email, 
          password: passwordHash, 
          avatar: picture.data.url,
          type: 'facebook'
        }
        registerUser(user, res)
      } 
      
    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
 
 
  forgotPassword: async(req: Request, res: Response) => {
    try {
      const { email } = req.body

      const user = await Users.findOne({email})
      if(!user)
        return res.status(400).json({msg: 'This email does not exist.'})

      if(user.type !== 'register')
        return res.status(400).json({
          msg: `Quick login email with ${user.type} can't use this function.`
        })

      const access_token = generateAccessToken({id: user._id})

      const url = `${CLIENT_URL}/reset_password/${access_token}`


    } catch (err: any) {
      return res.status(500).json({msg: err.message})
    }
  },
}


const loginUser = async (user: IUsers, password: string, res: Response) => {
  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch) {
    let msgError = user.type === 'register' 
      ? 'Password is incorrect.' 
      : `Password is incorrect. This email login with ${user.type}`

    return res.status(400).json({ msg: msgError })
  }

  const access_token = generateAccessToken({id: user._id})
  const refresh_token = generateRefreshToken({id: user._id}, res)

  await Users.findOneAndUpdate({_id: user._id}, {
    rf_token:refresh_token
  })

  res.json({
    msg: 'Login Success!',
    access_token,
    user: { ...user._doc, password: '' }
  })

}

const registerUser = async (user: IUserParams, res: Response) => {
  const newUser = new Users(user)

  const access_token = generateAccessToken({id: newUser._id})
  const refresh_token = generateRefreshToken({id: newUser._id}, res)

  newUser.rf_token = refresh_token
  await newUser.save()

  res.json({
    msg: 'Login Success!',
    access_token,
    user: { ...newUser._doc, password: '' }
  })

}

export default authCtrl;