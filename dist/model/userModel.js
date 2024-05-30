"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userModel = new mongoose_1.Schema({
    accountNumber: {
        type: Number,
        unique: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    platformName: {
        type: String,
        default: "AJ Cash",
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    code: {
        type: String,
    },
    verifyCode: {
        type: String,
    },
    avatar: {
        type: String,
    },
    avatarID: {
        type: String,
    },
    verify: {
        type: Boolean,
        default: false,
    },
    walletBalance: {
        type: Number,
        default: 0,
    },
    history: {
        type: [],
        default: [],
    },
    transactionHistory: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "walletTransactions",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("users", userModel);
