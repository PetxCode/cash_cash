import { Router } from "express";
import {
  depositeFund,
  initializeTransaction,
  accountPayout,
  transferToWallet,
  verifyDeposite,
  verifyAccountPayout,
  verifyTransaction,
  initiateBillPaymentForAirTime,
} from "../controller/walletController";

const router: Router = Router();
router.route("/transaction/:userID/:beneficiaryID").post(transferToWallet);

// Paystack
router.route("/deposite-funds/:userID").post(depositeFund);
router.route("/verify-deposite/:userID/:reference").get(verifyDeposite);

// Flatterwave

router.route("/deposite-my-fund/:userID").post(initializeTransaction);
router.route("/verify-my-deposite/:userID/:reference").get(verifyTransaction);

// PayOut
router.route("/payout/:userID/").post(accountPayout);
router.route("/verify-my-payout/:userID/:payoutID").get(verifyAccountPayout);

// Bills
router.route("/buy-airtime/:userID/").post(initiateBillPaymentForAirTime);

export default router;

// "account_bank": "057",
// "account_number": "1015889202",
// "amount": "500" ,
// "narration": "Just a test Transfer"
