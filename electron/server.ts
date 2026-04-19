import express, { Request, Response } from "express";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});
