import { NextFunction, Request, Response } from "express";
import Message, { MessageStatusType, MessageType, MessageTypes } from "../models/messageModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ObjectId } from "mongoose";
import { AuthenticatedRequestTypes } from "../types/types";
import Chat from "../models/chatModel";

export const createMessage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            sender, chatID, content, attachment, messageType, messageStatus, isForwarded
        }:{sender:string; chatID:string; content:string; attachment:string[]; messageType:MessageType; messageStatus:MessageStatusType; isForwarded:string;} = req.body;

        console.log({sender, chatID, content, attachment, messageType, messageStatus, isForwarded});

        if (!sender || !chatID || !messageType || !messageStatus) return next(new ErrorHandler("All fields are required", 400));

        const creatingMessage = await Message.create({
            sender, chatID, content, attachment, messageType, messageStatus, isForwarded
        });

        res.status(200).json({success:true, message:creatingMessage});
    } catch (error) {
        next(error);
    }
};
export const deleteMessagesForMe = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            messageID
        }:{messageID:string[];} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({userID, messageID});

        if (messageID.length === 0) return next(new ErrorHandler("messageID array is empty", 400));

        let deletedForMe:MessageTypes[]|null = [];

        messageID.forEach(async (msgID) => {
            deletedForMe = await Message.findByIdAndUpdate(msgID, {
                $push:{deletedFor:userID}
            })
        });

        res.status(200).json({success:true, message:deletedForMe});
    } catch (error) {
        next(error);
    }
};
export const deleteMessagesForAll = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            messageID, chatID
        }:{messageID:string[]; chatID:string;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({messageID});

        if (messageID.length === 0) return next(new ErrorHandler("messageID array is empty", 400));
        
        messageID.forEach(async (msgID) => {
            const selectedMessage = await Message.findById(msgID);

            if (selectedMessage?.sender.toString() === userID.toString()) {
                const messageParentChat = await Chat.findById(chatID);

                if (!messageParentChat) return next(new ErrorHandler("Chat not found", 404));
                if (messageParentChat.members.length < 2) return next(new ErrorHandler("there are less than 2 members in this chat", 404));
                const chatAllMembers = messageParentChat.members;

                selectedMessage.deletedFor = chatAllMembers;
                await selectedMessage.save();
            }
            else{
                console.log(`${msgID} is not created by you!`);
            }
        });

        res.status(200).json({success:true, message:"deletedForAll completed"});
    } catch (error) {
        next(error);
    }
};
//export const singleChatMessages = async(req:Request, res:Response, next:NextFunction) => {
//    try {

//        res.status(200).json({success:true, message:creatingMessage});
//    } catch (error) {
//        next(error);
//    }
//};