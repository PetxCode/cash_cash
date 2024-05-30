"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_1 = require("../controller/walletController");
const router = (0, express_1.Router)();
router.route("/transaction/:userID/:beneficiaryID").post(walletController_1.transferToWallet);
// Paystack
router.route("/deposite-funds/:userID").post(walletController_1.depositeFund);
router.route("/verify-deposite/:userID/:reference").get(walletController_1.verifyDeposite);
// Flatterwave
router.route("/deposite-my-fund/:userID").post(walletController_1.initializeTransaction);
router.route("/verify-my-deposite/:userID/:reference").get(walletController_1.verifyTransaction);
// PayOut
router.route("/payout/:userID/").post(walletController_1.accountPayout);
router.route("/verify-my-payout/:userID/:payoutID").get(walletController_1.verifyAccountPayout);
// Bills
router.route("/buy-airtime/:userID/").post(walletController_1.initiateBillPaymentForAirTime);
exports.default = router;
// "account_bank": "057",
// "account_number": "1015889202",
// "amount": "500" ,
// "narration": "Just a test Transfer"
