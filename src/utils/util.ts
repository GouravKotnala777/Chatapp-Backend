import { NextFunction, Request, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import User, { UserTypes } from "../models/userModel";
import { ErrorHandler } from "./ErrorHandler";
import { cookieOptions, VERIFY_EMAIL } from "../constants/constants";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";


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
export const sendMail = async(
    email:string,
    emailType:"VERIFY_EMAIL"|"RESET_PASSWORD",
    userID:mongoose.Schema.Types.ObjectId,
    next:NextFunction
) => {
        try {
            let user;
            const hashedToken = await bcryptjs.hash(userID.toString(), 7);

            if (emailType === VERIFY_EMAIL) {
                user = await User.findByIdAndUpdate(userID, {
                    varification_token:hashedToken,
                    varification_token_expire:Date.now() + 90000
                });
            }

            const transporter = nodemailer.createTransport({
                host:process.env.TRANSPORTER_HOST,
                port:Number(process.env.TRANSPORTER_PORT),
                secure:false,
                auth:{
                    user:process.env.TRANSPORTER_ID,
                    pass:process.env.TRANSPORTER_PASSWORD
                }
            });

            const mailOptions = {
                from:process.env.TRANSPORTER_ID,
                to:email,
                subject:emailType === "VERIFY_EMAIL" ? "Verify your email" : "Update your email",
                html:`
                    <html>
                        <head>
                            <style>
                            </style>
                            <title></title>
                        </head>
                        <body>
                            <div class="mail_cont>
                                <h3 class="subject">Subject: ${emailType === "VERIFY_EMAIL" ? "Please Verify Your Email Address" : "Please Verify Your Email To Update Password"}</h3>
                                <div class="receiver">Dear ${user?.name},</div>
                                <div class="mail_para">
                                    ${emailType === "VERIFY_EMAIL" ? "Thank you for registering with Ecommerce! To ensure the security of your account and access all features, please verify your email address by clicking the link below:" : "To change your password first We need to verify it's you"}
                                </div>
                                <div class="verify_link_cont">
                                    <a class="verify_btn" href="${process.env.CLIENT_URL}/user/verifyemail?token=${hashedToken}&emailType=${emailType}">Verify</a>
                                </div>
                                <div class="verify_uri">URL :- ${process.env.CLIENT_URL}/user/verifyemail?token=${hashedToken}&emailType=${emailType}</div>
                                <div class="mail_para">If you are unable to click the link above, please copy and paste it into your browser's address bar.</div>
                                <div class="mail_para">Once your email address is verified, you'll be able to [describe any benefits or features unlocked after verification].</div>
                                <div class="mail_para">If you did not create an account with Ecommerce, please ignore this email.</div>
                                <div class="mail_para">Thank you,</div>
                                <div class="mail_para">The Ecommerce Team</div>
                            </div>
                        </body>
                    </html>
                `
            }
        
            const resMail = transporter.sendMail(mailOptions);

            return resMail;
        } catch (error) {
            console.log(error);
            throw new ErrorHandler("This error is from mailer.middleware.ts", 500);
        }
};
export const uploadOnCloudinary = async(localFilePath:string, cloudinaryDestinationFolder:string) => {
    try {
        if (!localFilePath) return null;

        const res = await cloudinary.uploader.upload(localFilePath, {folder:cloudinaryDestinationFolder});

        if (res.url) {
            console.log("File is uploaded successfully");
            fs.unlinkSync(localFilePath);
        }
        
        return res;
    } catch (error) {
        console.log(error);
        return null;
    }
};