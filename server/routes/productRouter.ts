import express from 'express'
import productCtrl from '../controllers/productCtrl'
import auth from '../middleware/auth'

const router = express.Router()
router.post('/register',auth, productCtrl.createProduct)

//router.route('/').post(auth, productCtrl.createProduct)
/*router.get('/' , productCtrl.getProducts)
router.post('/', auth, productCtrl.createProduct)
router.get('/search', productCtrl.searchProducts)

router.get('/home', productCtrl.getHomeProducts)*/

/*router.get('/products/category/:id', productCtrl.getProductsByCategory)*/

/*router.get('/products/user/:id', productCtrl.getProductsByUser)*/

/*router.route('/product/:id')
  .put(auth, productCtrl.updateProduct)
  .delete(auth, productCtrl.deleteProduct)*/




export default router;