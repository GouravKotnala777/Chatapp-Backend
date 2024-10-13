import express from "express";
import connectDatabase from "./config/db";
import userRouter from "./routers/userRouter";
import { config } from "dotenv";
import bodyParser from "body-parser";
import errorMiddleware from "./middlewares/errorMiddleware";

const app = express();
const PORT = 8000;

config({path:"./.env"});


app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

connectDatabase();

app.use("/api/v1/user", userRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("listening....");
});