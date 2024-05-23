import { Document, Schema, Types, model } from "mongoose";
import { iUser } from "../utils/interfaces";

interface iUserData extends iUser, Document {}

const userModel = new Schema<iUserData>(
  {
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
        type: Types.ObjectId,
        ref: "walletTransactions",
      },
    ],
  },
  { timestamps: true }
);
export default model<iUserData>("users", userModel);
