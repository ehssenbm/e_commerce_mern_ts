"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const socket_1 = require("./config/socket");
const categoryRouter_1 = __importDefault(require("./routes/categoryRouter"));
// Database
require("./config/database");
const productRouter_1 = __importDefault(require("./routes/productRouter"));
// Middleware
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
// Socket.io
const http = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(http);
exports.io.on("connection", (socket) => {
    (0, socket_1.SocketServer)(socket);
});
// Routes
app.use('/products', productRouter_1.default);
app.use('/api', categoryRouter_1.default);
app.use('/auth', authRouter_1.default);
app.use('/users', userRouter_1.default);
// Production Deploy
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../client', 'build', 'index.html'));
    });
}
// server listenning
const port = 5000;
app.listen(port, () => {
    console.log(`[Server]server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map