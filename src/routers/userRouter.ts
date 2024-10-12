import express from "express";
import { register } from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/new").post(register);


export default userRouter;