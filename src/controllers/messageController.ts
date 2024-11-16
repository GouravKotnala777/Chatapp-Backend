import { NextFunction, Request, Response } from "express";
import Message, { MessageStatusType, MessageTypes, MessageTypesPopulated } from "../models/messageModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { AuthenticatedRequestTypes } from "../types/types";
import Chat from "../models/chatModel";
import Content, { ContentMessageType } from "../models/contentModel";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/util";

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
            sender, chatID, attachment:[], messageStatus, isForwarded, deletedFor:[], createdAt, updatedAt, content:{contentMessage, contentType, createdBy, isForwarded, createdAt, updatedAt}
        }

        
        res.status(200).json({success:true, message:transformedMessageData});
    } catch (error) {
        console.log(error);
        
        next(error);
    }
};
export const sendImage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {messageType, chatID}:{messageType:ContentMessageType; chatID:mongoose.Schema.Types.ObjectId;} = req.body;
        const attachment = req.file;
        const userID = (req as AuthenticatedRequestTypes).user._id;
        

        console.log({attachment});

        
        if (!attachment) return next(new ErrorHandler("All fields are required", 400));

        const cloudinaryRes = await uploadOnCloudinary(attachment.path, "Chatapp1/images");

        console.log({cloudinaryRes});


        // ------------------------------------------

        const creatingContent = await Content.create({
            contentMessage:cloudinaryRes?.secure_url,
            contentType:messageType,
            createdBy:userID,
            isForwarded:false
        });

        console.log(creatingContent);
        if (!creatingContent) return next(new ErrorHandler("Internal server error", 500));

        const creatingMessage = await Message.create({
            sender:userID, chatID, content:null, attachment:[creatingContent._id], messageStatus:"sent", isForwarded:false
        });
        

        const {contentMessage, contentType, createdBy, isForwarded, createdAt, updatedAt} = creatingContent;
        const transformedMessageData:MessageTypesPopulated = {
            sender:userID, chatID, attachment:[{contentMessage, contentType, createdBy, isForwarded, createdAt, updatedAt}], messageStatus:"sent", isForwarded, deletedFor:[], createdAt, updatedAt
        }
        // ---------------------------------------
        
        
        res.status(200).json({success:true, message:transformedMessageData});
    } catch (error) {
        console.log(error);
        
        next(error);
    }
};
export const forwardMessage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            memberIDs, contentID, attachment, messageStatus
        }:{memberIDs:string[]; contentID:string[]; attachment:string[]; messageType:ContentMessageType; messageStatus:MessageStatusType; isForwarded:boolean;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({memberIDs, contentID, attachment, messageStatus});

        if (!messageStatus) return next(new ErrorHandler("All fields are required", 400));
        if (contentID.length === 0 && attachment.length === 0) return next(new ErrorHandler("there is no content or attachment to forward", 400));
        if (memberIDs.length === 0) return next(new ErrorHandler("there is no member to forward", 400));
        
        const findChats = await Promise.all(
            memberIDs.map(async(mmbrID) => {
                const isChatExist = await Chat.findOne({
                    isGroupChat:false,
                    members:{
                        $all:[mmbrID, userID]
                    }
                });

                if (!isChatExist) {
                    const createNewChat = await Chat.create({
                        chatName:"chatName",
                        admin:"",
                        description:"",
                        members:[userID, mmbrID],
                        isGroupChat:false,
                        createdBy:userID
                    });
                    
                    return createNewChat._id;
                }

                return isChatExist._id;
            })
        );

        if (contentID.length !== 0) {
            findChats.forEach(async(chtID) => {
                contentID.forEach(async(cntntID) => {
                    const createForwardedMessage = await Message.create({
                        chatID:chtID,
                        sender:userID,
                        content:cntntID,
                        attachment:[],
                        deletedFor:[],
                        isForwarded:true,
                        messageStatus:"sent"
                    })
                })
            });
        }
        if (attachment.length !== 0) {
            findChats.forEach(async(chtID) => {
                attachment.forEach(async(atchmnt) => {
                    const createForwardedMessage = await Message.create({
                        chatID:chtID,
                        sender:userID,
                        content:"",
                        attachment:atchmnt,
                        deletedFor:[],
                        isForwarded:true,
                        messageStatus:"sent"
                    })
                })
            });
        }

        //const isChatExist = await Chat.findById(chatID);
        
        //if (!isChatExist) return next(new ErrorHandler("Chat not exist", 404));

        //contentID.forEach(async (cntnt) => {
        //    const creatingMessage = await Message.create({
        //        sender, chatID, content:cntnt, attachment, messageStatus, isForwarded:true
        //    });
        //});

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



        const deletedForMe = (await Promise.all(
            messageID.map(async (msgID) => {
                const deleteForMe = await Message.findByIdAndUpdate(msgID, {
                    $push:{deletedFor:userID}
                });
                return deleteForMe?._id;
            })
        )).filter((result) => result !== undefined);

        console.log({deletedForMe});
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
        
        const arrayOfMessageIDs = (await Promise.all(
            messageID.map(async(msgID) => {
                const selectedMessage = await Message.findById(msgID);
                if (selectedMessage) {
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
                }
                return selectedMessage?._id;
            })
        )).filter((result) => result !== undefined);

        res.status(200).json({success:true, message:arrayOfMessageIDs});
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