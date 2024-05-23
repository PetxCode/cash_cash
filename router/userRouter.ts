import { Router } from "express";
import {
  createUser,
  getUser,
  signInUser,
  verifyUser,
} from "../controller/userController";

const router: Router = Router();

router.route("/register").post(createUser);
router.route("/sign-in").post(signInUser);

router.route("/verify-user/:userID").patch(verifyUser);
router.route("/view-user/:userID").get(getUser);

export default router;
