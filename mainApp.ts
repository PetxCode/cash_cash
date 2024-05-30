import { Application, Request, Response } from "express";
import user from "./router/userRouter";
import transactions from "./router/walletRouter";

export const mainApp = async (app: Application) => {
  try {
    app.use("/api/v1", user);
    app.use("/api/v1", transactions);

    app.use("/", (req: Request, res: Response) => {
      return res.status(200).json({
        message: "Awesome",
      });
    });
  } catch (error) {
    console.error(error);
  }
};
