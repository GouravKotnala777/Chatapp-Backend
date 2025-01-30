import { NextFunction, Request, Response } from "express";
import Notification, { NotificationStatusTypes, NotificationTypes, NotificationTypeTypes } from "../models/notificationModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import mongoose from "mongoose";
import { sendMessageToSocketId } from "../app";
import { AuthenticatedRequestTypes } from "../types/types";
import NotificationContainer from "../models/notificationContainerModel";


export const myNotifications = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequestTypes).user;

        const myNotificationsContainers = await NotificationContainer.findOne({
            userID:user._id
        });
        
        if (myNotificationsContainers) {
            const myOldNotifications = await Notification.find({
                toUserID:user._id,
                isRemoved:false,
                createdAt:{$lt:myNotificationsContainers?.lastSeenAt}
            });
            
            const myNewNotifications = await Notification.find({
                toUserID:user._id,
                isRemoved:false,
                createdAt:{$gte:myNotificationsContainers?.lastSeenAt}
            });            
            
            res.status(200).json({success:true, message:"", jsonData:{myNewNotifications, myOldNotifications}});
        }
        else{
            const newNotificationContainer = await NotificationContainer.create({
                userID:user._id,
                newNotificationsCount:0,
                lastSeenAt:new Date()
            });
            const myNewNotifications = await Notification.find({
                toUserID:user._id,
                isRemoved:false
            });
            res.status(200).json({success:true, message:"", jsonData:{myNewNotifications, myOldNotifications:[]}});
        }
        
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
            isRemoved,
            isUnreaded,
            redirectedURL}:{
                toUserIDs:mongoose.Schema.Types.ObjectId[];
                notificationType:NotificationTypeTypes;
                status:NotificationStatusTypes;
                content:string;
                isRemoved:boolean;
                isUnreaded:boolean;
                redirectedURL?:string;
            } = req.body;
        const user = (req as AuthenticatedRequestTypes).user;

        const isUnReadedNotificationContainerExist = await NotificationContainer.findOne({
            userID:user._id
        });

        //for (const toUserID of toUserIDs) {
            
        //}
        const bbb = toUserIDs.map(async(toUserID) => {
            const isReceiverNotificationContainerExits = await NotificationContainer.findOne({
                userID:toUserID
            });

            if (isReceiverNotificationContainerExits) {
                isReceiverNotificationContainerExits.newNotificationsCount += 1;
                await isReceiverNotificationContainerExits.save();
            }
            else{
                const createReceiverNotificationContainer = await NotificationContainer.create({
                    userID:toUserID,
                    newNotificationsCount:1,
                    lastSeenAt:new Date()
                });
            }
        });

        const aaa = toUserIDs.map(async(toUserID) => {
            const newNotification = await Notification.create({
                fromUserID:user._id,
                toUserID,
                notificationType,
                status,
                content:`${user._id} ${content} ${toUserID}`,
                isRemoved,
                isUnreaded,
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
                isRemoved,
                isUnreaded,
                redirectedURL,
                createdAt:newNotification.createdAt
            }});

            return newNotification;
        })
        const newNotifications = await Promise.all(aaa);
        const filteredNotifications = newNotifications.filter(Boolean) as (mongoose.Document<unknown, {}, NotificationTypes>&NotificationTypes&Required<{_id:mongoose.Schema.Types.ObjectId}>)[];

        if (isUnReadedNotificationContainerExist) {
            console.log('isUnReadedNotificationContainerExist pahle se tha');
        }
        else{
            const newNotificationContainer = await NotificationContainer.create({
                userID:user._id,
                newNotificationsCount:0,
                lastSeenAt:new Date()
            });
        }
        res.status(200).json({success:true, message:"Notifications has been sent", jsonData:filteredNotifications});
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
        const user = (req as AuthenticatedRequestTypes).user;

        const isUnReadedNotificationContainerExist = await NotificationContainer.findOne({
            userID:user._id
        });

        if (isUnReadedNotificationContainerExist) {
            isUnReadedNotificationContainerExist.newNotificationsCount = 0;
            isUnReadedNotificationContainerExist.lastSeenAt = new Date();
            await isUnReadedNotificationContainerExist.save();
        }
        else{
            const newNotificationContainer = await NotificationContainer.create({
                userID:user._id,
                newNotificationsCount:0,
                lastSeenAt:new Date()
            });
        }

        //if (!updatedNotification) return next(new ErrorHandler("Internal server error", 500));

        res.status(200).json({success:true, message:"", jsonData:{}})
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