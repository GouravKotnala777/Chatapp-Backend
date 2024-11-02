import { NextFunction, Request, Response } from "express";
import Message, { MessageStatusType, MessageTypes, MessageTypesPopulated } from "../models/messageModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { AuthenticatedRequestTypes } from "../types/types";
import Chat from "../models/chatModel";
import Content, { ContentMessageType } from "../models/contentModel";
import mongoose from "mongoose";

export const createMessage = async(req:Request, res:Response, next:NextFunction) => {
    try {

        
        const {
            sender, chatID, content, attachment, messageType, messageStatus
        }:{sender:mongoose.Schema.Types.ObjectId; chatID:mongoose.Schema.Types.ObjectId; content:mongoose.Schema.Types.ObjectId; attachment:string[]; messageType:ContentMessageType; messageStatus:MessageStatusType;} = req.body;
        

        console.log({sender, chatID, content, attachment, messageType, messageStatus});

        
        if (!sender || !chatID || !messageType || !messageStatus) return next(new ErrorHandler("All fields are required", 400));

        
        const creatingContent = await Content.create({
            contentMessage:content,
            contentType:messageType,
            createdBy:sender,
            isForwarded:false
        });

        console.log(creatingContent);
        if (!creatingContent) return next(new ErrorHandler("Internal server error", 500));

        const creatingMessage = await Message.create({
            sender, chatID, content:creatingContent._id, attachment, messageStatus, isForwarded:false
        });
        

        const {contentMessage, contentType, createdBy, isForwarded, createdAt, updatedAt} = creatingContent;
        const transformedMessageData:MessageTypesPopulated = {
            sender, chatID, attachment:"l", messageStatus, isForwarded, deletedFor:[], createdAt, updatedAt, content:{contentMessage, contentType, createdBy, isForwarded, createdAt, updatedAt}
        }

        
        res.status(200).json({success:true, message:transformedMessageData});
    } catch (error) {
        console.log(error);
        
        next(error);
    }
};
export const forwardMessage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            sender, chatID, contentID, attachment, messageStatus
        }:{sender:string; chatID:string; contentID:string[]; attachment:string[]; messageType:ContentMessageType; messageStatus:MessageStatusType; isForwarded:string;} = req.body;

        console.log({sender, chatID, contentID, attachment, messageStatus});

        if (!sender || !chatID || !messageStatus) return next(new ErrorHandler("All fields are required", 400));
        if (contentID.length === 0) return next(new ErrorHandler("there is no content to forward", 400));
        
        const isChatExist = await Chat.findById(chatID);
        
        if (!isChatExist) return next(new ErrorHandler("Chat not exist", 404));

        contentID.forEach(async (cntnt) => {
            const creatingMessage = await Message.create({
                sender, chatID, content:cntnt, attachment, messageStatus, isForwarded:true
            });
        });

        res.status(200).json({success:true, message:"message has been forwarded"});
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