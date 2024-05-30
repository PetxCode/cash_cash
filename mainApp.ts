import { Application, NextFunction, Request, Response } from "express";
import user from "./router/userRouter";
import transactions from "./router/walletRouter";
import { handleError } from "./error/handleError";
import { HTTP } from "./utils/enums";
import { mainError } from "./error/mianError";

export const mainApp = async (app: Application) => {
  try {
    app.use("/api/v1", user);
    app.use("/api/v1", transactions);

    app.use("/", (req: Request, res: Response) => {
      return res.status(200).json({
        message: "Awesome",
      });
    });

    app.all("*", (req: Request, res: Response, next: NextFunction) => {
      next(
        new mainError({
          name: `Route Error`,
          message: `Route Error: because the page, ${req.originalUrl} doesn't exist`,
          status: HTTP.BAD_REQUEST,
          success: false,
        })
      );
    });

    app.use(handleError);
  } catch (error) {
    console.error(error);
  }
};
