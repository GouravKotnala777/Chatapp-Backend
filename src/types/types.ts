import { Request } from "express";
import { Types } from "mongoose";
import { UserTypes } from "../models/userModel";

export interface AuthenticatedRequestTypes extends Request {
    user:UserTypes;
}