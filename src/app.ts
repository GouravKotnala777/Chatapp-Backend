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
import {v2 as cloudinary} from "cloudinary";
import http from "http";
import { Server } from "socket.io";
import { MessageTypesPopulated } from "./models/messageModel";
import User, { UserTypes } from "./models/userModel";

config({path:"./.env"});

const app = express();
const PORT = 8000;
const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin:process.env.CLIENT_URL,
        methods:["GET", "POST"],
        credentials:true
    }
});

app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key:process.env.CLOUDINARY_API_KEY as string,
    api_secret:process.env.CLOUDINARY_API_SECRET as string
});

connectDatabase();

app.use("/uploads", express.static("uploads"));
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

let users:{[key:string]:{socketID:string; userName:string;}} = {};

io.on("connection", async(socket) => {
    socket.on("registerUser", ({userID, userName}) => {
        //console.log({userID, userName});
        
        if (userID) {
            users[userID] = {socketID:socket.id, userName}
            console.log("New user :");
            console.log(socket.id);

            //socket.on("isOnline", (userID, callback) => {
            //    const socketID = users[userID]?.socketID;
            //    if (socketID) {
            //        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 1");
            //        callback({ success: true, socketID });
            //        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 2");
            //    } else {
            //        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 1");
            //        callback({ success: false, message: "User not connected" });
            //        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 2");
            //    }
            //});

            //const user = User.findByIdAndUpdate(userID, {
            //    socketID:socket.id
            //});



            if (userID === "673dae22baca9fe9bbaae2bc") {
                console.log("::::::::::::::::::::::: 1");
                console.log("YE MAI HI HOON ISSE NAHI BHEJNA HAI");
                console.log("::::::::::::::::::::::: 2");
                
            }
            else{
                console.log("::::::::::::::::::::::: 1");
                io.to([users["673dae22baca9fe9bbaae2bc"]?.socketID]).emit("setIsOnline", { success: true, socketID:socket.id });
                console.log("::::::::::::::::::::::: 2");
            }
        }
    });

    socket.on("isOnline", (userID, callback) => {
        const socketID = users[userID]?.socketID;
        if (socketID) {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 1");
            callback({ success: true, socketID });
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 2");
        } else {
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 1");
            callback({ success: false, message: "User not connected" });
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 2");
        }
    });

    socket.on("messageSent", ({message, receivers}:{message:MessageTypesPopulated; receivers:UserTypes[];}) => {
        //console.log("sender => "+ message.sender);
        //console.log("receivers => "+ receivers);
        //console.log("message => "+message.content?.contentMessage);
        io.to(receivers.map(item => users[item._id.toString()].socketID)).emit("messageReceived", {message, receivers});
    })


    socket.on("disconnect", () => {
        for (let userID in users) {
            if (users[userID].socketID === socket.id) {
                delete users[userID];
                console.log("User left :");
                console.log(`index = ${userID}, socketID = ${users[userID]?.socketID}`);
                if (userID === "673dae22baca9fe9bbaae2bc") {
                    console.log(";;;;;;;;;;;;;;;;;;;;;;; 1");
                    console.log("YE MAI HI HOON ISSE NAHI HATANA HAI");
                    console.log(";;;;;;;;;;;;;;;;;;;;;;; 2");
                    
                }
                else{
                    console.log(";;;;;;;;;;;;;;;;;;;;;;; 1");
                    //io.to([users["673dae22baca9fe9bbaae2bc"]?.socketID]).emit("setIsOnline", { success: false, message:"member is offline" });
                    io.emit("setIsOnline", { success: false, message:"member is offline" });
                    console.log(";;;;;;;;;;;;;;;;;;;;;;; 2");
                }
                break;
            }            
        }
    });
})

server.listen(PORT, () => {
    console.log("listening....");
});

export const sendMessageToSocketId = ({userIDs, eventName, message}:{userIDs:string[]; eventName:string; message:string|Record<string, unknown>;}) => {
    if (io) {
        const socketIDArray = userIDs.map((id) => {
            console.log("GGGGGGGGGGGGGGG (1)");
            console.log(id);
            console.log(users[id]?.socketID);
            console.log("GGGGGGGGGGGGGGG (2)");
            
            return users[id]?.socketID;
        });
        io.to(socketIDArray.filter((sktID) => sktID&&sktID)).emit(eventName, message);
    }
    else{
        console.log(`socket.io not initialized`);
    }
};