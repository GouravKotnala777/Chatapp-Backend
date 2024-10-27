import express from "express";
import connectDatabase from "./config/db";
import userRouter from "./routers/userRouter";
import { config } from "dotenv";
import bodyParser from "body-parser";
import errorMiddleware from "./middlewares/errorMiddleware";
import chatRouter from "./routers/chatRouter";
import cookieParser from "cookie-parser";
import messageRouter from "./routers/messageRouter";
import cors from "cors";

const app = express();
const PORT = 8000;

config({path:"./.env"});

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

connectDatabase();

app.use("/api/v1/user", userRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
app.get("/api/v1/test", (req, res) => {
    res.status(200).json({success:true, message:{
        port:PORT,
        url:process.env.CLIENT_URL
    }})
});


app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("listening....");
});