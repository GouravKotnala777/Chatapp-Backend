import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { cookieOptions } from "../constants/constants";
import { sendToken } from "../utils/util";
import { AuthenticatedRequestTypes } from "../types/types";
import RequestModel, { FriendRequestStatusType } from "../models/requestModel";

export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, gender, mobile}:{name:string; email:string; password:string; gender:"male"|"female"|"other"; mobile:string;} = req.body;
        
        console.log({name, email, password, gender, mobile});
        

        if (!name || !email || !password || !gender || !mobile) return next(new ErrorHandler("all fields are required", 404));
        
        const isUserExist = await User.findOne({email});

        if (isUserExist) return next(new ErrorHandler("user already exist", 401));

        const newUser = await User.create({
            name, email, password, gender, mobile
        });

        const sendTokenReturnValue = await sendToken(req, res, next, newUser);

        console.log({sendTokenReturnValue});
        

        res.status(200).json({success:true, message:newUser});
    } catch (error) {
        next(error);
    }
};
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password}:{email:string; password:string;} = req.body;
        
        console.log({email, password});
        

        if (!email || !password) return next(new ErrorHandler("all fields are required", 400));
        
        const isUserExist = await User.findOne({email});

        if (!isUserExist) return next(new ErrorHandler("Wrong email or password1", 401));
        
        const isPasswordMatched = await isUserExist.comparePassword(password);

        console.log({isPasswordMatched});
        
        //if (isUserExist.password !== password) return next(new ErrorHandler("Wrong email or password2", 502));
        if (!isPasswordMatched) return next(new ErrorHandler("Wrong email or password2", 502));

        const sendTokenReturnValue = await sendToken(req, res, next, isUserExist);

        console.log({sendTokenReturnValue});
        
        res.status(200).json({success:true, message:isUserExist});
    } catch (error) {
        next(error);
    }
};
export const myProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequestTypes).user;

        console.log({user});

        res.status(200).json({success:true, message:user});
    } catch (error) {
        next(error);
    }
};
export const setProfilePicture = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {profile_image} = req.body;

        console.log(profile_image);
        
        console.log("################ 1");
        console.log(req.file);
        console.log("################ 2");

        res.status(200).json({success:true, message:"image uploaded"});
    } catch (error) {
        next(error);
    }
};
export const myFriends = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequestTypes).user._id;
        const user = await User.findById(userID).populate({model:"User", path:"friends", select:"_id name email mobile profilePicture coverPicture bio"});

        const myFriends = user?.friends;

        //console.log({myFriends});
        
        res.status(200).json({success:true, message:myFriends});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const searchUser = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {searchQuery}:{searchQuery:string;} = req.body;
        //const userID = (req as AuthenticatedRequestTypes).user._id;

        console.log({searchQuery});
        

        const searchedUser = await User.find({
            email:{
                $regex:searchQuery,
                $options:"i"
            }
        }).select("_id name email");

        if (!searchedUser) return next(new ErrorHandler("User not found", 404));

        
        
        res.status(200).json({success:true, message:searchedUser});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const sendFriendRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {searchedUserIDArray}:{searchedUserIDArray:string[];} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;
        

        console.log({searchedUserIDArray});
        

        searchedUserIDArray.forEach(async(searchedUserID) => {
            const createRequest = await RequestModel.create({
                from:userID,
                to:searchedUserID
            });
            const findUserAndUpdate = await User.findByIdAndUpdate(searchedUserID, {
                $push:{friendRequests:createRequest._id}
            }, {new:true});
    
            if (!findUserAndUpdate) return next(new ErrorHandler("Error occured", 500));
        })
        
        
        res.status(200).json({success:true, message:"findUserAndUpdate"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const replyFriendRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {friendRequestID, status}:{friendRequestID:string; status:FriendRequestStatusType;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;
        
        const findRequestAndUpdate = await RequestModel.findByIdAndUpdate(friendRequestID, {
            status
        });
        
        if (!findRequestAndUpdate) return next(new ErrorHandler("Request not found", 404));

        const findUserAndUpdate = await User.findByIdAndUpdate(userID, {
            $pull:{friendRequests:findRequestAndUpdate._id}
        }, {new:true});

        if (!findUserAndUpdate) return next(new ErrorHandler("Error occured", 500));
        
        res.status(200).json({success:true, message:findUserAndUpdate});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
