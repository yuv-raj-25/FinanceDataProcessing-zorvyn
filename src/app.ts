import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;