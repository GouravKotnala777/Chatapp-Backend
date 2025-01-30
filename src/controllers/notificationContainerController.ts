import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequestTypes } from "../types/types";


//export const createNotificationContainer = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {
//            notificationID}:{
//                notificationID:mongoose.Schema.Types.ObjectId;
//            } = req.body;
//        const user = (req as AuthenticatedRequestTypes).user;

//        const newNotification = await Notification.findByIdAndUpdate(notificationID, {
//            $pull:{newFor:user._id}
//        }, {new:true});

//        if (!updatedNotification) return next(new ErrorHandler("Internal server error", 500));

//        res.status(200).json({success:true, message:"", jsonData:updatedNotification._id})
//    } catch (error) {
//        console.log(error);
//        next(error);
//    }
//};