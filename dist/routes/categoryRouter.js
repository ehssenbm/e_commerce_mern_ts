"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryCtrl_1 = __importDefault(require("../controllers/categoryCtrl"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.route('/category')
    .get(categoryCtrl_1.default.getCategories)
    .post(auth_1.default, categoryCtrl_1.default.createCategory);
router.route('/category/:id')
    .patch(auth_1.default, categoryCtrl_1.default.updateCategory)
    .delete(auth_1.default, categoryCtrl_1.default.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRouter.js.map