"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mainApp_1 = require("./mainApp");
const dbConfig_1 = require("./utils/dbConfig");
const app = (0, express_1.default)();
const port = process.env.PORT || 2244;
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
(0, mainApp_1.mainApp)(app);
const server = app.listen(port, () => {
    console.clear();
    (0, dbConfig_1.dbConfig)();
});
process.on("uncaughtException", (error) => {
    console.log("uncaughtException: ", error);
    process.exit(0);
});
process.on("uncaughtException", (reason) => {
    console.log("uncaughtException: ", reason);
    server.close(() => {
        process.exit(0);
    });
});
