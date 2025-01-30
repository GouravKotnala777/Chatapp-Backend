import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler";
import User from "../models/userModel";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequestTypes } from "../types/types";

export const isUserAuthenticated = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userToken:string = req.cookies?.userToken || req.headers.cookie?.split("-")[1];

        //console.log({cookie:req.cookies});
        //console.log({cookieFromHeader:req.headers.cookie});
        
        //console.log({userTokenFromAuth:userToken});
        
        if (!userToken) return next(new ErrorHandler("Token not found", 404));

        const varifyToken = jsonwebtoken.verify(userToken, process.env.TOKEN_PRIVATE_KEY as string) as JwtPayload;

        //console.log({varifyToken:varifyToken.id});

        if (!varifyToken) return next(new ErrorHandler("varifyToken undefined hai", 404));
        

        const loggedInUser = await User.findById(varifyToken.id);

        //console.log({loggedInUser});
        

        if (!loggedInUser) return next(new ErrorHandler("user not found", 404));

        (req as AuthenticatedRequestTypes).user = loggedInUser;

        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};