import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";

export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, gender, mobile}:{name:string; email:string; password:string; gender:"male"|"female"|"other"; mobile:string;} = req.body;
        
        console.log({name, email, password, gender, mobile});
        

        if (!name || !email || !password || !gender || !mobile) {
            res.status(400).json({success:false, message:"all fields are required"});
            return;
        };
        
        const isUserExist = await User.findOne({email});

        if (isUserExist) {
            res.status(401).json({success:false, message:"user already exist"});
            return;
        };

        await User.create({
            name, email, password, gender, mobile
        });

        res.status(200).json({success:true, message:"User registration successfull"});
    } catch (error) {
        let message = "";
        console.log(error);
        if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
            message = error.message;
        }
        res.status(401).json({success:false, message:message});
    }
};
export const login = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password}:{email:string; password:string;} = req.body;
        
        console.log({email, password});
        

        if (!email || !password) {
            res.status(400).json({success:false, message:"all fields are required"});
            return;
        };
        
        const isUserExist = await User.findOne({email});

        if (!isUserExist) {
            res.status(401).json({success:false, message:"Wrong email or password1"});
            return;
        };
        
        if (isUserExist.password !== password) {
            res.status(401).json({success:false, message:"Wrong email or password2"});
            return;
        }

        res.status(200).json({success:true, message:"User login successfull"});
    } catch (error) {
        let message = "";
        console.log(error);
        if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && error.message) {
            message = error.message;
        }
        res.status(401).json({success:false, message:message});
    }
};
