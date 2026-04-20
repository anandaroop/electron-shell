import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});

app.listen(3001, () => {
  console.log("Express server listening on http://localhost:3001");
});
