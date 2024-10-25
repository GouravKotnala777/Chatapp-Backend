import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import { ErrorHandler } from "../utils/ErrorHandler";
import { cookieOptions } from "../constants/constants";
import { sendToken } from "../utils/util";
import { AuthenticatedRequestTypes } from "../types/types";

export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, gender, mobile}:{name:string; email:string; password:string; gender:"male"|"female"|"other"; mobile:string;} = req.body;
        
        console.log({name, email, password, gender, mobile});
        

        if (!name || !email || !password || !gender || !mobile) return next(new ErrorHandler("all fields are required", 404));
        
        const isUserExist = await User.findOne({email});

        if (isUserExist) return next(new ErrorHandler("user already exist", 401));

        await User.create({
            name, email, password, gender, mobile
        });

        res.status(200).json({success:true, message:"User registration successfull"});
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