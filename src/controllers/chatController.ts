import { NextFunction, Request, Response } from "express";
import Chat from "../models/chatModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import Message from "../models/messageModel";
import { AuthenticatedRequestTypes } from "../types/types";
import mongoose from "mongoose";

export const createChat = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        const {chatName, members, description, isGroupChat}:{chatName:string; members:string[]; description:string; isGroupChat:boolean;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({userID, chatName, members, description, isGroupChat});

        if (!chatName || !description) return next(new ErrorHandler("All fields are required", 400));
        if (members.length < 2) return next(new ErrorHandler("atleast two members are required", 400));

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
        const userID = (req as AuthenticatedRequestTypes).user._id;

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
export const singleChatMessages = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            chatID
        } = req.params;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));

        const selectedChatMessages = await Message.find({
            chatID,
            deletedFor:{$nin:[userID]}
        });

        res.status(200).json({success:true, message:selectedChatMessages});
    } catch (error) {
        next(error);
    }
};
export const updateChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatName, members, description}:{chatName?:string; members?:string[]; description?:string;} = req.body;
        const {chatID} = req.params;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));
        if (!chatName && !members && !description) return next(new ErrorHandler("All fields are empty, there is no field for update", 400));

        const updatingChat = await Chat.findByIdAndUpdate(chatID, {
            ...(chatName&&{chatName}),
            ...(members&&{members}),
            ...(description&&{description})
        });

        res.status(200).json({success:true, message:updatingChat});
    } catch (error) {
        next(error);
    }
};
export const addRemoveAdmin = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {memberID, chatID}:{memberID:mongoose.Schema.Types.ObjectId, chatID:string;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));
        
        const isChatExist = await Chat.findByIdAndUpdate(chatID);
        
        if (!isChatExist) return next(new ErrorHandler("Chat not exist", 404));

        const findUserResult = isChatExist.admin.find((userId) => userId.toString() === userID.toString());
        const isMemberAlreadyAnAdmin = isChatExist.admin.find((userId) => userId.toString() === memberID.toString());


        if (findUserResult) {
            if (isMemberAlreadyAnAdmin) {
                const filterMemberFromAdmin = isChatExist.admin.filter((userId) => userId.toString() !== memberID.toString());
                if (filterMemberFromAdmin.length === 0) {
                    return next(new ErrorHandler("You have to make admin someone else, before leaving group", 400));
                }
                else{
                    isChatExist.admin = filterMemberFromAdmin;       
                }
            }
            else{
                isChatExist.admin.push(memberID);    
            }
        }
        else{
            return next(new ErrorHandler("Only admin can make another user admin", 401));
        }

        await isChatExist.save();

        res.status(200).json({success:true, message:"new admin added"});
    } catch (error) {
        next(error);
    }
};
export const deleteChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID} = req.params;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));

        const deletingChat = await Chat.findByIdAndDelete(chatID);

        res.status(200).json({success:true, message:deletingChat});
    } catch (error) {
        next(error);
    }
};
