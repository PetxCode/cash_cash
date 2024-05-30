import { Request, Response } from "express";
import userModel from "../model/userModel";
import https from "node:https";
import env from "dotenv";
env.config();
import axios from "axios";
import crypto from "crypto";
import moment from "moment";

export const transferToWallet = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userID, beneficiaryID } = req.params;
    const { amount } = req.body;

    const user = await userModel.findById(userID);
    const beneficiary = await userModel.findById(beneficiaryID);

    if (user && beneficiary) {
      const ref = crypto.randomBytes(3).toString("hex");

      if (user?.walletBalance > amount) {
        await userModel.findByIdAndUpdate(
          userID,
          {
            walletBalance: user.walletBalance - amount,
            history: [
              ...user?.history,
              {
                bank_name: user?.platformName,
                transaction_type: "debit",
                transaction_date: moment(Date.now()).format("llll"),
                credit_Account: `${beneficiary?.accountNumber}`,
                reference: ref,
                amount,
                Beneficiary: `${beneficiary?.firstName} ${beneficiary?.lastName}`,
              },
            ],
          },
          { new: true }
        );
        await userModel.findByIdAndUpdate(
          beneficiaryID,
          {
            walletBalance: beneficiary.walletBalance + amount,
            history: [
              ...beneficiary.history,
              {
                bank_name: user?.platformName,
                transaction_type: "credit",
                transaction_date: moment(Date.now()).format("llll"),
                credit_Account: `${beneficiary?.accountNumber
                  ?.toString()
                  .slice(0, 2)} 
                  
                  ${"*".repeat(4)}

                  ${beneficiary?.accountNumber?.toString().slice(7)}  `,

                receivedFrom: `${user?.firstName} ${user?.lastName}`,
                reference: ref,
                amount,
              },
            ],
          },
          { new: true }
        );

        return res.status(201).json({
          status: 201,
          message: "wallet balance credited successfully",
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Balance not enough",
        });
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: "can't find user",
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

// using Paystack API

export const depositeFund = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const { userID } = req.params;

    const user = await userModel.findById(userID);

    const params = JSON.stringify({
      email: user?.email,
      amount: `${amount * 100}`,
      callback_url: "http://localhost:2244/",
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_ID}`,
        "Content-Type": "application/json",
      },
    };

    const request = https
      .request(options, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          return res.status(201).json({
            status: 201,
            message: "Deposite done",
            data: JSON.parse(data),
          });
        });
      })
      .on("error", (error) => {
        return error;
      });

    request.write(params);
    request.end();
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error sign in ",
      error: error.message,
    });
  }
};

export const verifyDeposite = async (req: Request, res: Response) => {
  try {
    const { reference, userID } = req.params;
    const user: any = await userModel.findById(userID);

    const url = `https://api.paystack.co/transaction/verify/${reference}`;

    await axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_ID}`,
        },
      })
      .then(async (readData) => {
        const check = user?.history?.find((el: any) => {
          return el.reference === reference;
        });

        if (check) {
          return res.status(200).json({
            status: 200,
            message: "deposit data already done",
          });
        } else {
          const history = {
            reference,
            amount: readData?.data?.data?.amount / 100,
            kind: "credit",
          };

          await userModel.findByIdAndUpdate(
            userID,
            {
              walletBalance:
                user?.walletBalance + readData?.data?.data?.amount / 100,
              history: [...user.history, history],
            },
            { new: true }
          );

          return res.status(200).json({
            status: 200,
            message: "deposit data ",
            data: readData?.data,
          });
        }
      });
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "error sign in ",
      error: error.message,
    });
  }
};

// using flutterwave API

export const initializeTransaction = async (req: Request, res: Response) => {
  const { userID } = req.params;
  const { amount } = req.body;

  const user = await userModel.findById(userID);
  const code = crypto.randomBytes(4).toString("hex");
  const data = {
    tx_ref: code,
    amount,
    currency: "NGN",
    redirect_url: "http://localhost:2244/",
    customer: {
      email: user?.email,
      phone: `234${user?.accountNumber}`,
    },
    customizations: {
      title: "Payment for goods",
      description: "Payment for the best goods",
      logo: "https://example.com/logo.png",
    },
  };

  try {
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Handle response
    return res.status(201).json({
      status: 201,
      message: "Deposite done",
      data: response?.data?.data?.link,
    });
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "Deposite error",
      data: error.message,
    });
  }
};

export const verifyTransaction = async (req: Request, res: Response) => {
  try {
    const { reference, userID } = req.params;
    const user: any = await userModel.findById(userID);
    await axios
      .get(`https://api.flutterwave.com/v3/transactions/${reference}/verify`, {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })
      .then(async (readData) => {
        const check = user?.history?.find((el: any) => {
          return el.reference === reference;
        });

        if (check) {
          return res.status(200).json({
            status: 200,
            message: "deposit data already done",
          });
        } else {
          const history = {
            reference,
            amount: readData?.data?.data?.amount / 100,
            kind: "credit",
          };

          await userModel.findByIdAndUpdate(
            userID,
            {
              walletBalance:
                user?.walletBalance + readData?.data?.data?.amount / 100,
              history: [...user.history, history],
            },
            { new: true }
          );

          return res.status(200).json({
            status: 200,
            message: "deposit data ",
            data: readData?.data,
          });
        }
      });

    // Handle response

    // return res.status(201).json({
    //   status: 201,
    //   message: "Deposite done",
    //   data: response.data,
    // });
  } catch (error: any) {
    return res.status(404).json({
      status: 404,
      message: "Deposite verification error",
      data: error.message,
    });
  }
};

