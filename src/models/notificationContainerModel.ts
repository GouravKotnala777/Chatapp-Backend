import mongoose, { Model } from "mongoose";
import { UserTypes } from "./userModel";
import { NotificationTypes } from "./notificationModel";

export interface NotificationContainerTypes{
    _id:mongoose.Schema.Types.ObjectId;
    userID:mongoose.Schema.Types.ObjectId;
    newNotificationsCount:number;
    lastSeenAt:Date;
    createdAt:Date;
    updatedAt:Date;
};
export interface NotificationContainerTypesPopulated{
    _id:mongoose.Schema.Types.ObjectId;
    userID:UserTypes;
    newNotificationsCount:number;
    lastSeenAt:Date;
    createdAt:Date;
    updatedAt:Date;
};

const notificationContainerSchema = new mongoose.Schema<NotificationContainerTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    newNotificationsCount:{
        type:Number,
        default:0
    },
    lastSeenAt:{
        type:Date,
        default:new Date()
    }
}, {timestamps:true});

const notificationContainerModel:Model<NotificationContainerTypes> = mongoose.models.NotificationContainer || mongoose.model<NotificationContainerTypes>("NotificationContainer", notificationContainerSchema);

export default notificationContainerModel;