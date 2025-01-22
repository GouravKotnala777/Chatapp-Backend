import { NextFunction, Request, Response } from "express";
import Chat from "../models/chatModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import Message from "../models/messageModel";
import { AuthenticatedRequestTypes } from "../types/types";
import mongoose from "mongoose";
import { UserTypes } from "../models/userModel";

export const createChat = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        const {chatName, members, description, isGroupChat}:{chatName:string; members:string[]; description:string; isGroupChat:boolean;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({userID, chatName, members, description, isGroupChat});

        if (!chatName || !description) return next(new ErrorHandler("All fields are required", 400));

        if (isGroupChat === true) {
            
            const newGroupChat = await Chat.create({
                chatName, members:members ? [...(members), userID]:[userID], description, isGroupChat, admin:userID, createdBy:userID
            });

            return res.status(200).json({success:true, message:newGroupChat}) as unknown as void;
        }

        const isSingleChatExists = await Chat.findOne({
            isGroupChat:false,
            members:{
                $all:[userID, members[0]]
            }
        });

        if (!isSingleChatExists) {
            const newChat = await Chat.create({
                chatName, members:[...(members), userID], description, isGroupChat, admin:userID, createdBy:userID
            });
            return res.status(200).json({success:true, message:newChat}) as unknown as void;
        }
        
        return res.status(200).json({success:true, message:"", jsonData:isSingleChatExists}) as unknown as void;
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
        }).populate({model:"User", path:"members", select:"_id name email"});

        res.status(200).json({success:true, message:"", jsonData:myChats});
    } catch (error) {
        next(error);
    }
};
export const singleChatMessages = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            chatID
        }:{chatID:string} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));

        const selectedChatMessages = await Message.find({
            chatID,
            deletedFor:{$nin:[userID]}
        })
        .populate({model:"Content", path:"content", select:"_id contentMessage createdBy isForwarded contentType"})
        .populate({model:"Content", path:"attachment", select:"_id contentMessage createdBy isForwarded contentType"});

        res.status(200).json({success:true, message:"", jsonData:selectedChatMessages});
    } catch (error) {
        next(error);
    }
};
//export const singleChatMembers = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {chatID}:{chatID:string;} = req.body;
//        const userID = (req as AuthenticatedRequestTypes).user._id;

//        console.log({chatID});

//        if (!chatID) return next(new ErrorHandler("chatID not found", 404));

//        const selectedChat = await Chat.findById(chatID);

//        res.status(200).json({success:true, message:selectedChat});
//    } catch (error) {
//        next(error);
//    }
//};
export const updateChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID, chatName, members, description}:{chatID:string; chatName?:string; members?:string[]; description?:string;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));
        if (!chatName && !members && !description) return next(new ErrorHandler("All fields are empty, there is no field for update", 400));

        const updatingChat = await Chat.findByIdAndUpdate(chatID, {
            ...(chatName&&{chatName}),
            ...(members&&{members:[...members, userID]}),
            ...(description&&{description})
        });

        res.status(200).json({success:true, message:"Chat has been updated", jsonData:updatingChat});
    } catch (error) {
        next(error);
    }
};
export const removeMembers = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID, members}:{chatID:string; members?:string[];} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({chatID});

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));
        if (!members) return next(new ErrorHandler("Members array is empty, there is no field for update", 400));

        const chatForUpdate = await Chat.findById(chatID);

        if (!chatForUpdate) return next(new ErrorHandler("Chat not found", 404));

        let membersFilterResult:mongoose.Schema.Types.ObjectId[] = [];
        
        chatForUpdate?.members.forEach((userId) => {
            if (members.includes(userId.toString())) {
                console.log(`PAHLE SE THA----${userId}`);
            }
            else{
                console.log(`PAHLE SE NAHI THA----${userId}`);
                membersFilterResult.push(userId)

            }
        })

        chatForUpdate.members = membersFilterResult;
        await chatForUpdate.save();
        
        res.status(200).json({success:true, message:members.length < 2 ? "Member has been removed":"Members has been removed", jsonData:chatForUpdate});
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

        res.status(200).json({success:true, message:"New admin added", jsonData:{}});
    } catch (error) {
        next(error);
    }
};
export const deleteChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID} = req.body;

        if (!chatID) return next(new ErrorHandler("chatID not found", 404));
        
        const deletingChat = await Chat.findByIdAndDelete(chatID);
        
        if (!deletingChat) return next(new ErrorHandler("Chat not found", 404));

        res.status(200).json({success:true, message:"Chat has been deleted", jsonData:deletingChat});
    } catch (error) {
        next(error);
    }
};