// using flutterwave API: Payout

export const accountPayout = async (req: Request, res: Response) => {
  try {
    const { account_bank, account_number, amount, narration } = req.body;
    const { userID } = req.params;

    const user: any = await userModel.findById(userID);

    const data = {
      account_bank,
      account_number,
      amount,
      currency: "NGN",
      narration,
    };

    if (user?.walletBalance! >= amount) {
      await axios
        .post("https://api.flutterwave.com/v3/transfers", data, {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          return res.status(201).json({
            data: response.data,
            message: "payout processing",
          });
        });
    } else {
      return res.status(404).json({
        message: "Account Balance too small",
      });
    }

    // Handle response
  } catch (error: any) {
    return res.status(404).json({
      message: "Account Balance too small",
      error: error,
    });
  }
};

export const verifyAccountPayout = async (req: Request, res: Response) => {
  try {
    const { payoutID } = req.params;
    await axios
      .get(`https://api.flutterwave.com/v3/transfers/${payoutID}`, {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })
      .then((res: any) => {
        console.log(res.data);

        return res.status(200).json({
          message: "Payout successfully",
          data: res.data,
        });
      });

    // Handle response
  } catch (error: any) {
    console.error(
      "Error verifying payout:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// using flutterwave API: Bill Payment

export const initiateBillPaymentForAirTime = async (
  req: Request,
  res: Response
) => {
  try {
    const { amount } = req.body;
    const { userID } = req.params;

    const user = await userModel.findById(userID);
    const code = crypto.randomBytes(6).toString("hex");

    const data = {
      country: "NG",
      customer_id: `0${user?.accountNumber}`,
      amount,
      recurrence: "ONCE",
      type: "AIRTIME", // Type of bill (e.g., AIRTIME, DATA, DSTV, etc.)
      reference: `${moment(Date.now()).format("lll")}-${code}`, // Unique transaction reference
    };

    await axios
      .post("https://api.flutterwave.com/v3/bills", data, {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        return res.status(201).json({
          message: "Airtime Purchased",
          data: response?.data,
        });
      });

    // Handle response
  } catch (error: any) {
    return res.status(404).json({
      message: "Airtime Purchased",
      data: error,
    });
  }
};
