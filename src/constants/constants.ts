import { CookieOptions } from "express";

export const cookieOptions:CookieOptions = {
    httpOnly:true, secure:true, sameSite:"none", expires: new Date(Date.now() + 604800000)
}