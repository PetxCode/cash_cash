"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const walletTransactionModel = new mongoose_1.Schema({
    bankAccount: {
        type: String,
    },
    bankName: {
        type: String,
    },
    transactionType: {
        type: String,
    },
    description: {
        type: String,
    },
    amount: {
        type: Number,
    },
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: "users",
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("walletTransactions", walletTransactionModel);
