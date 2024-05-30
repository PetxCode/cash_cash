import nodemail from "nodemailer";
import { google } from "googleapis";
import ejs from "ejs";
import path from "path";
import jwt from "jsonwebtoken";
import env from "dotenv";
import userModel from "../model/userModel";
env.config();

const GOOGLE_ID = process.env.GOOGLE_ID;
const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
const GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
const GOOGLE_REFRESH = process.env.GOOGLE_REFRESH;

const oAuth = new google.auth.OAuth2(
  GOOGLE_ID,
  GOOGLE_SECRET,
  GOOGLE_REDIRECT_URL
);

oAuth.setCredentials({ refresh_token: GOOGLE_REFRESH });

const url: string = "http";

export const verifiedEmail = async (user: any) => {
  try {
    const accessToken: any = (await oAuth.getAccessToken()).token;

    const transporter = nodemail.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "codelabbest@gmail.com",
        clientSecret: GOOGLE_SECRET,
        clientId: GOOGLE_ID,
        refreshToken: GOOGLE_REFRESH,
        accessToken,
      },
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      "secretCode",
      {
        expiresIn: "5m",
      }
    );

    const timer = setTimeout(async () => {
      const getUser: any = await userModel.findById(user._id);

      if (!getUser.verify) {
        await userModel.findByIdAndDelete(getUser._id);
      }
      clearTimeout(timer);
    }, 5 * 60 * 1000);

    let frontEndURL: string = `${url}/${token}/sign-in`;
    let devURL: string = `${url}/auth/api/verify-user/${token}`;

    const myPath = path.join(__dirname, "../views/index.ejs");
    const html = await ejs.renderFile(myPath, {
      link: devURL,
      tokenCode: user?.enrollmentID,
      userName: user?.userName,
    });

    const mailerOption = {
      from: "AJ CASH <codelabbest@gmail.com>",
      to: user.email,
      subject: "Account Verification",
      html,
    };

    await transporter.sendMail(mailerOption);
  } catch (error) {
    console.error();
  }
};
