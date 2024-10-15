import express from "express";
import { login, register, setProfilePicture } from "../controllers/userController";
import { upload } from "../middlewares/multer";
import { isUserAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();

userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/set-image").post(isUserAuthenticated, upload.single("profile_image"), setProfilePicture);


export default userRouter;