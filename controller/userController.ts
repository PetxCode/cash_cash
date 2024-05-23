import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import userModel from "../model/userModel";
export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, accountNumber, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const code = crypto.randomBytes(2).toString("hex");
    const verify = crypto.randomBytes(7).toString("hex");

    const hashVerifyCode = await bcrypt.hash(verify, salt);

    if (accountNumber) {
      const user = await userModel.create({
        accountNumber,
        email,
        password: hash,
        code,
        verifyCode: hashVerifyCode,
      });

      return res.status(201).json({
        status: 201,
        message: "creating",
        data: user,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Please Provide your Phone Number",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error creating",
      error: error.message,
    });
  }
};

export const signInUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (user) {
      const check = await bcrypt.compare(password, user.password);

      if (check) {
        if (user.verify && user.verifyCode === "") {
          const token = jwt.sign(
            {
              id: user._id,
            },
            "openSECRET",
            { expiresIn: "1h" }
          );
          return res.status(201).json({
            status: 201,
            message: "sign in successfully",
            data: token,
          });
        } else {
          return res.status(404).json({
            status: 404,
            message: "You should go and verify your account",
          });
        }
      } else {
        return res.status(404).json({
          status: 404,
          message: "error with password",
        });
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: "error with Email ",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error sign in ",
      error: error.message,
    });
  }
};

export const getUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userID } = req.params;

    const user = await userModel.findById(userID);

    return res.status(200).json({
      status: 200,
      message: "user details",
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error reading user details",
      error: error.message,
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userID, token } = req.params;
    const { code } = req.body;

    // const openToken = jwt.verify(token, "openSECRET", (error, data) => {
    //   if (error) throw error;

    //   return data;
    // });

    const user = await userModel.findById(userID);

    if (user?.code === code) {
      await userModel.findByIdAndUpdate(
        userID,
        {
          verify: true,
          verifyCode: "",
        },
        { new: true }
      );

      return res.status(201).json({
        status: 201,
        message: "user's account verified successfully",
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "something went wrong with your code",
      });
    }
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error sign in ",
      error: error.message,
    });
  }
};

// export const signInUser = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     return res.status(201).json({
//       status: 201,
//       message: "sign in successfully",
//     });
//   } catch (error) {
//     return res.status(404).json({
//       status: 404,
//       message: "error sign in ",
//       error: error.message,
//     });
//   }
// };
