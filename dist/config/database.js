"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const URI = process.env.MONGODB_URL;
mongoose_1.default
    .connect(process.env.URLDBMONGO || `${URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
})
    .then((db) => {
    console.log("Database Connected Successfuly.");
})
    .catch((err) => {
    console.log("Error Connectiong to the Database");
});
//# sourceMappingURL=database.js.map