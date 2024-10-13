import express from "express";
import connectDatabase from "./config/db";
import userRouter from "./routers/userRouter";
import { config } from "dotenv";

const app = express();
const PORT = 8000;

config({path:"./.env"});

connectDatabase();

app.use("/api/v1/user", userRouter);

app.listen(PORT, () => {
    console.log("listening....");
});