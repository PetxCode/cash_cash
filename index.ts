import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { mainApp } from "./mainApp";
import { dbConfig } from "./utils/dbConfig";
import { IncomingMessage, ServerResponse, Server } from "node:http";

const app: Application = express();
const port: number | string = process.env.PORT || 2244;

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json());

mainApp(app);
const server: Server<typeof IncomingMessage, typeof ServerResponse> =
  app.listen(port, () => {
    console.clear();

    dbConfig();
  });

process.on("uncaughtException", (error: Error) => {
  console.log("uncaughtException: ", error);

  process.exit(0);
});

process.on("uncaughtException", (reason: any) => {
  console.log("uncaughtException: ", reason);

  server.close(() => {
    process.exit(0);
  });
});
