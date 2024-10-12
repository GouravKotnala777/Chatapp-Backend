import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";

const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, gender, mobile}:{name:string; email:string; password:string; gender:"male"|"female"|"other"; mobile:string;} = req.body;
        
        if (!name || !email || !password || !gender || !mobile) return new Error("all fields are required");
        
        const isUserExist = await User.find({email});

        if (isUserExist) return new Error("user already exist");

        const newUser = await User.create({
            name, email, password, gender, mobile
        });

        res.status(200).json({success:true, message:"User registration successfull"});
    } catch (error) {
        console.log(error);
    }
};









//const createUser = async(req:Request, res:Response, next:NextFunction) => {
//    try {
        
//    } catch (error) {
//        console.log(error);
//    }
//};