import { Router } from "express";
import {
  depositeFund,
  transferToWallet,
  verifyDeposite,
} from "../controller/walletController";

const router: Router = Router();
router.route("/transaction/:userID/:beneficiaryID").post(transferToWallet);

router.route("/deposite-funds/:userID").post(depositeFund);

router.route("/verify-deposite/:userID/:reference").get(verifyDeposite);

export default router;
