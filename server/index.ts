import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import routes from './routes/index'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import path from 'path'
import authRouter from './routes/authRouter'
import userRouter from './routes/userRouter'
import { SocketServer } from './config/socket'
import categoryRouter from './routes/categoryRouter'
// Database
import './config/database'
import productRouter from './routes/productRouter'



// Middleware
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(morgan('dev'))
app.use(cookieParser())

// Socket.io
const http = createServer(app)
export const io = new Server(http)


io.on("connection", (socket: Socket) => {
  SocketServer(socket)
})


// Routes
app.use('/products', productRouter)
app.use('/api', categoryRouter)
app.use('/auth', authRouter)
app.use('/users', userRouter)








// Production Deploy
if(process.env.NODE_ENV === 'production'){
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'build', 'index.html'))
  })
}

// server listenning
const port = 5000;
app.listen( port, () => {
    
    console.log( `[Server]server started at http://localhost:${ port }` );
} );