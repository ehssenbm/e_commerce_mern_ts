"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken_1 = require("../config/generateToken");
const google_auth_library_1 = require("google-auth-library");
const userModel_2 = __importDefault(require("../models/userModel"));
//import fetch from 'node-fetch'
const client = new google_auth_library_1.OAuth2Client(`${process.env.MAIL_CLIENT_ID}`);
const CLIENT_URL = `${process.env.BASE_URL}`;
const authCtrl = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email, password, phone } = req.body;
            const user = yield userModel_1.default.findOne({ email });
            if (user)
                return res.status(400).json({ msg: 'Email or Phone number already exists.' });
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const newUser = { name, email, phone, password: passwordHash };
            const newUserModel = new userModel_2.default(newUser);
            yield newUserModel.save();
            const active_token = (0, generateToken_1.generateActiveToken)({ newUser });
            res.status(201).json({ message: 'success user ', newUserModel });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    activeAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { active_token } = req.body;
            const decoded = jsonwebtoken_1.default.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`);
            const { newUser } = decoded;
            if (!newUser)
                return res.status(400).json({ msg: "Invalid authentication." });
            const user = yield userModel_1.default.findOne({ email: newUser.email });
            if (user)
                return res.status(400).json({ msg: "Account already exists." });
            const new_user = new userModel_1.default(newUser);
            yield new_user.save();
            res.json({ msg: "Account has been activated!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield userModel_1.default.findOne({ email });
            if (!user)
                return res.status(400).json({ msg: 'This email does not exits.' });
            // if user exists
            loginUser(user, password, res);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication." });
        try {
            res.clearCookie('refreshtoken', { path: `/api/refresh_token` });
            yield userModel_1.default.findOneAndUpdate({ _id: req.user._id }, {
                rf_token: ''
            });
            return res.json({ msg: "Logged out!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token)
                return res.status(400).json({ msg: "Please login now!" });
            const decoded = jsonwebtoken_1.default.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`);
            if (!decoded.id)
                return res.status(400).json({ msg: "Please login now!" });
            const user = yield userModel_1.default.findById(decoded.id).select("-password +rf_token");
            if (!user)
                return res.status(400).json({ msg: "This email does not exist." });
            if (rf_token !== user.rf_token)
                return res.status(400).json({ msg: "Please login now!" });
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id }, res);
            yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
                rf_token: refresh_token
            });
            res.json({ access_token, user });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    googleLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id_token } = req.body;
            const verify = yield client.verifyIdToken({
                idToken: id_token, audience: `${process.env.MAIL_CLIENT_ID}`
            });
            const { email, email_verified, name, picture } = verify.getPayload();
            if (!email_verified)
                return res.status(500).json({ msg: "Email verification failed." });
            const password = email + 'your google secrect password';
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ email: email });
            if (user) {
                loginUser(user, password, res);
            }
            else {
                const user = {
                    name,
                    email: email,
                    password: passwordHash,
                    avatar: picture,
                    type: 'google'
                };
                registerUser(user, res);
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    facebookLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { accessToken, userID } = req.body;
            const URL = `
        https://graph.facebook.com/v3.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}
      `;
            const data = yield fetch(URL)
                .then(res => res.json())
                .then(res => { return res; });
            const { email, name, picture } = data;
            const password = email + 'your facebook secrect password';
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ email: email });
            if (user) {
                loginUser(user, password, res);
            }
            else {
                const user = {
                    name,
                    email: email,
                    password: passwordHash,
                    avatar: picture.data.url,
                    type: 'facebook'
                };
                registerUser(user, res);
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    forgotPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const user = yield userModel_1.default.findOne({ email });
            if (!user)
                return res.status(400).json({ msg: 'This email does not exist.' });
            if (user.type !== 'register')
                return res.status(400).json({
                    msg: `Quick login email with ${user.type} can't use this function.`
                });
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const url = `${CLIENT_URL}/reset_password/${access_token}`;
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
};
const loginUser = (user, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        let msgError = user.type === 'register'
            ? 'Password is incorrect.'
            : `Password is incorrect. This email login with ${user.type}`;
        return res.status(400).json({ msg: msgError });
    }
    const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id }, res);
    yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
        rf_token: refresh_token
    });
    res.json({
        msg: 'Login Success!',
        access_token,
        user: Object.assign(Object.assign({}, user._doc), { password: '' })
    });
});
const registerUser = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new userModel_1.default(user);
    const access_token = (0, generateToken_1.generateAccessToken)({ id: newUser._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: newUser._id }, res);
    newUser.rf_token = refresh_token;
    yield newUser.save();
    res.json({
        msg: 'Login Success!',
        access_token,
        user: Object.assign(Object.assign({}, newUser._doc), { password: '' })
    });
});
exports.default = authCtrl;
//# sourceMappingURL=authCtrl.js.map