"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productCtrl_1 = __importDefault(require("../controllers/productCtrl"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/register', auth_1.default, productCtrl_1.default.createProduct);
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
exports.default = router;
//# sourceMappingURL=productRouter.js.map