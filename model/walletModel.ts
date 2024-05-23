import { Document, Schema, Types, model } from "mongoose";
import { iWalletTransaction } from "../utils/interfaces";

interface iWalletTransactionData extends iWalletTransaction, Document {}

const walletTransactionModel = new Schema<iWalletTransactionData>(
  {
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
      type: Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);
export default model<iWalletTransactionData>(
  "walletTransactions",
  walletTransactionModel
);
