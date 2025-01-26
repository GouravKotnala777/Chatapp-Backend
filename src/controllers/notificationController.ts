import { NextFunction, Request, Response } from "express";
import Notification, { NotificationStatusTypes, NotificationTypeTypes } from "../models/notificationModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import mongoose from "mongoose";
import { sendMessageToSocketId } from "../app";
import { AuthenticatedRequestTypes } from "../types/types";


export const myNotifications = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequestTypes).user;

        const myNotifications = await Notification.find({
            visibleFor:{
                $in:user._id,
            }
        });


        res.status(200).json({success:true, message:"", jsonData:myNotifications});
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const createNotification = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {toUserIDs,
            notificationType,
            status,
            content,
            redirectedURL}:{
                toUserIDs:mongoose.Schema.Types.ObjectId[];
                notificationType:NotificationTypeTypes;
                status:NotificationStatusTypes;
                content:string;
                redirectedURL?:string;
            } = req.body;
        const user = (req as AuthenticatedRequestTypes).user;

        const aaa = toUserIDs.map(async(toUserID) => {
            const newNotification = await Notification.create({
                fromUserID:user._id,
                toUserID,
                notificationType,
                status,
                content:`${user._id} ${content} ${toUserID}`,
                newFor:[user._id, toUserID],
                visibleFor:[user._id, toUserID],
                redirectedURL
            });
    
            if (!newNotification) return next(new ErrorHandler("Internal server error", 500));

            sendMessageToSocketId({userIDs:[toUserID.toString()], eventName:"newNotification", message:{
                _id:newNotification._id,
                fromUserID:user._id,
                toUserID,
                notificationType,
                status,
                content:`${user._id} ${content} ${toUserID}`,
                newFor:[toUserID],
                visibleFor:[toUserID],
                redirectedURL,
                createdAt:newNotification.createdAt
            }});

            return newNotification;
        })

        const newNotifications = await Promise.all(aaa);


        res.status(200).json({success:true, message:"Notifications has been sent", jsonData:newNotifications})
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const removeNotification = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            notificationID}:{
                notificationID:mongoose.Schema.Types.ObjectId;
            } = req.body;
        const user = (req as AuthenticatedRequestTypes).user;

        const updatedNotification = await Notification.findByIdAndUpdate(notificationID, {
            $pull:{visibleFor:user._id}
        }, {new:true});

        if (!updatedNotification) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"", jsonData:updatedNotification._id})
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const watchNotification = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            notificationID}:{
                notificationID:mongoose.Schema.Types.ObjectId;
            } = req.body;
        const user = (req as AuthenticatedRequestTypes).user;

        const updatedNotification = await Notification.findByIdAndUpdate(notificationID, {
            $pull:{newFor:user._id}
        }, {new:true});

        if (!updatedNotification) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"", jsonData:updatedNotification._id})
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const updateNotificationStatus = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            notificationID,
            status}:{
                notificationID:mongoose.Schema.Types.ObjectId;
                status:NotificationStatusTypes;
            } = req.body;
        const updatedNotification = await Notification.findByIdAndUpdate(notificationID, {
            status
        }, {new:true});

        if (!updatedNotification) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"Notification has been sent", jsonData:updatedNotification})
    } catch (error) {
        console.log(error);
        next(error);
    }
};