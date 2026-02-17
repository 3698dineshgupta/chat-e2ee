import dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import app from "./backend/app";
import * as db from "./backend/db";
import { initSocket } from "./backend/socket";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await db.connectDb();

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server start error:", err);
  }
}

start();
