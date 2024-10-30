import mongoose, { Model } from "mongoose";

export type ContentMessageType = "text"|"image"|"file"|"video"|"audio";

export interface ContentType {
    contentMessage:string;
    createdBy:mongoose.Schema.Types.ObjectId;
    isForwarded:boolean;
    contentType:ContentMessageType;
    createdAt:Date;
    updatedAt:Date;
};

const contentSchema = new mongoose.Schema<ContentType>({
    contentMessage:{
        type:String,
        required:true
    },
    createdBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }],
    isForwarded:{
        type:Boolean,
        default:false
    },
    contentType:{
        type:String,
        enum:["text", "image", "file", "video", "audio"],
        defautl:"text"
    }
}, {timestamps:true});

const contentModel:Model<ContentType> = mongoose.models.Content || mongoose.model<ContentType>("Content", contentSchema);

export default contentModel;