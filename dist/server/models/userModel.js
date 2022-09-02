"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
        trim: true,
        maxLength: [20, "Your name is up to 20 chars long."]
    },
    email: {
        type: String,
        required: [true, "Please add your email "],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please add your password"]
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
    },
    phone: {
        type: String,
        required: [true, "Please add your phone "],
        trim: true,
        unique: true
    },
    role: {
        type: String,
        default: 'user' // admin 
    },
    type: {
        type: String,
        default: 'register' // login
    },
    rf_token: { type: String, select: false }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('user', userSchema);
//# sourceMappingURL=userModel.js.map