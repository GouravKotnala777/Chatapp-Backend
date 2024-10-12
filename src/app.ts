import express from "express";
import connectDatabase from "./config/db";
import userRouter from "./routers/userRouter";

const app = express();
const PORT = 8000;

connectDatabase();

app.use("/user", userRouter);

app.listen(PORT, () => {
    console.log("listening....");
});