import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler";


const errorMiddleware = (err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    const statusCode = err.statusCode || 500;
    let message:string;

    console.log(">>>>>>>>>>>>>>>");
    console.log({statusCode:err.statusCode, message:err.message});
    console.log(">>>>>>>>>>>>>>>");
    
    if (err.name === "CastError") {
        message = "Wrong ObjectId format"
    }
    else{
        message = err.message || "Internal server error";
    }
    
    res.status(statusCode).json({success:false, message})
};

export default errorMiddleware;