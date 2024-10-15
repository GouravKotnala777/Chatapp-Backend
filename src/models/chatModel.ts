import mongoose, { Model } from "mongoose";

interface ChatTypes {
    chatName:string;
    admin:mongoose.Schema.Types.ObjectId[];
    members:mongoose.Schema.Types.ObjectId[];
    description:string;
    isGroupChat:boolean;
    createdBy:mongoose.Schema.Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
};

const chatSchema = new mongoose.Schema<ChatTypes>({
    chatName:{
        type:String,
        required:true,
        maxlength:99
    },
    admin:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }],
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }],
    description:{
        type:String,
        maxlength:160
    },
    isGroupChat:{
        type:Boolean,
        required:true,
        default:false
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
}, {timestamps:true});

const chatModel:Model<ChatTypes> = mongoose.models.Chat || mongoose.model<ChatTypes>("Chat", chatSchema);

export default chatModel;