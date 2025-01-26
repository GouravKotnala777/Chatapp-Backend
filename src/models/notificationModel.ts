import mongoose, { Model } from "mongoose";
export type NotificationTypeTypes = "info"|"alert"|"warning";
export type NotificationStatusTypes = "pending"|"received"|"viewed"|"archived";
export interface NotificationTypes{
    fromUserID:mongoose.Schema.Types.ObjectId;
    toUserID:mongoose.Schema.Types.ObjectId;
    notificationType:NotificationTypeTypes;
    status:NotificationStatusTypes;
    content:string;
    newFor:mongoose.Schema.Types.ObjectId[],
    visibleFor:mongoose.Schema.Types.ObjectId[],
    redirectedURL?:string;
    createdAt:Date;
};


const notificationSchema = new mongoose.Schema<NotificationTypes>({
    fromUserID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    toUserID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    notificationType:{
        type:String,
        enum:["info", "alert", "warning"]
    },
    status:{
        type:String,
        enum:["pending", "received", "viewed", "archived"],
        default:"pending"
    },
    content:{
        type:String,
        required:true,
        validate:{
            validator:function (value:string) {
                return value.split(" ").length < 200
            },
            message:"Lenght should be less than 200"
        }
    },
    newFor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    visibleFor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    redirectedURL:String,

}, {timestamps:true});

const notificationModel:Model<NotificationTypes> = mongoose.models.Notification || mongoose.model<NotificationTypes>("Notification", notificationSchema);

export default notificationModel;