"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authRouter_1 = __importDefault(require("./authRouter"));
const categoryRouter_1 = __importDefault(require("./categoryRouter"));
const productRouter_1 = __importDefault(require("./productRouter"));
const userRouter_1 = __importDefault(require("./userRouter"));
const routes = [
    authRouter_1.default,
    userRouter_1.default,
    productRouter_1.default,
    categoryRouter_1.default
];
exports.default = routes;
//# sourceMappingURL=index.js.map