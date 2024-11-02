import mongoose, { Model } from "mongoose";
import { ContentType } from "./contentModel";

export type MessageStatusType = "sent"|"delivered"|"read";

export interface MessageTypes {
    sender:mongoose.Schema.Types.ObjectId;
    chatID:mongoose.Schema.Types.ObjectId;
    content:mongoose.Schema.Types.ObjectId;
    attachment:string;
    messageStatus:MessageStatusType;
    isForwarded:boolean;
    deletedFor:mongoose.Schema.Types.ObjectId[];
    createdAt:Date;
    updatedAt:Date;
};
export interface MessageTypesPopulated {
    sender:mongoose.Schema.Types.ObjectId;
    chatID:mongoose.Schema.Types.ObjectId;
    content:ContentType;
    attachment:string;
    messageStatus:MessageStatusType;
    isForwarded:boolean;
    deletedFor:mongoose.Schema.Types.ObjectId[];
    createdAt:Date;
    updatedAt:Date;
};

const messageSchema = new mongoose.Schema<MessageTypes>({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    chatID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    },
    content:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Content",
        required:true
    },
    attachment:[{
        type:String
    }],
    messageStatus:{
        type:String,
        enum:["sent", "delivered", "read"],
        default:"sent"
    }, 
    isForwarded:{
        type:Boolean,
        default:false
    },
    deletedFor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
}, {timestamps:true});

const messageModel:Model<MessageTypes> = mongoose.models.Message || mongoose.model<MessageTypes>("Message", messageSchema);

export default messageModel;