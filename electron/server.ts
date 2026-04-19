import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from Express!" });
});

const port = Number(process.env.EXPRESS_PORT) || 3001;

app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});
