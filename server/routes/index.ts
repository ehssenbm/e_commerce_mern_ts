import authRouter from './authRouter'
import categoryRouter from './categoryRouter';
import productRouter from './productRouter';
import userRouter from './userRouter'


const routes = [
  authRouter,
  userRouter,
  productRouter,
  categoryRouter
]

export default routes;