"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authCtrl_1 = __importDefault(require("../controllers/authCtrl"));
const valid_1 = require("../middleware/valid");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/register', valid_1.validRegister, authCtrl_1.default.register);
router.post('/active', authCtrl_1.default.activeAccount);
router.post('/login', authCtrl_1.default.login);
router.get('/logout', auth_1.default, authCtrl_1.default.logout);
router.get('/refresh_token', authCtrl_1.default.refreshToken);
router.post('/google_login', authCtrl_1.default.googleLogin);
router.post('/facebook_login', authCtrl_1.default.facebookLogin);
router.post('/forgot_password', authCtrl_1.default.forgotPassword);
exports.default = router;
//# sourceMappingURL=authRouter.js.map