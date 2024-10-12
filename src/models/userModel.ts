import mongoose, { Model, mongo } from "mongoose";

export interface UserTypes {
    name:string;
    email:string;
    gender:"male"|"female"|"other";
    mobile:string;
    password:string;
    is_varified:boolean;
    last_login:Date;
    background_pic:string;
    dp_pic:string;
    varification_token:string|null;
    varification_token_expire:Date|null;

};

const userSchema = new mongoose.Schema<UserTypes>({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        unique:true,
        require:true
    },
    gender:{
        type:String,
        enum:["male", "female", "other"],
        require:true
    },
    mobile:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    is_varified:{
        type:Boolean,
        require:true
    },
    last_login:{
        type:Date,
        require:true
    },
    background_pic:{
        type:String
    },
    dp_pic:{
        type:String
    },
    varification_token:{
        type:String
    },
    varification_token_expire:{
        type:Date
    }
});

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;