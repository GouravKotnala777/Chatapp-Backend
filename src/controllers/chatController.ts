import { NextFunction, Request, Response } from "express";
import Chat from "../models/chatModel";
import { ErrorHandler } from "../utils/ErrorHandler";

export const createChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatName, members, description, isGroupChat} = req.body;
        const userID = "uoiuytrtyuiopoiuytyu";

        console.log({chatName, members, description, isGroupChat});

        if (!chatName || !members || !description || !isGroupChat) return next(new ErrorHandler("All fields are required", 400));

        const newChat = await Chat.create({
            chatName, members, description, isGroupChat, admin:userID, createdBy:userID
        });

        res.status(200).json({success:true, message:newChat});
    } catch (error) {
        next(error);
    }
};
export const myChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = "uoiuytrtyuiopoiuytyu";

        const myChats = await Chat.find({
            members:{
                $in:[userID]
            }
        });

        res.status(200).json({success:true, message:myChats});
    } catch (error) {
        next(error);
    }
};
export const updateChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatName, admin, members, description}:{chatName?:string; admin?:string[]; members?:string[]; description?:string;} = req.body;
        const {chatID} = req.params;
        const userID = "uoiuytrtyuiopoiuytyu";

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));
        if (!chatName && !admin && !members && !description) return next(new ErrorHandler("All fields are empty", 400));

        const updatingChat = await Chat.findByIdAndUpdate(chatID, {
            chatName, admin, members, description
        });

        res.status(200).json({success:true, message:updatingChat});
    } catch (error) {
        next(error);
    }
};
export const deleteChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID} = req.params;
        const userID = "uoiuytrtyuiopoiuytyu";

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));

        const deletingChat = await Chat.findByIdAndDelete(chatID);

        res.status(200).json({success:true, message:deletingChat});
    } catch (error) {
        next(error);
    }
};