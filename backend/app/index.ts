import dotenv from "dotenv";
dotenv.config();

import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Server working ✅");
});

export default app;
