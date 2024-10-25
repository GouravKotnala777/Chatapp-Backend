import { NextFunction, Request, Response } from "express";
import { Document, Schema } from "mongoose";
import { UserTypes } from "../models/userModel";
import { ErrorHandler } from "./ErrorHandler";
import { cookieOptions } from "../constants/constants";


export const sendToken = async(
    req:Request,
    res:Response,
    next:NextFunction,
    model:(Document<unknown, {}, UserTypes> & UserTypes & {
        _id: Schema.Types.ObjectId;
    } & {
        __v?: number;
    })) => {
        try {
            console.log(")))))))))))))))))))))))))))))))");
            
            const generatedToken = await model.generateToken(model._id);
        
            if (!generatedToken) return next(new ErrorHandler("Token not generated", 500));
        
            res.cookie("userToken", generatedToken, cookieOptions);
        
            return generatedToken;
        } catch (error) {
            next(error);
        }
};