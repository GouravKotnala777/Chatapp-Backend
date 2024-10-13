import express from "express";
import { login, register } from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/new").post(register);
userRouter.route("/login").post(login);


export default userRouter;