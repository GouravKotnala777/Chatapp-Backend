import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { cookieOptions } from "../constants/constants";
import { sendToken } from "../utils/util";
import { AuthenticatedRequestTypes } from "../types/types";
import RequestModel, { FriendRequestStatusType, RequestTypesPopulated } from "../models/requestModel";

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
export const allReceivedFriendRequests = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequestTypes).user._id;
        const allReceivedFriendRequests = await RequestModel.find({
            to:userID,
            status:"pending"
        }).populate({model:"User", path:"from", select:"_id name email"}) as RequestTypesPopulated[];

        if (allReceivedFriendRequests.length === 0) return next(new ErrorHandler("Request not found", 404));

        const friendRequestsTransformed = allReceivedFriendRequests.map((singleRequest) => (
            {
                _id:singleRequest._id,
                name:singleRequest.from.name,
                email:singleRequest.from.email,
                date:singleRequest.createdAt
            }
        ));
        res.status(200).json({success:true, message:friendRequestsTransformed});
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

        if (status === "accepted") {
            const findMeAndUpdate = await User.findByIdAndUpdate(userID, {
                $pull:{friendRequests:findRequestAndUpdate._id},
                $push:{friends:findRequestAndUpdate.from}
            }, {new:true});
    
            if (!findMeAndUpdate) return next(new ErrorHandler("Error occured", 500));
            
            const findSenderAndUpdate = await User.findByIdAndUpdate(findRequestAndUpdate.from, {
                $push:{friends:userID}
            }, {new:true});
            
            if (!findSenderAndUpdate) return next(new ErrorHandler("Error occured", 500));
        }
        else {
            const findMeAndUpdate = await User.findByIdAndUpdate(userID, {
                $pull:{friendRequests:findRequestAndUpdate._id}
            }, {new:true});
    
            if (!findMeAndUpdate) return next(new ErrorHandler("Error occured", 500));    
        }
        
        
        res.status(200).json({success:true, message:"string string string"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const removeFriend = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {friendUserID}:{friendUserID:string;} = req.body;
        const userID = (req as AuthenticatedRequestTypes).user._id;

        const me = await User.findById(userID);

        if (!me) return next(new ErrorHandler("Me not found", 404));

        const isUserFriend = me.friends.includes(friendUserID);

        if (isUserFriend) {
            const friendFilterResult = me.friends.filter((frndId) => frndId.toString() !== friendUserID);

            me.friends = friendFilterResult;

            console.log("11111111111111111111");
            console.log("VALIDATE BEFORE SAVE HATANA HAI");

            //  VALIDATE BEFORE SAVE HATANA HAI
            
            await me.save({validateBeforeSave:false}); 
            console.log("22222222222222222222");

            const removeMeFromUserFriendList = await User.findByIdAndUpdate(friendUserID, {
                $pull:{friends:userID}
            });

        }
        else{
            const isMeExistInUserFriendListAndUpdate = await User.findByIdAndUpdate(friendUserID, {
                $pull:{friends:userID}
            });
        }

        res.status(200).json({success:true, message:me.friends});
    } catch (error) {
        next(error);
    }
};