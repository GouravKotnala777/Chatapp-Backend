import mongoose, { Model, mongo, ObjectId, Schema } from "mongoose";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

export interface UserTypes {
    _id:mongoose.Schema.Types.ObjectId;
    name:string;
    email: string;
    password: string;
    mobile:string;
    profilePicture: string;
    coverPicture: string;
    bio: string;
    location: {
        city: string;
        country: string;
    };
    gender: "male"|"female"|"other";
    friends: string[];
    friendRequests:mongoose.Schema.Types.ObjectId[];
    posts:string[];
    notifications: string[];
    chats: string[];
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    is_varified:boolean;
    varification_token:string|null;
    varification_token_expire:Date|null;

    comparePassword:(password:string) => Promise<boolean>;
    generateToken:(userID:Schema.Types.ObjectId) => string;
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
        mobile:{
          type:String,
          required:true,
          minlength:10
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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request",
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
            required:true,
            default:false
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

userSchema.pre("save", async function (next) {
  const oldPassword = this.password;
  if (!this.isModified("password")) return next();

  const hashedPassword = await bcryptjs.hash(oldPassword, Number(process.env.HASH_PASSWORD_SALT as string));
  this.password = hashedPassword;
  next();
});

userSchema.methods.comparePassword = async function(password:string){
  const comparePassword = await bcryptjs.compare(password, this.password);
  return comparePassword;
}

userSchema.methods.generateToken = async function (userID:mongoose.Types.ObjectId) {
  return jsonwebtoken.sign({id:userID}, process.env.TOKEN_PRIVATE_KEY as string, {expiresIn:"3d"});
}

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;