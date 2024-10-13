import mongoose, { Model, mongo } from "mongoose";

export interface UserTypes {
    name:string;
    email: string;
    password: string;
    profilePicture: string;
    coverPicture: string;
    bio: string;
    location: {
        city: string;
        country: string;
    };
    gender: "male"|"female"|"other";
    friends: string[];
    friendRequests:{
        userId:string;
        status:"pending"|"accepted"|"rejected";
    }[];
    posts:string[];
    notifications: string[];
    chats: string[];
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    is_varified:boolean;
    varification_token:string|null;
    varification_token_expire:Date|null;
};

const userSchema = new mongoose.Schema<UserTypes>(
    {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
        },
        password: {
          type: String,
          required: true,
          minlength: 6,
        },
        profilePicture: {
          type: String,
          default: "",
        },
        coverPicture: {
          type: String,
          default: "",
        },
        bio: {
          type: String,
          maxlength: 160,
          default: "",
        },
        location: {
          city: String,
          country: String,
        },
        gender: {
          type: String,
          enum: ["male", "female", "other"],
        },
        friends: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        friendRequests: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            status: {
              type: String,
              enum: ["pending", "accepted", "rejected"],
              default: "pending",
            },
          },
        ],
        posts: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
          },
        ],
        notifications: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification", // Notifications related to likes, comments, friend requests, etc.
          },
        ],
        chats: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
          },
        ],
        lastLogin: {
          type: Date,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        is_varified:{
            type:Boolean,
            require:true
        },
        varification_token:{
            type:String
        },
        varification_token_expire:{
            type:Date
        }
      },
      { timestamps: true },
);

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;