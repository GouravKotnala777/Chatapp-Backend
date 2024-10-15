import mongoose, { Model } from "mongoose";

export type MessageType = "text"|"image"|"file"|"video"|"audio";
export type MessageStatusType = "sent"|"delivered"|"read";

export interface MessageTypes {
    sender:mongoose.Schema.Types.ObjectId;
    chatID:mongoose.Schema.Types.ObjectId;
    content:string;
    attachment:string;
    messageType:MessageType;
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
        type:String
    },
    attachment:[{
        type:String
    }],
    messageType:{
        type:String,
        enum:["text", "image", "file", "video", "audio"],
        defautl:"text"
    },
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