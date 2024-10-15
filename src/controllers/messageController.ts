import { NextFunction, Request, Response } from "express";
import Message, { MessageStatusType, MessageType, MessageTypes } from "../models/messageModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ObjectId } from "mongoose";

export const createMessage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            sender, chatID, content, attachment, messageType, messageStatus, isForwarded
        }:{sender:string; chatID:string; content:string; attachment:string[]; messageType:MessageType; messageStatus:MessageStatusType; isForwarded:string;} = req.body;

        console.log({sender, chatID, content, attachment, messageType, messageStatus, isForwarded});

        if (!sender || !chatID || !content || !attachment || !messageType || !messageStatus || !isForwarded) return next(new ErrorHandler("All fields are required", 400));

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
        }:{messageID:string[]} = req.body;
        const userID = "fghjlkjhgfghjkllkjhv";

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
            messageID
        }:{messageID:string[]} = req.body;
        const selectedUserIDs = ["fghjlkjhgfghjkllkjhv"];

        console.log({selectedUserIDs, messageID});

        if (messageID.length === 0) return next(new ErrorHandler("messageID array is empty", 400));

        let deletedForMe:MessageTypes[]|null = [];
        let newSelectedUsers:ObjectId[] = [];

        
        messageID.forEach(async (msgID) => {
            const selectedMessage = await Message.findById(msgID);

            selectedMessage?.deletedFor.forEach((userId) => {
                if (userId.toString() in selectedUserIDs) {
                    console.log("-------------");
                    console.log("userId pahle se thi");
                    console.log("-------------");
                }
                else{
                    newSelectedUsers.push(userId);
                }
            })
            
            deletedForMe = await Message.findByIdAndUpdate(msgID, {
                deletedFor:[...(selectedMessage?.deletedFor as ObjectId[]), ...newSelectedUsers]
            })
        });


        res.status(200).json({success:true, message:"deletedForAll completed"});
    } catch (error) {
        next(error);
    }
};
//export const singleChatMessages = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {
//            sender, chatID, content, attachment, messageType, messageStatus, isForwarded
//        }:{sender:string; chatID:string; content:string; attachment:string[]; messageType:MessageType; messageStatus:MessageStatusType; isForwarded:string;} = req.body;

//        console.log({sender, chatID, content, attachment, messageType, messageStatus, isForwarded});

//        if (!sender || !chatID || !content || !attachment || !messageType || !messageStatus || !isForwarded) return next(new ErrorHandler("All fields are required", 400));

//        const creatingMessage = await Message.create({
//            sender, chatID, content, attachment, messageType, messageStatus, isForwarded
//        });

//        res.status(200).json({success:true, message:creatingMessage});
//    } catch (error) {
//        next(error);
//    }
//};