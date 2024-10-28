import mongoose, { Model } from "mongoose";

export type FriendRequestStatusType = "pending"|"accepted"|"rejected";

export interface RequestTypes {
    _id:mongoose.Schema.Types.ObjectId;
    from:mongoose.Schema.Types.ObjectId;
    to:mongoose.Schema.Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
    status:FriendRequestStatusType;
};
export interface RequestTypesPopulated {
    _id:mongoose.Schema.Types.ObjectId;
    from:{_id:mongoose.Schema.Types.ObjectId; name:string; email:string;};
    to:mongoose.Schema.Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
    status:FriendRequestStatusType;
};

const requestSchema = new mongoose.Schema<RequestTypes|RequestTypesPopulated>({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:String,
        enum:["pending", "accepted", "rejected"],
        required:true,
        default:"pending"
    }
}, {
    timestamps:true
});

const requestModel:Model<RequestTypes|RequestTypesPopulated> = mongoose.models.Request || mongoose.model<RequestTypes|RequestTypesPopulated>("Request", requestSchema);

export default requestModel;