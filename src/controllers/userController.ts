import { NextFunction, Request, Response } from "express";
import User, { UserTypes } from "../models/userModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { cookieOptions } from "../constants/constants";
import { sendMail, sendToken } from "../utils/util";
import { AuthenticatedRequestTypes } from "../types/types";
import RequestModel, { FriendRequestStatusType, RequestTypesPopulated } from "../models/requestModel";
import { sendMessageToSocketId } from "../app";
import mongoose, { Document } from "mongoose";

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
        
        // ---------------------------
        await sendMail(email, "VERIFY_EMAIL", newUser._id, next);
        // ---------------------------

        res.status(200).json({success:true, message:"Check your email for verification link", jsonData:{}});
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
        
        
        if (isUserExist.is_varified === false) {
            await sendMail(email, "VERIFY_EMAIL", isUserExist._id, next);
            res.status(200).json({success:true, message:"Check your email for verification link", jsonData:{}});
        }
        else{
            await sendToken(req, res, next, isUserExist);
            res.status(200).json({success:true, message:"Login successful", jsonData:isUserExist});
        }
    } catch (error) {
        next(error);
    }
};
export const myProfile = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedRequestTypes).user;

        //console.log({user});

        res.status(200).json({success:true, message:"", jsonData:user});
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

        res.status(200).json({success:true, message:"image uploaded", jsonData:{}});
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
        
        res.status(200).json({success:true, message:"", jsonData:myFriends});
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
        
        if (!searchQuery) return next(new ErrorHandler("searchQuery is empty string", 400));

        const searchedUser = await User.find({
            email:{
                $regex:searchQuery,
                $options:"i"
            }
        }).select("_id name email");

        if (!searchedUser) return next(new ErrorHandler("User not found", 404));

        
        
        res.status(200).json({success:true, message:"", jsonData:searchedUser});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const allReceivedFriendRequests = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedRequestTypes).user._id;
        const allReceivedFriendRequests = await RequestModel.find({
            $or:[
                {from:userID},
                {to:userID}
            ],
            status:"pending"
        }).populate({model:"User", path:"from", select:"_id name email"})
        .populate({model:"User", path:"to", select:"_id name email"}) as RequestTypesPopulated[];

        //if (allReceivedFriendRequests.length === 0) return next(new ErrorHandler("", 404));

        const friendRequestsTransformed = allReceivedFriendRequests.map((singleRequest) => (
            {
                _id:singleRequest._id,
                from:{
                    _id:singleRequest.from._id,
                    name:singleRequest.from.name,
                    email:singleRequest.from.email
                },
                to:{
                    _id:singleRequest.to._id,
                    name:singleRequest.to.name,
                    email:singleRequest.to.email
                },
                date:singleRequest.createdAt
            }
        ));
        res.status(200).json({success:true, message:"", jsonData:friendRequestsTransformed});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const sendFriendRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {searchedUserIDArray}:{searchedUserIDArray:string[];} = req.body;
        const user = (req as AuthenticatedRequestTypes).user;

        const aaa = searchedUserIDArray.map(async(searchedUserID) => {
            const isRequestAlreadyExists = await RequestModel.findOne({
                $or:[
                    {
                        from:user._id,
                        to:searchedUserID
                    },
                    {
                        from:searchedUserID,
                        to:user._id
                    }
                ]
            });
            
            const isAlreadyFriend = user.friends.includes(searchedUserID);

            console.log({isAlreadyFriend});
            

            if (isRequestAlreadyExists || isAlreadyFriend) {
                return;
            }
            else{
                const createRequest = await RequestModel.create({
                    from:user._id,
                    to:searchedUserID
                });
                const findUserAndUpdate = await User.findByIdAndUpdate(searchedUserID, {
                    $push:{friendRequests:createRequest._id}
                }, {new:true});
        
                if (!findUserAndUpdate) return next(new ErrorHandler("Error occured", 500));
    
                const singleReq = {
                    _id:createRequest._id,
                    from:{
                        _id:user._id,
                        name:user.name,
                        email:user.email
                    },
                    to:{
                        _id:findUserAndUpdate._id,
                        name:findUserAndUpdate.name,
                        email:findUserAndUpdate.email
                    },
                    date:createRequest.createdAt
                };
    
                sendMessageToSocketId({userIDs:[searchedUserID], eventName:"sendFriendRequest", message:singleReq});
                return singleReq;
            }

        });

        const findUserAndUpdateArray = await Promise.all(aaa);

        
        res.status(200).json({success:true, message:"Request has been sended", jsonData:findUserAndUpdateArray});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const replyFriendRequest = async(req:Request, res:Response, next:NextFunction) => {
    try {
        console.log("----------------- (1)");
        
        const {friendRequestID, status}:{friendRequestID:string; status:FriendRequestStatusType;} = req.body;
        const user = (req as AuthenticatedRequestTypes).user;
        
        console.log({friendRequestID, status});
        console.log("----------------- (2)");
        
        
        const findRequestAndUpdate = await RequestModel.findByIdAndUpdate(friendRequestID, {
            status
        }, {new:true});
        
        console.log("----------------- (3)");
        if (!findRequestAndUpdate) return next(new ErrorHandler("Request not found", 404));
        
        console.log("----------------- (4)");
        if (status === "accepted") {
            console.log("----------------- (5)");
            const findMeAndUpdate = await User.findByIdAndUpdate(user._id, {
                $pull:{friendRequests:findRequestAndUpdate._id},
                $push:{friends:findRequestAndUpdate.from}
            }, {new:true});
            console.log("----------------- (6)");
            
            if (!findMeAndUpdate) return next(new ErrorHandler("Error occured", 500));
            
            console.log("----------------- (7)");
            const findSenderAndUpdate = await User.findByIdAndUpdate(findRequestAndUpdate.from, {
                $push:{friends:user._id}
            }, {new:true});
            
            console.log("----------------- (8)");
            if (!findSenderAndUpdate) return next(new ErrorHandler("Error occured", 500));
            
            console.log({findRequestAndUpdate});
            
            //const singleReq = {
                //    _id:findRequestAndUpdate._id,
                //    from:{
                    //        _id:user._id,
                    //        name:user.name,
                    //        email:user.email
            //    },
            //    to:{
                //        _id:findRequestAndUpdate._id,
                //        name:findRequestAndUpdate.name,
                //        email:findRequestAndUpdate.email
                //    },
                //    date:createRequest.createdAt
                //};
                
                
                sendMessageToSocketId({userIDs:[findRequestAndUpdate.from.toString()], eventName:"replyFriendRequest", message:{requestID:findRequestAndUpdate._id.toString(), requestReceiverName:user.name}});
            }
            else {
            console.log("----------------- (9)");
            const findMeAndUpdate = await User.findByIdAndUpdate(user._id, {
                $pull:{friendRequests:findRequestAndUpdate._id}
            }, {new:true});
            
            console.log("----------------- (10)");
            if (!findMeAndUpdate) return next(new ErrorHandler("Error occured", 500));    
        }
        
        
        console.log("----------------- (11)");
        res.status(200).json({success:true, message:"Request accepted", jsonData:{}});
    } catch (error) {
        console.log("----------------- (12)");
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

        res.status(200).json({success:true, message:"Friend removed", jsonData:me.friends});
    } catch (error) {
        next(error);
    }
};
export const verify = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {token, emailType}:{token:string; emailType:"VERIFY_EMAIL"|"RESET_PASSWORD"} = req.body;

        const findUserByVerificationToken = await User.findOne({
            varification_token:token,
            //varification_token_expire:{$gt:Date.now()},
            is_varified:false
        });

        console.log({findUserByVerificationToken});
        

        if (!findUserByVerificationToken) return next(new ErrorHandler("User not found", 404));

        findUserByVerificationToken.varification_token = null;
        findUserByVerificationToken.varification_token_expire = null;
        findUserByVerificationToken.is_varified = true;

        await findUserByVerificationToken.save();

        const sendTokenReturnValue = await sendToken(req, res, next, findUserByVerificationToken);

        console.log({sendTokenReturnValue});

        res.status(200).json({success:true, message:"Verification successful", jsonData:findUserByVerificationToken});
    } catch (error) {
        next(error);
    }
};
